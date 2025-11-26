'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import Sidebar from '@/components/Sidebar';
import Message from '@/components/Message';
import Toast from '@/components/Toast';
import api from '@/lib/api';
import styles from './page.module.css';

interface Comment {
    id: string;
    user_name: string;
    content: string;
}

interface Post {
    id: string;
    user_name: string;
    content: string;
    likes_count: number;
    is_owner?: boolean;
    user_liked?: boolean;
    comments?: Comment[];
}

export default function PostDetailPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;
    const { isLoggedIn, isLoading: authLoading, getAuthToken } = useFirebaseAuth();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // 認証チェック
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/login');
        }
    }, [authLoading, isLoggedIn, router]);

    // 投稿詳細を取得
    useEffect(() => {
        if (isLoggedIn) {
            fetchPostDetail();
        }
    }, [postId, isLoggedIn]);

    const fetchPostDetail = async () => {
        try {
            setIsLoading(true);

            const token = await getAuthToken();
            if (!token) {
                router.push('/login');
                return;
            }

            // 投稿詳細とコメントを一緒に取得
            const response = await api.fetchPostWithComments(Number(postId), token);

            if (response.status === 'success') {
                // anyにキャストして型エラーを回避
                const postData = response.data as any;

                setPost({
                    id: String(postData.id),
                    user_name: postData.user_name || postData.user?.name || 'Unknown',
                    content: postData.content,
                    likes_count: postData.likes_count || 0,
                    is_owner: postData.is_owner || false,
                    user_liked: postData.user_liked || false,
                });

                // コメントがpostData.commentsにあるか確認
                if (postData.comments && Array.isArray(postData.comments)) {
                    setComments(postData.comments.map((c: any) => ({
                        id: String(c.id),
                        user_name: c.user_name || c.user?.name || 'Unknown',
                        content: c.content
                    })));
                } else {
                    // コメントがない場合は空配列
                    setComments([]);
                }
            } else {
                throw new Error('投稿の取得に失敗しました');
            }
        } catch (err: any) {
            console.error('詳細エラー:', err);
            setToast({ message: '投稿の取得に失敗しました', type: 'error' });
        } finally {
            setIsLoading(false);
        }

    };

    const handleLike = async (postId: string) => {
        if (!post) return;

        try {
            const token = await getAuthToken();
            if (!token) {
                router.push('/login');
                return;
            }

            const isLiked = post.user_liked;

            // 楽観的UI更新
            if (isLiked) {
                setPost({
                    ...post,
                    likes_count: Math.max(0, post.likes_count - 1),
                    user_liked: false
                });
            } else {
                setPost({
                    ...post,
                    likes_count: post.likes_count + 1,
                    user_liked: true
                });
            }

            // API呼び出し
            if (isLiked) {
                await api.unlikePost(Number(postId), token);
                setToast({ message: 'いいねを取り消しました', type: 'success' });
            } else {
                await api.likePost(Number(postId), token);
                setToast({ message: 'いいねしました！', type: 'success' });
            }

        } catch (err: any) {
            // エラー時は元に戻す
            await fetchPostDetail();
            setToast({ message: 'いいねの処理に失敗しました', type: 'error' });
            console.error('いいねエラー:', err);
        }

    };

    const handleDeletePost = async (postId: string) => {
        const confirmed = confirm('この投稿を削除しますか？');
        if (!confirmed) return;

        try {
            const token = await getAuthToken();
            if (!token) {
                router.push('/login');
                return;
            }

            await api.deletePost(Number(postId), token);

            setToast({ message: '投稿を削除しました', type: 'success' });

            setTimeout(() => {
                router.push('/');
            }, 1500);

        } catch (err: any) {
            if (err.status === 403) {
                setToast({ message: '他人の投稿は削除できません', type: 'error' });
            } else {
                setToast({ message: '投稿の削除に失敗しました', type: 'error' });
            }
            console.error('投稿削除エラー:', err);
        }

    };

    const handleComment = async () => {
        if (!newComment.trim()) {
            setToast({ message: 'コメントを入力してください', type: 'error' });
            return;
        }

        try {
            setIsCommentSubmitting(true);

            const token = await getAuthToken();
            if (!token) {
                router.push('/login');
                return;
            }

            // コメントを投稿
            const response = await api.createComment(
                Number(postId),
                { content: newComment.trim() },
                token
            );

            if (response.status === 'success') {
                // コメントリストを再取得
                await fetchPostDetail();
                setNewComment('');
                setToast({ message: 'コメントしました！', type: 'success' });
            } else {
                throw new Error('コメントの投稿に失敗しました');
            }

        } catch (err: any) {
            setToast({ message: 'コメント投稿に失敗しました', type: 'error' });
            console.error('コメントエラー:', err);
        } finally {
            setIsCommentSubmitting(false);
        }

    };

    // ローディング中は何も表示しない
    if (authLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>読み込み中...</div>
            </div>
        );
    }

    // 未ログインなら何も表示しない（リダイレクト中）
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className={styles.container}>
            {/* Toast表示 */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* サイドバー */}
            <Sidebar />

            {/* メインエリア */}
            <div className={styles.main}>
                {/* ヘッダー */}
                <header className={styles.mainHeader}>
                    <h1>コメント</h1>
                </header>

                {/* ローディング */}
                {isLoading && (
                    <div className={styles.loading}>
                        投稿を読み込み中...
                    </div>
                )}

                {/* 投稿詳細 */}
                {!isLoading && post && (
                    <div className={styles.detailContent}>
                        <div className={styles.originalPost}>
                            <Message
                                post={post}
                                showDetailButton={false}
                                onLike={handleLike}
                                onDelete={handleDeletePost}
                                onDetail={() => {}}
                            />
                        </div>

                        <div className={styles.commentsSection}>
                            <h3 className={styles.commentsTitle}>コメント</h3>

                            <div className={styles.commentsList}>
                                {comments.length === 0 ? (
                                    <div className={styles.noComments}>
                                        まだコメントがありません
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className={styles.commentItem}>
                                            <div className={styles.commentHeader}>
                                                <span className={styles.commentUser}>{comment.user_name}</span>
                                            </div>
                                            <p className={styles.commentContent}>{comment.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className={styles.commentForm}>
                            <div className={styles.commentInputContainer}>
                                <input
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    type="text"
                                    className={styles.commentInput}
                                    placeholder="コメントを入力..."
                                    maxLength={120}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleComment();
                                        }
                                    }}
                                    disabled={isCommentSubmitting}
                                />
                            </div>
                            <div className={styles.commentBtnContainer}>
                                <button
                                    className={styles.commentBtn}
                                    onClick={handleComment}
                                    disabled={isCommentSubmitting || !newComment.trim()}
                                >
                                    {isCommentSubmitting ? 'コメント中...' : 'コメント'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 投稿が見つからない */}
                {!isLoading && !post && (
                    <div className={styles.notFound}>
                        投稿が見つかりません
                    </div>
                )}
            </div>
        </div>
    );
}