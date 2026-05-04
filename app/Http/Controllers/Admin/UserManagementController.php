<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Seller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /* ─────────────────────────────────────────
     | INDEX
     ───────────────────────────────────────── */
    public function index(Request $request): Response
    {
        $query = User::with('seller');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(
                fn($q) =>
                $q->where('username', 'like', "%$s%")
                    ->orWhere('email',   'like', "%$s%")
                    ->orWhere('phone',   'like', "%$s%")
            );
        }
        if ($request->filled('role'))   $query->where('role',   $request->role);
        if ($request->filled('status')) $query->where('status', $request->status);

        $users = $query->latest('created_at')->paginate(10)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users'      => $users,
            'filters'    => $request->only(['search', 'role', 'status']),
            'totalStats' => [
                'total_users'     => User::count(),
                'total_admins'    => User::where('role', 'admin')->count(),
                'total_sellers'   => User::where('role', 'seller')->count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'total_active'    => User::where('status', 'active')->count(),
            ],
        ]);
    }

    /* ─────────────────────────────────────────
     | CREATE
     ───────────────────────────────────────── */
    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    /* ─────────────────────────────────────────
     | STORE
     ───────────────────────────────────────── */
    public function store(Request $request): RedirectResponse
    {
        // ── FIX 1: Only null-clean the LOCATION fields, NOT password fields.
        // The old code turned password_confirmation '' → null, which broke
        // the 'confirmed' rule even when both password fields were filled.
        $request->merge(
            collect($request->only(['province_id', 'district_id', 'commune_id', 'village_id']))
                ->map(fn($v) => $v === '' ? null : $v)
                ->toArray()
        );

        $validated = $request->validate([
            'username'             => 'required|string|max:50|unique:users,username',
            'email'                => 'required|string|lowercase|email|max:100|unique:users,email',
            'password'             => ['required', 'confirmed', 'min:8'],
            'role'                 => 'required|in:admin,seller,customer',
            'phone'                => 'required|string|max:20|unique:users,phone',
            'status'               => 'required|in:active,inactive,banned',
            'farm_name'            => 'required_if:role,seller|nullable|string|max:100',
            'description'          => 'nullable|string|max:1000',
            'province_id'          => 'required_if:role,seller|nullable|exists:provinces,province_id',
            'district_id'          => 'required_if:role,seller|nullable|exists:districts,district_id',
            'commune_id'           => 'nullable|exists:communes,commune_id',
            'village_id'           => 'nullable|exists:villages,village_id',
        ]);

        // ── FIX 2: User model has 'password' => 'hashed' in $casts.
        // Eloquent will hash the password automatically when saving.
        // DO NOT call Hash::make() here — that would double-hash the password
        // and make login impossible after account creation.
        $user = User::create([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'password' => $validated['password'], // ← plain text; Eloquent cast hashes it
            'role'     => $validated['role'],
            'phone'    => $validated['phone'],
            'status'   => $validated['status'],
        ]);

        if ($validated['role'] === 'seller') {
            Seller::create([
                'user_id'     => $user->user_id,
                'farm_name'   => $validated['farm_name']   ?? null,
                'description' => $validated['description'] ?? null,
                'province_id' => $validated['province_id'] ?? null,
                'district_id' => $validated['district_id'] ?? null,
                'commune_id'  => $validated['commune_id']  ?? null,
                'village_id'  => $validated['village_id']  ?? null,
            ]);
        }

        Log::info('Admin created user', ['user_id' => $user->user_id, 'role' => $user->role]);

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /* ─────────────────────────────────────────
     | EDIT
     ───────────────────────────────────────── */
    public function edit(User $user): Response
    {
        $user->load(['seller', 'seller.province', 'seller.district', 'seller.commune', 'seller.village']);

        return Inertia::render('admin/users/edit', ['user' => $user]);
    }

    /* ─────────────────────────────────────────
     | UPDATE
     ───────────────────────────────────────── */
    public function update(Request $request, User $user): RedirectResponse
    {
        // ── FIX 1 (same): Only null-clean location IDs, not password fields
        $request->merge(
            collect($request->only(['province_id', 'district_id', 'commune_id', 'village_id']))
                ->map(fn($v) => $v === '' ? null : $v)
                ->toArray()
        );

        $validated = $request->validate([
            'username'    => 'required|string|max:50|unique:users,username,' . $user->user_id . ',user_id',
            'email'       => 'required|string|lowercase|email|max:100|unique:users,email,' . $user->user_id . ',user_id',
            'role'        => 'required|in:admin,seller,customer',
            'phone'       => 'required|string|max:20|unique:users,phone,' . $user->user_id . ',user_id',
            'status'      => 'required|in:active,inactive,banned',
            'farm_name'   => 'required_if:role,seller|nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'province_id' => 'required_if:role,seller|nullable|exists:provinces,province_id',
            'district_id' => 'required_if:role,seller|nullable|exists:districts,district_id',
            'commune_id'  => 'nullable|exists:communes,commune_id',
            'village_id'  => 'nullable|exists:villages,village_id',
        ]);

        $user->update([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'role'     => $validated['role'],
            'phone'    => $validated['phone'],
            'status'   => $validated['status'],
        ]);

        // ── Password change (optional) ──────────────────────────────
        // FIX 2: Again, no Hash::make() — the 'hashed' cast handles it.
        // FIX 3: Validate password ONLY when it's actually provided.
        //   The form sends password='' when not changing it.
        //   $request->filled() returns false for '' and null, so we're safe.
        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', 'confirmed', 'min:8'],
            ]);
            // ← plain text; Eloquent 'hashed' cast does the hashing
            $user->update(['password' => $request->password]);
        }

        // ── Seller profile ──────────────────────────────────────────
        if ($validated['role'] === 'seller') {
            $sellerData = [
                'farm_name'   => $validated['farm_name']   ?? null,
                'description' => $validated['description'] ?? null,
                'province_id' => $validated['province_id'] ?? null,
                'district_id' => $validated['district_id'] ?? null,
                'commune_id'  => $validated['commune_id']  ?? null,
                'village_id'  => $validated['village_id']  ?? null,
            ];
            $user->seller
                ? $user->seller->update($sellerData)
                : Seller::create(array_merge($sellerData, ['user_id' => $user->user_id]));
        } else {
            // Role changed away from seller — delete seller profile
            $user->seller?->delete();
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /* ─────────────────────────────────────────
     | DESTROY
     ───────────────────────────────────────── */
    public function destroy(User $user): RedirectResponse
    {
        // ── TEMPORARY DEBUG — remove after confirming this method is hit ──
        // If you see a dump screen when clicking delete, this method IS being called.
        // If you see nothing (page just reloads), the route is wrong.
        // dd('destroy() called for user_id=' . $user->user_id . ' username=' . $user->username);

        // Prevent admin from deleting their own account
        if ((int) $user->user_id === (int) Auth::id()) {
            return redirect()->route('admin.users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $name = $user->username;

        try {
            // Explicitly delete seller profile first to avoid FK constraint
            // violations on databases without ON DELETE CASCADE on sellers.user_id
            if ($user->seller) {
                $user->seller()->delete();
            }

            $user->delete();

            Log::info('Admin deleted user', [
                'user_id'  => $user->user_id,
                'username' => $name,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete user', [
                'user_id'  => $user->user_id,
                'username' => $name,
                'error'    => $e->getMessage(),
            ]);

            return redirect()->route('admin.users.index')
                ->with('error', "Cannot delete \"{$name}\". They may have related records (orders, products).");
        }

        return redirect()->route('admin.users.index')
            ->with('success', "User \"{$name}\" deleted successfully.");
    }
}
