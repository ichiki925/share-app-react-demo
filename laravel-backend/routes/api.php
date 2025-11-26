<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\Api\DemoController;



Route::middleware('firebase.auth')->get('/user', function (Request $request) {
    $user = $request->attributes->get('firebase_user');
    return response()->json([
        'success' => true,
        'user' => $user
    ]);
});

Route::middleware('optional.firebase.auth')->prefix('posts')->group(function () {
    Route::get('/', [PostController::class, 'index']);
});


Route::middleware('firebase.auth')->prefix('posts')->group(function () {
    Route::post('/', [PostController::class, 'store']);
    Route::get('/user/{user_id}', [PostController::class, 'byUser']);
    Route::get('/{post}', [PostController::class, 'show']);
    Route::delete('/{post}', [PostController::class, 'destroy']);
    Route::post('/{post}/like', [PostController::class, 'like']);
    Route::delete('/{post}/like', [PostController::class, 'unlike']);
    Route::get('/{post}/like/status', [PostController::class, 'checkLikeStatus']);
    Route::get('/{post}/comments', [PostController::class, 'getComments']);
    Route::post('/{post}/comments', [PostController::class, 'storeComment']);
});

Route::post('/demo/reset', [DemoController::class, 'reset']);
