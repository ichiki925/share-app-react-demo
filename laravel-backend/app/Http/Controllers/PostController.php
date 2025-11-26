<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    private function getFirebaseUser(Request $request)
    {
        $firebaseUser = $request->attributes->get('firebase_user');

        if ($firebaseUser) {

            return User::syncFromFirebase($firebaseUser);
        }

        return null;
    }

    public function index()
    {
        try {
            $posts = Post::with(['user'])
                    ->withCount(['likes', 'comments'])
                    ->latest()
                    ->get();

            $currentUser = null;
            $userLikedPostIds = [];

            if (request()->attributes->has('firebase_user')) {
                $currentUser = $this->getFirebaseUser(request());

                if ($currentUser) {
                    $userLikedPostIds = \App\Models\Like::where('user_id', $currentUser->id)
                        ->whereIn('post_id', $posts->pluck('id'))
                        ->pluck('post_id')
                        ->toArray();
                }
            }

            $posts = $posts->map(function ($post) use ($currentUser, $userLikedPostIds) {
                $postArray = $post->toArray();
                $postArray['user_name'] = $post->user ? $post->user->name : 'Unknown';
                $postArray['is_owner'] = $currentUser && (int)$currentUser->id === (int)$post->user_id;
                $postArray['user_liked'] = in_array($post->id, $userLikedPostIds);

                return $postArray;
            });

            return response()->json([
                'status' => 'success',
                'data' => $posts
            ]);
        } catch (\Exception $e) {
            \Log::error('Post index error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '投稿の取得に失敗しました'
            ], 500);
        }
    }

    public function store(Request $request)

    {
        try {
            $validated = $request->validate([
                'content' => 'required|string|max:120'
            ]);

            $user = $this->getFirebaseUser($request);
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ユーザー認証が必要です'
                ], 401);
            }

            $validated['user_id'] = $user->id;

            $post = Post::create($validated);
            $post->load('user');
            $post->loadCount(['likes', 'comments']);

            $postArray = $post->toArray();
            $postArray['user_name'] = $post->user ? $post->user->name : 'Unknown';
            $postArray['is_owner'] = true;
            $postArray['user_liked'] = false;

            return response()->json([
                'status' => 'success',
                'message' => '投稿が作成されました',
                'data' => $postArray
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'バリデーションエラー',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => '投稿の作成に失敗しました'
            ], 500);
        }
    }

    public function show(Post $post)
    {
        try {
            $post->load(['user', 'comments.user'])
                ->loadCount(['likes', 'comments']);

            $user = $this->getFirebaseUser(request());
            $postData = $post->toArray();

            $postData['user_name'] = $post->user ? $post->user->name : 'Unknown';
            $postData['is_owner'] = $user && (int)$user->id === (int)$post->user_id;
            $postData['user_liked'] = $user ? $post->isLikedByUser($user->id) : false;

            if (isset($postData['comments'])) {
                $postData['comments'] = collect($postData['comments'])->map(function ($comment) use ($user) {
                    $comment['user_name'] = $comment['user']['name'] ?? 'Unknown';
                    $comment['is_owner'] = $user && (int)$user->id === (int)$comment['user_id']; // use文を追加
                    return $comment;
                })->toArray();
            }

            return response()->json([
                'status' => 'success',
                'data' => $postData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => '投稿の取得に失敗しました'
            ], 500);
        }
    }

    public function destroy(Request $request, Post $post)
    {
        try {
            $user = $this->getFirebaseUser($request);
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ユーザー認証が必要です'
                ], 401);
            }

            if ((int)$user->id !== (int)$post->user_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => '他人の投稿は削除できません'
                ], 403);
            }

            $post->delete();

            return response()->json([
                'status' => 'success',
                'message' => '投稿が削除されました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => '投稿の削除に失敗しました'
            ], 500);
        }
    }

    public function like(Request $request, Post $post)
    {
        try {
            $user = $this->getFirebaseUser($request);
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ユーザー認証が必要です'
                ], 401);
            }

            $existingLike = Like::byPostAndUser($post->id, $user->id)->first();

            if ($existingLike) {
                return response()->json([
                    'status' => 'error',
                    'message' => '既にいいねしています'
                ], 400);
            }

            DB::transaction(function () use ($post, $user) {
                Like::create([
                    'post_id' => $post->id,
                    'user_id' => $user->id,
                ]);
            });

            return response()->json([
                'status' => 'success',
                'message' => 'いいねしました',
                'data' => $post->fresh(['user'])->loadCount('likes')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'いいねに失敗しました'
            ], 500);
        }
    }

    public function unlike(Request $request, Post $post)
    {
        try {
            $user = $this->getFirebaseUser($request);
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ユーザー認証が必要です'
                ], 401);
            }

            $like = Like::byPostAndUser($post->id, $user->id)->first();

            if (!$like) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'いいねしていません'
                ], 400);
            }

            DB::transaction(function () use ($like) {
                $like->delete();
            });

            return response()->json([
                'status' => 'success',
                'message' => 'いいねを取り消しました',
                'data' => $post->fresh(['user'])->loadCount('likes')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'いいね取り消しに失敗しました'
            ], 500);
        }
    }

    public function checkLikeStatus(Request $request, Post $post)
    {
        try {
            $user = $this->getFirebaseUser($request);
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ユーザー認証が必要です'
                ], 401);
            }

            $isLiked = Like::isLikedByUser($post->id, $user->id);
            $likesCount = Like::getPostLikesCount($post->id);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'is_liked' => $isLiked,
                    'likes_count' => $likesCount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'いいね状態の取得に失敗しました'
            ], 500);
        }
    }

    public function byUser(string $userId)
    {
        try {
            $posts = Post::with('user')
                    ->withCount(['likes', 'comments'])
                    ->byUser($userId)
                    ->latest()
                    ->get();

            $posts = $posts->map(function ($post) {
                $postArray = $post->toArray();
                $postArray['user_name'] = $post->user ? $post->user->name : 'Unknown';
                return $postArray;
            });

            return response()->json([
                'status' => 'success',
                'data' => $posts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => '投稿の取得に失敗しました'
            ], 500);
        }
    }

    public function getComments(string $postId)
    {
        try {
            $post = Post::findOrFail($postId);
            $comments = Comment::with('user')
                        ->byPost($postId)
                        ->latest()
                        ->get();

            $comments = $comments->map(function ($comment) {
                $commentArray = $comment->toArray();
                $commentArray['user_name'] = $comment->user ? $comment->user->name : 'Unknown';
                return $commentArray;
            });

            return response()->json([
                'status' => 'success',
                'data' => $comments
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => '投稿が見つかりません'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'コメントの取得に失敗しました'
            ], 500);
        }
    }

    public function storeComment(Request $request, string $postId)
    {
        try {
            $post = Post::findOrFail($postId);
            $user = $this->getFirebaseUser($request);
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ユーザー認証が必要です'
                ], 401);
            }

            $validated = $request->validate([
                'content' => 'required|string|max:120'
            ]);

            $validated['post_id'] = $postId;
            $validated['user_id'] = $user->id;

            $comment = DB::transaction(function () use ($validated) {
                return Comment::create($validated);
            });

            $comment->load('user');

            $commentArray = $comment->toArray();
            $commentArray['user_name'] = $comment->user ? $comment->user->name : 'Unknown';

            return response()->json([
                'status' => 'success',
                'message' => 'コメントが作成されました',
                'data' => $commentArray
            ], 201);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => '投稿が見つかりません'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'バリデーションエラー',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'コメントの作成に失敗しました'
            ], 500);
        }
    }
}
