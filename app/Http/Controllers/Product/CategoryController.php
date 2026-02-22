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

        $query = Category::where('seller_id', $sellerId);

        // 🔍 Apply search filter if provided
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('categoryname', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        $categories = $query->orderBy('created_at', 'desc')->get();

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
        $products = DB::table('product')
            ->where('category_id', $id)
            ->select('productname')
            ->limit(5)
            ->pluck('productname')
            ->all();

        $productCount = count($products);

        if ($productCount > 0) {
            $productList = implode('", "', $products);
            $extra = $productCount > 5 ? ' និងផ្សេងទៀត' : '';

            $message = "មិនអាចលុបបានទេ! ប្រភេទនេះកំពុងត្រូវបានប្រើដោយផលិតផលដូចខាងក្រោម:\n"
                . "\"{$productList}\"{$extra}។\n"
                . "សូមផ្លាស់ប្តូរប្រភេទរបស់ផលិតផលទាំងនេះទៅប្រភេទផ្សេងជាមុនសិន។";

            return response()->json([
                'message'       => $message,
                'product_count' => $productCount,
                'products'      => $products,
                'error'         => 'category_in_use'
            ], 409);
        }

        $category->delete();

        return response()->json([
            'message' => 'បានលុបប្រភេទរួចរាល់។'
        ], 200);
    }

    // Toggle status (OWNER ONLY)
    public function toggleStatus($id)
    {
        $sellerId = Auth::user()->seller->seller_id;

        $category = Category::where('category_id', $id)
            ->where('seller_id', $sellerId)
            ->firstOrFail();

        $newStatus = !$category->is_active;

        // Only block when trying to DEACTIVATE (set to inactive / មិនប្រើប្រាស់)
        if (!$newStatus) {  // if trying to set is_active = false
            $products = DB::table('product')
                ->where('category_id', $id)
                ->select('productname')
                ->limit(5)  // show first 5 names for helpful message
                ->pluck('productname')
                ->all();

            $productCount = count($products);

            if ($productCount > 0) {
                $productList = implode('", "', $products);
                $extra = $productCount > 5 ? ' និងផ្សេងទៀត' : '';

                return response()->json([
                    'message' => "មិនអាចបិទប្រើប្រាស់ (មិនប្រើប្រាស់) បានទេ!\n"
                        . "ប្រភេទនេះកំពុងត្រូវបានប្រើដោយផលិតផលដូចខាងក្រោម:\n"
                        . "\"{$productList}\"{$extra}។\n"
                        . "សូមផ្លាស់ប្តូរប្រភេទរបស់ផលិតផលទាំងនេះទៅប្រភេទផ្សេងជាមុនសិន រួចអាចបិទប្រើប្រាស់បាន។",
                    'product_count' => $productCount,
                    'products'      => $products,  // optional for frontend
                    'error'         => 'cannot_deactivate_in_use'
                ], 409);
            }
        }

        // Safe to toggle
        $category->update([
            'is_active' => $newStatus,
        ]);

        $statusText = $newStatus ? 'បើកប្រើប្រាស់' : 'បិទប្រើប្រាស់ (មិនប្រើប្រាស់)';

        return response()->json([
            'message' => "បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពជោគជ័យ។ ប្រភេទនេះត្រូវបាន{$statusText}។",
            'data'    => $category->refresh(),
        ], 200);
    }
}
