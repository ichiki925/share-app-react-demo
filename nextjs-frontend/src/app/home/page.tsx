'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import Sidebar from '@/components/Sidebar';
import Message from '@/components/Message';
import api from '@/lib/api';
import type { Post } from '@/lib/types';
import styles from './page.module.css';
import Toast from '@/components/Toast';

export default function HomePage() {
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading, getAuthToken } = useFirebaseAuth();

    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/login');
        }
    }, [authLoading, isLoggedIn, router]);

    // 投稿一覧を取得
    useEffect(() => {
        if (isLoggedIn) {
            fetchPosts();
        }
    }, [isLoggedIn]);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            setError('');

            const token = await getAuthToken();
            const response = await api.fetchPosts(token || undefined);

            if (response.status === 'success') {
                setPosts(response.data);
            } else {
                throw new Error('投稿の取得に失敗しました');
            }

        } catch (err: any) {
            setError('投稿の取得に失敗しました: ' + err.message);
            console.error('投稿取得エラー:', err);
        } finally {
            setIsLoading(false);
        }

    };

    const handleLike = async (postId: string) => {
        try {
            setError('');

            const token = await getAuthToken();
            if (!token) {
                router.push('/login');
                return;
            }

            const post = posts.find(p => p.id === Number(postId));
            if (!post) return;

            const isLiked = post.user_liked;

            // 楽観的UI更新
            setPosts(posts.map(p => {
                if (p.id === Number(postId)) {
                    if (isLiked) {
                        return {
                            ...p,
                            likes_count: Math.max(0, p.likes_count - 1),
                            user_liked: false
                        };
                    } else {
                        return {
                            ...p,
                            likes_count: p.likes_count + 1,
                            user_liked: true
                        };
                    }
                }
                return p;
            }));

            // API呼び出し
            if (isLiked) {
                await api.unlikePost(Number(postId), token);
                setSuccessMessage('いいねを取り消しました');
            } else {
                await api.likePost(Number(postId), token);
                setSuccessMessage('いいねしました！');
            }

            setTimeout(() => {
                setSuccessMessage('');
            }, 2000);

        } catch (err: any) {
            // エラー時は投稿を再取得
            await fetchPosts();
            setError('いいねの処理に失敗しました: ' + err.message);
            console.error('いいねエラー:', err);
        }

    };

    const handleDeleteClick = async (postId: string) => {
        const confirmed = confirm('この投稿を削除しますか？');
        if (!confirmed) return;

        try {
            setError('');
            setSuccessMessage('');

            const token = await getAuthToken();
            if (!token) {
                router.push('/login');
                return;
            }

            await api.deletePost(Number(postId), token);

            setSuccessMessage('投稿を削除しました');
            await fetchPosts();

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (err: any) {
            if (err.status === 403) {
                setError('他人の投稿は削除できません');
            } else {
                setError('投稿の削除に失敗しました: ' + err.message);
            }
            console.error('投稿削除エラー:', err);
        }
    };

    const handleDetailClick = (postId: string) => {
        router.push(`/post/${postId}`);
    };

    // 投稿が作成されたときのコールバック
    const handlePostCreated = () => {
        fetchPosts();
    };

    // ローディング中は何も表示しない
    if (authLoading) {
        return (
            <div className={styles.backgroundWrapper}>
                <div className={styles.loading}>読み込み中...</div>
            </div>
        );
    }

    // 未ログインなら何も表示しない（リダイレクト中）
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className={styles.backgroundWrapper}>
            <div className={styles.container}>
                {/* ここにレイアウト本体 */}
                <Sidebar onPostCreated={handlePostCreated} />
                <div className={styles.mainArea}>
                    {/* ヘッダー */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>ホーム</h1>
                    </div>

                    {/* タイムライン */}
                    <div className={styles.timeline}>
                        {isLoading ? (
                            <div className={styles.loading}>投稿を読み込み中...</div>
                        ) : posts.length === 0 ? (
                            <div className={styles.noPosts}>
                                まだ投稿がありません。最初の投稿をしてみましょう！
                            </div>
                        ) : (
                            posts.map((post) => (
                                <Message
                                    key={post.id}
                                    post={{
                                        id: String(post.id),
                                        user_name: post.user_name,
                                        content: post.content,
                                        likes_count: post.likes_count,
                                        is_owner: post.is_owner,
                                        user_liked: post.user_liked,
                                    }}
                                    showDetailButton
                                    onLike={handleLike}
                                    onDelete={handleDeleteClick}
                                    onDetail={handleDetailClick}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ← レイアウトの外でOKだが、ポータルによりどこに書いても実際は body 直下に描画されます */}
            {error && (
                <Toast
                    type="error"
                    message={error}
                    top={16}
                    duration={3000}
                    onClose={() => setError('')}
                />
            )}
            {successMessage && (
                <Toast
                    type="success"
                    message={successMessage}
                    top={64}
                    duration={2000}
                    onClose={() => setSuccessMessage('')}
                />
            )}
        </div>
    );
}