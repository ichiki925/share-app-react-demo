<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;
use Exception;

class FirebaseAuthMiddleware
{
    private $auth;

    public function __construct()
    {
        try {
            $factory = (new Factory)
                ->withServiceAccount(config('services.firebase.credentials'))
                ->withProjectId(config('services.firebase.project_id'));
            $this->auth = $factory->createAuth();
        } catch (Exception $e) {
            \Log::error('Firebase Auth initialization failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'error' => 'Authorization header missing or invalid'
            ], 401);
        }

        try {
            $token = substr($authHeader, 7);
            $cacheKey = 'firebase_user_' . hash('sha256', $token);

            $cachedUser = Cache::get($cacheKey);

            if ($cachedUser) {
                $request->attributes->set('firebase_user', $cachedUser);
                return $next($request);
            }

            $verifiedIdToken = $this->auth->verifyIdToken($token);
            $firebaseUser = $this->auth->getUser($verifiedIdToken->claims()->get('sub'));

            $user = (object) [
                'id' => $firebaseUser->uid,
                'email' => $firebaseUser->email,
                'name' => $firebaseUser->displayName,
                'email_verified' => $firebaseUser->emailVerified,
            ];

            Cache::put($cacheKey, $user, 600);
            $request->attributes->set('firebase_user', $user);

            return $next($request);

        } catch (Exception $e) {
            \Log::error('Firebase auth error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Invalid or expired token',
                'message' => $e->getMessage()
            ], 401);
        }
    }
}