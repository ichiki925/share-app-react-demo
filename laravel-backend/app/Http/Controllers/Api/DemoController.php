<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DemoController extends Controller
{
    /**
     * デモデータをリセット
     */
    public function reset(Request $request)
    {
        try {
            // Firebase UIDを取得
            $firebaseUid = $request->input('firebase_uid');

            if ($firebaseUid) {
                // Firebase UIDからuser_idを取得
                $user = DB::table('users')->where('firebase_uid', $firebaseUid)->first();
                
                if ($user) {
                    // user_idを使って投稿を削除
                    DB::table('posts')->where('user_id', $user->id)->delete();
                    DB::table('comments')->where('user_id', $user->id)->delete();
                    DB::table('likes')->where('user_id', $user->id)->delete();
                    
                    return response()->json([
                        'status' => 'success',
                        'message' => 'デモユーザーの投稿をリセットしました'
                    ]);
                } else {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'ユーザーが見つかりません'
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 'success',
                    'message' => 'リセット対象なし'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}