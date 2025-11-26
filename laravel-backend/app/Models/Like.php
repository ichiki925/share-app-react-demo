<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Post;
use App\Models\User;

class Like extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
    ];

    protected $casts = [
        'post_id' => 'integer',
        'user_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByPostAndUser($query, $postId, $userId)
    {
        return $query->where('post_id', $postId)->where('user_id', $userId);
    }

    public static function getPostLikesCount($postId)
    {
        return self::where('post_id', $postId)->count();
    }

    public static function isLikedByUser($postId, $userId)
    {
        return self::where('post_id', $postId)
                    ->where('user_id', $userId)
                    ->exists();
    }
}
