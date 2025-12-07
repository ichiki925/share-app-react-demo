'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import api from '@/lib/api'
import { CreatePostRequest } from '@/lib/types'
import Toast from '@/components/Toast'

interface SidebarProps {
    onPostCreated?: () => void
}

export default function Sidebar({ onPostCreated }: SidebarProps) {
    const router = useRouter()
    const { user, logout, getAuthToken } = useFirebaseAuth()

    const [newPost, setNewPost] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null)

    const MAX_LENGTH = 120

    const handleLogout = async () => {
        if (!confirm('ログアウトしますか？')) return

        try {
            await logout()
            router.push('/login')
        } catch (err) {
            console.error('ログアウトエラー:', err)
        }
    }

    // 投稿処理
    const handleShare = async () => {
        if (!user) {
            router.push('/login')
            return
        }

        const content = newPost.trim()

        if (!content) {
            setError('投稿内容を入力してください')
            return
        }

        if (content.length > MAX_LENGTH) {
            setError(`投稿は${MAX_LENGTH}文字以内で入力してください`)
            return
        }

        try {
            setIsSubmitting(true)
            setError('')

            const token = await getAuthToken()
            if (!token) {
                router.push('/login')
                return
            }

            const postData: CreatePostRequest = { content }
            await api.createPost(postData, token)

            // 成功処理
            setNewPost('')
            setToast({ message: '投稿しました！', type: 'success' })

            // 親コンポーネントに投稿作成を通知
            if (onPostCreated) {
                onPostCreated()
            }

        } catch (err: any) {
            console.error('投稿エラー:', err)
            if (err.status === 401) {
                await logout()
                router.push('/login')
            } else {
                setError('投稿に失敗しました: ' + (err.message || '不明なエラー'))
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    // エラーメッセージを5秒後に自動消去
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    return (
        <div className="sidebar">
            {/* Toast表示 */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* ヘッダー */}
            <div className="sidebar-header">
                <img src="/images/logo.png" alt="SHARE" className="logo" />
            </div>

            {/* ナビゲーション */}
            <nav className="nav">
                <button
                    onClick={() => router.push('/')}
                    className="nav-item"
                >
                    <img src="/images/home.png" alt="ホーム" className="nav-icon" />
                    ホーム
                </button>

                <button
                    onClick={handleLogout}
                    className="nav-item logout-btn"
                >
                    <img src="/images/logout.png" alt="ログアウト" className="nav-icon" />
                    ログアウト
                </button>
            </nav>

            {/* 投稿フォーム */}
            <div className="share-section">
                <h3 className="share-title">シェア</h3>

                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="share-textarea"
                    placeholder="今何してる？"
                    maxLength={MAX_LENGTH}
                    disabled={isSubmitting}
                />

                <div className="character-count">
                    {newPost.length}/{MAX_LENGTH}
                </div>

                <button
                    onClick={handleShare}
                    disabled={isSubmitting || !newPost.trim()}
                    className="share-btn"
                >
                    {isSubmitting ? '投稿中...' : 'シェアする'}
                </button>

                {/* エラーメッセージ */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

            </div>

            <style jsx>{`
                .sidebar {
                    width: 300px;
                    background-color: transparent;
                    padding: 1.5rem;
                    flex-shrink: 0;
                    height: 100vh;
                    overflow-y: auto;
                }

                .sidebar-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                }

                .logo {
                    height: 2rem;
                    width: auto;
                }

                .nav {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    border-radius: 0.5rem;
                    text-decoration: none;
                    color: white;
                    transition: background-color 0.3s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    width: 100%;
                    text-align: left;
                }

                .nav-item:hover {
                    background-color: rgba(51, 51, 51, 0.5);
                }

                .logout-btn:hover {
                    background-color: rgba(127, 29, 29, 0.5) !important;
                }

                .nav-icon {
                    width: 1.5rem;
                    height: 1.5rem;
                    object-fit: contain;
                }

                .share-section {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .share-title {
                    font-size: 1.125rem;
                    margin-bottom: 1rem;
                    color: white;
                    align-self: flex-start;
                }

                .share-textarea {
                    width: 100%;
                    height: 150px;
                    padding: 0.75rem;
                    border: 1px solid #ffffff;
                    border-radius: 0.5rem;
                    background-color: transparent;
                    backdrop-filter: none;
                    color: white;
                    resize: vertical;
                    font-family: inherit;
                    margin-bottom: 0.5rem;
                    box-sizing: border-box;
                }

                .share-textarea:focus {
                    outline: none;
                }


                .share-textarea:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .share-textarea::placeholder {
                    color: #ffffff;
                }

                .character-count {
                    align-self: flex-end;
                    font-size: 0.875rem;
                    color: #ffffff;
                    margin-bottom: 1rem;
                }

                .share-btn {
                    position: relative;
                    display: inline-block;
                    padding: 8px 28px;
                    color: #ffffff;
                    background: #12cdaaff;
                    border-radius: 9999px;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.3s, opacity 0.3s;
                }

                .share-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .share-btn::before {
                    --outline: #ffffff;
                    --thick: 2px;
                    --spread: 0px;
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    pointer-events: none;
                    box-shadow:
                        0 calc(-1*var(--thick)) 0 var(--spread) var(--outline),
                        calc(-1*var(--thick)) 0 0 var(--spread) var(--outline);
                }

                .share-btn:hover:not(:disabled) {
                    background-color: #13dcb7ff;
                }

                .error-message {
                    background-color: #7f1d1d;
                    color: white;
                    padding: 0.75rem;
                    margin-top: 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    align-self: stretch;
                }

                /* レスポンシブ対応 */
                @media (max-width: 768px) {
                    .sidebar {
                        width: 100%;
                        padding: 1rem;
                        height: auto;
                        max-height: none;
                        overflow-y: visible;
                    }

                    .sidebar-header {
                        margin-bottom: 1rem;
                        padding-bottom: 0.5rem;
                    }

                    .nav {
                        margin-bottom: 1rem;
                        padding-bottom: 0.5rem;
                    }

                    .nav-item {
                        padding: 0.5rem;
                        margin-bottom: 0.25rem;
                        font-size: 0.9rem;
                    }

                    .nav-icon {
                        width: 1.25rem;
                        height: 1.25rem;
                    }

                    .share-section {
                        margin-bottom: 1rem;
                    }

                    .share-title {
                        margin-bottom: 0.5rem;
                        font-size: 1rem;
                    }

                    .share-textarea {
                        height: 80px;
                        margin-bottom: 0.5rem;
                        font-size: 16px;
                        padding: 0.5rem;
                    }

                    .share-btn {
                        padding: 6px 20px;
                        font-size: 0.9rem;
                    }
                }

                @media (max-width: 480px) {
                    .sidebar {
                        padding: 0.75rem;
                        max-height: 50vh;
                    }

                    .share-textarea {
                        height: 60px;
                        font-size: 16px;
                    }
                }
            `}</style>
        </div>
    )
}