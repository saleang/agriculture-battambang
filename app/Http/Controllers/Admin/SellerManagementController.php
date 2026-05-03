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

class SellerManagementController extends Controller
{
    /* ─────────────────────────────────────────
     | INDEX
     ───────────────────────────────────────── */
    public function index(Request $request): Response
    {
        $query = User::with(['seller', 'seller.province', 'seller.district'])
            ->where('role', 'seller');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('username', 'like', "%$s%")
                    ->orWhere('email',   'like', "%$s%")
                    ->orWhere('phone',   'like', "%$s%")
                    ->orWhereHas(
                        'seller',
                        fn($sq) =>
                        $sq->where('farm_name', 'like', "%$s%")
                    );
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sellers = $query->latest('created_at')->paginate(12)->withQueryString();

        // Global totals — not affected by filters
        $totalStats = [
            'total'    => User::where('role', 'seller')->count(),
            'active'   => User::where('role', 'seller')->where('status', 'active')->count(),
            'inactive' => User::where('role', 'seller')->where('status', 'inactive')->count(),
            // 'banned'   => User::where('role', 'seller')->where('status', 'banned')->count(),
        ];

        return Inertia::render('admin/sellers/index', [
            'sellers'    => $sellers,
            'filters'    => $request->only(['search', 'status']),
            'totalStats' => $totalStats,
        ]);
    }

    /* ─────────────────────────────────────────
     | CREATE
     ───────────────────────────────────────── */
    public function create(): Response
    {
        return Inertia::render('admin/sellers/create');
    }

    /* ─────────────────────────────────────────
     | STORE
     ───────────────────────────────────────── */
    public function store(Request $request): RedirectResponse
    {
        // Only null-clean location fields — NOT password fields
        $request->merge(
            collect($request->only(['province_id', 'district_id', 'commune_id', 'village_id']))
                ->map(fn($v) => $v === '' ? null : $v)
                ->toArray()
        );

        $validated = $request->validate([
            'username'    => 'required|string|max:50|unique:users,username',
            'email'       => 'required|string|lowercase|email|max:100|unique:users,email',
            'password'    => ['required', 'confirmed', 'min:8'],
            'phone'       => 'required|string|max:20',
            'status'      => 'required|in:active,inactive,banned',
            'farm_name'   => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'province_id' => 'required|exists:provinces,province_id',
            'district_id' => 'required|exists:districts,district_id',
            'commune_id'  => 'nullable|exists:communes,commune_id',
            'village_id'  => 'nullable|exists:villages,village_id',
        ]);

        // User model has 'password' => 'hashed' in $casts — pass plain text
        $user = User::create([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'role'     => 'seller',
            'phone'    => $validated['phone'],
            'status'   => $validated['status'],
        ]);

        Seller::create([
            'user_id'     => $user->user_id,
            'farm_name'   => $validated['farm_name'],
            'description' => $validated['description'] ?? null,
            'province_id' => $validated['province_id'] ?? null,
            'district_id' => $validated['district_id'] ?? null,
            'commune_id'  => $validated['commune_id']  ?? null,
            'village_id'  => $validated['village_id']  ?? null,
        ]);

        Log::info('Admin created seller', ['user_id' => $user->user_id]);

        return redirect()->route('admin.sellers.index')
            ->with('success', 'Seller created successfully.');
    }

    /* ─────────────────────────────────────────
     | EDIT
     ───────────────────────────────────────── */
    public function edit(User $user): Response
    {
        if ($user->role !== 'seller') abort(404);

        $user->load(['seller', 'seller.province', 'seller.district', 'seller.commune', 'seller.village']);

        return Inertia::render('admin/sellers/edit', ['seller' => $user]);
    }

    /* ─────────────────────────────────────────
     | UPDATE
     ───────────────────────────────────────── */
    public function update(Request $request, User $user): RedirectResponse
    {
        if ($user->role !== 'seller') abort(404);

        // Only null-clean location fields
        $request->merge(
            collect($request->only(['province_id', 'district_id', 'commune_id', 'village_id']))
                ->map(fn($v) => $v === '' ? null : $v)
                ->toArray()
        );

        $validated = $request->validate([
            'username'    => 'required|string|max:50|unique:users,username,' . $user->user_id . ',user_id',
            'email'       => 'required|string|lowercase|email|max:100|unique:users,email,' . $user->user_id . ',user_id',
            'phone'       => 'required|string|max:20',
            'status'      => 'required|in:active,inactive,banned',
            'farm_name'   => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'province_id' => 'required|exists:provinces,province_id',
            'district_id' => 'required|exists:districts,district_id',
            'commune_id'  => 'nullable|exists:communes,commune_id',
            'village_id'  => 'nullable|exists:villages,village_id',
        ]);

        $user->update([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'phone'    => $validated['phone'],
            'status'   => $validated['status'],
        ]);

        // Password — only if provided; pass plain text (cast handles hashing)
        if ($request->filled('password')) {
            $request->validate(['password' => ['required', 'confirmed', 'min:8']]);
            $user->update(['password' => $request->password]);
        }

        $sellerData = [
            'farm_name'   => $validated['farm_name'],
            'description' => $validated['description'] ?? null,
            'province_id' => $validated['province_id'] ?? null,
            'district_id' => $validated['district_id'] ?? null,
            'commune_id'  => $validated['commune_id']  ?? null,
            'village_id'  => $validated['village_id']  ?? null,
        ];

        $user->seller
            ? $user->seller->update($sellerData)
            : Seller::create(array_merge($sellerData, ['user_id' => $user->user_id]));

        return redirect()->route('admin.sellers.index')
            ->with('success', 'Seller updated successfully.');
    }

    /* ─────────────────────────────────────────
     | DESTROY
     ───────────────────────────────────────── */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->role !== 'seller') abort(404);

        if ((int) $user->user_id === (int) Auth::id()) {
            return redirect()->route('admin.sellers.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $name = $user->username;

        try {
            if ($user->seller) {
                $user->seller()->delete();
            }
            $user->delete();
            Log::info('Admin deleted seller', ['user_id' => $user->user_id, 'username' => $name]);
        } catch (\Exception $e) {
            Log::error('Failed to delete seller', ['error' => $e->getMessage()]);
            return redirect()->route('admin.sellers.index')
                ->with('error', "Cannot delete \"{$name}\". They may have related records.");
        }

        return redirect()->route('admin.sellers.index')
            ->with('success', "Seller \"{$name}\" deleted successfully.");
    }
}