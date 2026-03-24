<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    /**
     * Seller sees all active global categories + which ones they have selected
     */
    public function index(Request $request)
    {
        $sellerId = Auth::user()->seller->seller_id;

        // Qualify with table name to avoid ambiguous column error
        $chosenIds = Category::whereHas('sellers', function ($q) use ($sellerId) {
            $q->where('sellers.seller_id', $sellerId);
        })->pluck('category_id')->toArray();

        $query = Category::active(); // removed ->with('parent:...') — no parent relationship

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('category_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $categories = $query
            ->orderBy('category_name')
            ->get()
            ->map(function ($cat) use ($chosenIds) {
                $cat->is_chosen = in_array($cat->category_id, $chosenIds);
                return $cat;
            });

        if ($request->wantsJson()) {
            return response()->json(['data' => $categories], 200);
        }

        return Inertia::render('product/category', [
            'categories' => $categories,
        ]);
    }

    /**
     * Attach (select) a global category
     */
    public function attach(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:category,category_id',
        ]);

        $category = Category::findOrFail($request->category_id);

        Auth::user()->seller->categories()->syncWithoutDetaching($category->category_id);

        return response()->json([
            'message' => 'បានបន្ថែមប្រភេទទៅក្នុងហាងរបស់អ្នក។',
            'data'    => $category->only(['category_id', 'category_name', 'description', 'category_image']),
        ], 200);
    }

    /**
     * Detach (remove) a category — blocked if products are using it
     */
    public function detach(Request $request, $categoryId)
    {
        $seller = Auth::user()->seller;
        $category = Category::findOrFail($categoryId);

        $usedCount = DB::table('product')
            ->where('seller_id', $seller->seller_id)
            ->where('category_id', $categoryId)
            ->count();

        if ($usedCount > 0) {
            return response()->json([
                'message' => "មិនអាចលុបប្រភេទនេះបានទេ — មានផលិតផល {$usedCount} កំពុងប្រើប្រាស់។ សូមផ្លាស់ប្តូរប្រភេទផលិតផលជាមុន។",
                'error'   => 'category_in_use',
            ], 409);
        }

        $seller->categories()->detach($categoryId);

        return response()->json([
            'message' => 'បានលុបប្រភេទចេញពីហាងរបស់អ្នក។',
        ], 200);
    }

    /**
     * Get only the categories THIS seller has selected
     * → used in product create/edit dropdown
     */
    public function myCategories(Request $request)
    {
        $sellerId = Auth::user()->seller->seller_id;

        $categories = Category::active()
            ->whereHas('sellers', function ($q) use ($sellerId) {
                $q->where('sellers.seller_id', $sellerId); // ← qualified
            })
            ->orderBy('category_name')
            ->get(['category_id', 'category_name', 'description', 'category_image']);

        return response()->json(['data' => $categories], 200);
    }
}
