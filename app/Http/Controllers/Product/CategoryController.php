<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    // List categories (SELLER ONLY)
    public function index(Request $request)
    {
        $sellerId = Auth::user()->seller->seller_id;

        $categories = Category::where('seller_id', $sellerId)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($request->wantsJson()) {
            return response()->json(['data' => $categories], 200);
        }

        return Inertia::render('product/category', [
            'categories' => $categories
        ]);
    }

    // Store category (attach seller_id)
    public function store(Request $request)
    {
        $sellerId = Auth::user()->seller->seller_id;

        $request->validate([
            'categoryname' => [
                'required',
                'string',
                'max:100',
                Rule::unique('category', 'categoryname')
                    ->where('seller_id', $sellerId),
            ],
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $category = DB::transaction(function () use ($request, $sellerId) {

            // 🔢 Get next seller-specific category number
            $nextSellerCategoryId = Category::where('seller_id', $sellerId)
                ->lockForUpdate()
                ->max('seller_category_id');

            $nextSellerCategoryId = $nextSellerCategoryId ? $nextSellerCategoryId + 1 : 1;

            return Category::create([
                'seller_id'           => $sellerId,
                'seller_category_id'  => $nextSellerCategoryId,
                'categoryname'        => $request->categoryname,
                'description'         => $request->description,
                'is_active'           => $request->boolean('is_active', true),
            ]);
        });

        return response()->json([
            'message' => 'Category created successfully.',
            'data'    => $category
        ], 201);
    }

    // Update category (OWNER ONLY)
    public function update(Request $request, $id)
    {
        $sellerId = Auth::user()->seller->seller_id;

        $category = Category::where('category_id', $id)
            ->where('seller_id', $sellerId)
            ->firstOrFail();

        $request->validate([
            'categoryname' => [
                'required',
                'string',
                'max:100',
                Rule::unique('category', 'categoryname')
                    ->where('seller_id', $sellerId)
                    ->ignore($category->category_id, 'category_id'),
            ],
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $category->update([
            'categoryname' => $request->categoryname,
            'description'  => $request->description,
            'is_active'    => $request->boolean('is_active', $category->is_active),
        ]);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data'    => $category
        ], 200);
    }

    // Delete category (OWNER ONLY)
    public function destroy($id)
    {
        $sellerId = Auth::user()->seller->seller_id;

        $category = Category::where('category_id', $id)
            ->where('seller_id', $sellerId)
            ->firstOrFail();

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.'
        ], 200);
    }

    // Toggle status (OWNER ONLY)
    public function toggleStatus($id)
    {
        $sellerId = Auth::user()->seller->seller_id;

        $category = Category::where('category_id', $id)
            ->where('seller_id', $sellerId)
            ->firstOrFail();

        $category->update([
            'is_active' => !$category->is_active
        ]);

        return response()->json([
            'message' => 'Status updated successfully.',
            'data'    => $category
        ], 200);
    }
}

