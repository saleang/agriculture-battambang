<?php

namespace App\Providers;

use App\Models\Comment;
use App\Policies\CommentPolicy;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Comment::class => CommentPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => function () {
                return [
                    'user' => \Illuminate\Support\Facades\Auth::user(),
                ];
            },
        ]);
    }
}