<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Seller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    // Display listing of users.
    public function index(Request $request): Response
    {
        $query = User::with('seller');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $users = $query->latest('created_at')
                       ->paginate(10)
                       ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|string|lowercase|email|max:100|unique:users,email',
            'password' => ['required', 'confirmed', 'min:3'],//Rules\Password::defaults()
            'role' => 'required|in:admin,seller,customer',
            'phone' => 'required|string|max:20',
            'status' => 'required|in:active,inactive,banned',
            'farm_name' => 'required_if:role,seller|nullable|string|max:100',
            'location_district' => 'required_if:role,seller|nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
        ]);

        if ($validated['role'] === 'seller') {
            Seller::create([
                'user_id' => $user->user_id,
                'farm_name' => $validated['farm_name'],
                'location_district' => $validated['location_district'],
                'description' => $validated['description'] ?? null,
            ]);
        }
        Log::info('New user created', ['user_id' => $user->user_id, 'role' => $user->role]);
        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing the user.
     */
    public function edit(User $user): Response
    {
        $user->load('seller');

        return Inertia::render('admin/users/edit', [
            'user' => $user
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        // Debug incoming request to help diagnose method/URL/payload issues
        Log::debug('User update incoming', [
            'method' => $request->method(),
            'uri' => $request->path(),
            'input' => $request->all(),
        ]);

        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username,' . $user->user_id . ',user_id',
            'email' => 'required|string|lowercase|email|max:100|unique:users,email,' . $user->user_id . ',user_id',
            'role' => 'required|in:admin,seller,customer',
            'phone' => 'required|string|max:20',
            'status' => 'required|in:active,inactive,banned',
            'farm_name' => 'required_if:role,seller|nullable|string|max:100',
            'location_district' => 'required_if:role,seller|nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        $user->update([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
        ]);

        // Update password if provided
        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', 'confirmed','min:3' ],//Rules\Password::defaults()   
            ]);
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        // Handle seller profile
        if ($validated['role'] === 'seller') {
            if ($user->seller) {
                $user->seller->update([
                    'farm_name' => $validated['farm_name'],
                    'location_district' => $validated['location_district'],
                    'description' => $validated['description'] ?? null,
                ]);
            } else {
                Seller::create([
                    'user_id' => $user->user_id,
                    'farm_name' => $validated['farm_name'],
                    'location_district' => $validated['location_district'],
                    'description' => $validated['description'] ?? null,
                ]);
            }
        } else {
            // If changing from seller to another role, delete seller profile
            if ($user->seller) {
                $user->seller->delete();
            }
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent deleting own account
        if ($user->user_id === Auth::user()->user_id) {
            return redirect()->route('admin.users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
