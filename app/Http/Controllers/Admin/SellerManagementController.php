<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Seller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class SellerManagementController extends Controller
{
    /**
     * Display a listing of sellers only
     */
    
    public function index(Request $request): Response
    {
        $query = User::with('seller')->where('role', 'seller');

        // Search by username, email, phone, or farm name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($sq) use ($search) {
                        $sq->where('farm_name', 'like', "%{$search}%")
                            ->orWhere('location_district', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sellers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/sellers/index', [
            'sellers' => $sellers,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show form for creating a new seller
     */
    public function create(): Response
    {
        return Inertia::render('admin/sellers/create');
    }

    /**
     * Store a newly created seller
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username'           => 'required|string|max:50|unique:users,username',
            'email'              => 'required|email|lowercase|max:100|unique:users,email',
            'password'           => ['required', 'confirmed', 'min:3'],
            'phone'              => 'required|string|max:20',
            'status'             => 'required|in:active,inactive,banned',
            'farm_name'          => 'required|string|max:100',
            'location_district'  => 'required|string|max:100',
            'description'        => 'nullable|string|max:1000',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => 'seller',
            'phone'    => $validated['phone'],
            'status'   => $validated['status'],
        ]);

        Seller::create([
            'user_id'           => $user->user_id,
            'farm_name'         => $validated['farm_name'],
            'location_district' => $validated['location_district'],
            'description'       => $validated['description'] ?? null,
        ]);

        return redirect()->route('admin.sellers.index')
            ->with('success', 'Seller created successfully.');
    }

    /**
     * Show form for editing a seller
     */
    public function edit(User $user): Response
    {
        // Ensure only sellers can be edited here
        if ($user->role !== 'seller') {
            abort(404);
        }

        $user->loadMissing('seller');

        return Inertia::render('admin/sellers/edit', [
            'seller' => $user
        ]);
    }

    /**
     * Update the specified seller
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        if ($user->role !== 'seller') {
            abort(404);
        }

        $validated = $request->validate([
            'username'           => 'required|string|max:50|unique:users,username,' . $user->user_id . ',user_id',
            'email'              => 'required|email|lowercase|max:100|unique:users,email,' . $user->user_id . ',user_id',
            'phone'              => 'required|string|max:20',
            'status'             => 'required|in:active,inactive,banned',
            'farm_name'          => 'required|string|max:100',
            'location_district'  => 'required|string|max:100',
            'description'        => 'nullable|string|max:1000',
        ]);

        $user->update([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'phone'    => $validated['phone'],
            'status'   => $validated['status'],
        ]);

        // Update password only if provided
        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);
            $user->update(['password' => Hash::make($request->password)]);
        }

        $user->seller()->update([
            'farm_name'         => $validated['farm_name'],
            'location_district' => $validated['location_district'],
            'description'       => $validated['description'] ?? null,
        ]);

        return redirect()->route('admin.sellers.index')
            ->with('success', 'Seller updated successfully.');
    }

    /**
     * Delete the specified seller
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->role !== 'seller') {
            abort(404);
        }

        if ($user->user_id === Auth::id()) {
            return redirect()->route('admin.sellers.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.sellers.index')
            ->with('success', 'Seller deleted successfully.');
    }
}
