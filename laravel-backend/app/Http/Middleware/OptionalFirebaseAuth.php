<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class OptionalFirebaseAuth
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            try {
                $firebaseMiddleware = app('App\Http\Middleware\FirebaseAuthMiddleware');
                return $firebaseMiddleware->handle($request, $next);
            } catch (\Exception $e) {
                \Log::warning('Optional Firebase auth failed: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}
