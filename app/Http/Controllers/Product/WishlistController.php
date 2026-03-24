<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class WishlistController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $wishlists = Wishlist::query()
            ->where('user_id', Auth::id())
            ->whereHas('product')
            ->with([
                'product' => function ($query) {
                    $query->with('images');
                },
                'product.category',
                'product.seller.user'
            ])
            ->latest('created_at')
            ->paginate(12);

        return Inertia::render('Wishlist', [
            'wishlists' => $wishlists,
        ]);
    }

    /**
     * Add product to wishlist (idempotent)
     */
    public function store(Request $request, Product $product)
    {
        // $this->authorize('view', $product); // optional: if products have visibility rules

        Wishlist::firstOrCreate([
            'user_id'    => Auth::id(),
            'product_id' => $product->product_id,
        ]);

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return response()->json([
                'success'        => true,
                'message'        => 'បានបន្ថែមទៅក្នុង wishlist រួចរាល់!',
                'in_wishlist'    => true,
                'wishlist_count' => Wishlist::where('user_id', Auth::id())->count(),
            ]);
        }

        return back()->with('success', 'បានបន្ថែមទៅក្នុង wishlist រួចរាល់!');
    }

    /**
     * Remove product from wishlist
     */
    public function destroy(Request $request, $product_id)
    {
        $wishlist = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $product_id)
            ->first();

        if (!$wishlist) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Item not found in wishlist.'], 404);
            }
            return redirect()->back(303)->with('error', 'Item not found in wishlist.');
        }

        $wishlist->delete();

        if ($request->expectsJson()) {
            return response()->json([
                'success'        => true,
                'message'        => 'Item removed from wishlist.',
                'wishlist_count' => Wishlist::where('user_id', Auth::id())->count(),
            ]);
        }

        // Use explicit 303 + back()
        return redirect()->back(303)->with('success', 'Item removed from wishlist.');
    }

    /**
     * Get current wishlist count (for header badge)
     */
    public function getCount()
    {
        if (!Auth::check()) {
            return response()->json(['count' => 0]);
        }

        $count = Wishlist::where('user_id', Auth::id())->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Optional: Toggle (add or remove in one endpoint)
     */
    public function toggle(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);
        $userId = Auth::id();

        $wishlistItem = Wishlist::where('user_id', $userId)
            ->where('product_id', $product->product_id) // Corrected: was $product->id
            ->first();

        if ($wishlistItem) {
            $wishlistItem->delete();
            $message = 'បានលុបចេញពី wishlist!';
            $isInWishlist = false;
        } else {
            Wishlist::create([
                'user_id'    => $userId,
                'product_id' => $product->product_id, // Corrected: was $product->id
            ]);
            $message = 'បានបន្ថែមទៅក្នុង wishlist រួចរាល់!';
            $isInWishlist = true;
        }

        $newCount = Wishlist::where('user_id', $userId)->count();

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return response()->json([
                'success'        => true,
                'message'        => $message,
                'is_in_wishlist' => $isInWishlist,
                'wishlist_count' => $newCount,
            ]);
        }

        return Redirect::back()->with([
            'success' => $message,
            'is_in_wishlist' => $isInWishlist,
        ]);
    }
}