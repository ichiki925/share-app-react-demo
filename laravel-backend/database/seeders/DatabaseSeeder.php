<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // デモユーザー2を作成
        $user2 = DB::table('users')->insertGetId([
            'firebase_uid' => 'demo_user_2',
            'name' => 'デモユーザー2',
            'email' => 'demo2@example.com',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // デモユーザー3を作成
        $user3 = DB::table('users')->insertGetId([
            'firebase_uid' => 'demo_user_3',
            'name' => 'デモユーザー3',
            'email' => 'demo3@example.com',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // デモユーザー2の投稿
        $post1 = DB::table('posts')->insertGetId([
            'user_id' => $user2,
            'content' => '週末の予定を考え中🤔',
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(2),
        ]);

        $post2 = DB::table('posts')->insertGetId([
            'user_id' => $user2,
            'content' => '今日はいい天気だ☀️',
            'created_at' => now()->subHours(5),
            'updated_at' => now()->subHours(5),
        ]);

        $post3 = DB::table('posts')->insertGetId([
            'user_id' => $user2,
            'content' => '久しぶりにカフェでのんびり☕',
            'created_at' => now()->subHours(8),
            'updated_at' => now()->subHours(8),
        ]);

        // デモユーザー3の投稿
        $post4 = DB::table('posts')->insertGetId([
            'user_id' => $user3,
            'content' => 'おはようございます！今日も一日頑張りましょう💪',
            'created_at' => now()->subHours(1),
            'updated_at' => now()->subHours(1),
        ]);

        $post5 = DB::table('posts')->insertGetId([
            'user_id' => $user3,
            'content' => '最近読んだ本が面白かった📚',
            'created_at' => now()->subHours(4),
            'updated_at' => now()->subHours(4),
        ]);

        $post6 = DB::table('posts')->insertGetId([
            'user_id' => $user3,
            'content' => '明日は晴れるかな？',
            'created_at' => now()->subHours(7),
            'updated_at' => now()->subHours(7),
        ]);
    }
}
