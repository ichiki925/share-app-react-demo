import {
    Post,
    Comment,
    ApiResponse,
    ApiError,
    CreatePostRequest,
    CreateCommentRequest
} from './types'

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost'

// エラーハンドリング用のユーティリティ関数
class ApiClient {
    private static async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const config: RequestInit = {
            ...options,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
        }

        try {
            const response = await fetch(url, config)
            const data = await response.json()

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'リクエストが失敗しました',
                    ...data
                } as ApiError
            }

            return data
        } catch (error: any) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw {
                    status: 'error',
                    message: 'サーバーに接続できません'
                } as ApiError
            }
            throw error
        }
    }

    // 認証ヘッダーを含むリクエスト
    private static async authenticatedRequest<T>(
        endpoint: string,
        token: string,
        options: RequestInit = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        })
    }

    // 投稿一覧を取得
    static async fetchPosts(token?: string): Promise<ApiResponse<Post[]>> {
        if (token) {
            return this.authenticatedRequest<ApiResponse<Post[]>>('/api/posts', token)
        } else {
            return this.request<ApiResponse<Post[]>>('/api/posts')
        }
    }

    // 新しい投稿を作成
    static async createPost(
        data: CreatePostRequest,
        token: string
    ): Promise<ApiResponse<Post>> {
        return this.authenticatedRequest<ApiResponse<Post>>('/api/posts', token, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    // 投稿を削除
    static async deletePost(postId: number, token: string): Promise<ApiResponse<null>> {
        return this.authenticatedRequest<ApiResponse<null>>(
            `/api/posts/${postId}`,
            token,
            {
                method: 'DELETE',
            }
        )
    }

    // いいねを追加
    static async likePost(postId: number, token: string): Promise<ApiResponse<null>> {
        return this.authenticatedRequest<ApiResponse<null>>(
            `/api/posts/${postId}/like`,
            token,
            {
                method: 'POST',
            }
        )
    }

    // いいねを削除
    static async unlikePost(postId: number, token: string): Promise<ApiResponse<null>> {
        return this.authenticatedRequest<ApiResponse<null>>(
            `/api/posts/${postId}/like`,
            token,
            {
                method: 'DELETE',
            }
        )
    }

    // 投稿詳細とコメントを取得
    static async fetchPostWithComments(
        postId: number,
        token?: string
    ): Promise<ApiResponse<{ post: Post; comments: Comment[] }>> {
        if (token) {
            return this.authenticatedRequest<ApiResponse<{ post: Post; comments: Comment[] }>>(
                `/api/posts/${postId}`,
                token
            )
        } else {
            return this.request<ApiResponse<{ post: Post; comments: Comment[] }>>(
                `/api/posts/${postId}`
            )
        }
    }

    // コメントを作成
    static async createComment(
        postId: number,
        data: CreateCommentRequest,
        token: string
    ): Promise<ApiResponse<Comment>> {
        return this.authenticatedRequest<ApiResponse<Comment>>(
            `/api/posts/${postId}/comments`,
            token,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        )
    }
}

// エクスポートする関数（使いやすくするため）
export const api = {
    fetchPosts: (token?: string) => ApiClient.fetchPosts(token),
    createPost: (data: CreatePostRequest, token: string) => 
        ApiClient.createPost(data, token),
    deletePost: (postId: number, token: string) => 
        ApiClient.deletePost(postId, token),
    fetchPostWithComments: (postId: number, token?: string) => 
        ApiClient.fetchPostWithComments(postId, token),
    likePost: (postId: number, token: string) => 
        ApiClient.likePost(postId, token),
    unlikePost: (postId: number, token: string) => 
        ApiClient.unlikePost(postId, token),
    createComment: (postId: number, data: CreateCommentRequest, token: string) => 
        ApiClient.createComment(postId, data, token),
}

export default api