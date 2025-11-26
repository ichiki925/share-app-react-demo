// ユーザーの型定義
export interface User {
    id: number
    firebase_uid: string
    name: string
    email: string
    email_verified_at?: string | null
    created_at: string
    updated_at: string
}

// 投稿の型定義
export interface Post {
    id: number
    user_id: number
    user_name: string
    content: string
    likes_count: number
    is_owner?: boolean
    user_liked: boolean
    created_at: string
    updated_at: string
}

// コメントの型定義
export interface Comment {
    id: number
    post_id: number
    user_id: number
    user_name: string
    content: string
    created_at: string
    updated_at: string
}

// いいねの型定義
export interface Like {
    id: number
    post_id: number
    user_id: number
    created_at: string
    updated_at: string
}

// API レスポンスの型定義
export interface ApiResponse<T> {
    status: 'success' | 'error'
    data: T
    message?: string
}

// エラーレスポンスの型定義
export interface ApiError {
    status: 'error'
    message: string
    errors?: Record<string, string[]>
}

// 投稿作成リクエストの型定義
export interface CreatePostRequest {
    content: string
}

// 投稿更新リクエストの型定義
export interface UpdatePostRequest {
    content: string
}

// コメント作成リクエストの型定義
export interface CreateCommentRequest {
    content: string
}

// Firebase認証ユーザーの型定義
export interface FirebaseUser {
    uid: string
    email: string | null
    displayName: string | null
    emailVerified: boolean
}

// 認証状態の型定義
export interface AuthState {
    user: FirebaseUser | null
    isLoading: boolean
    isLoggedIn: boolean
}

// フォームエラーの型定義
export interface FormErrors {
    [key: string]: string
}

// 投稿フォームの状態型定義
export interface PostFormState {
    content: string
    isSubmitting: boolean
    error: string
}

