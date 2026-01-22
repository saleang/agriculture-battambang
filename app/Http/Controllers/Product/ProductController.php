<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /** List seller's products */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->seller) abort(403);

        $products = Product::with('images')
            ->where('seller_id', $user->seller->seller_id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $request->wantsJson()
            ? response()->json($products)
            : inertia('product/product', ['products' => $products]);
    }

    /** Create new product */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->seller) return response()->json(['message' => 'User is not a seller.'], 403);

        $validated = $request->validate([
            'productname' => 'required|string|max:255',
            'price' => 'required|numeric',
            'quantity_available' => 'required|integer|min:0',
            'category_id' => 'required|integer|exists:category,category_id',
            'harvest_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:harvest_date',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'unit' => 'nullable|string|max:20',
            'stock' => 'required|string|in:available,out_of_stock,discontinued',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            // Next seller_product_id
            $last = Product::where('seller_id', $user->seller->seller_id)
                ->lockForUpdate()
                ->orderByDesc('seller_product_id')
                ->first();

            $nextId = $last ? $last->seller_product_id + 1 : 1;

            $product = Product::create(array_merge($validated, [
                'seller_id' => $user->seller->seller_id,
                'seller_product_id' => $nextId,
                'unit' => $request->unit ?? 'kg',
                'views_count' => 0,
                'is_active' => $request->boolean('is_active', true),
            ]));

            // Upload images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    $path = $file->store('product_images', 'public');
                    $product->images()->create([
                        'image_url' => $path,
                        'is_primary' => $index === 0,
                        'display_order' => $index,
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Product created successfully!', 'data' => $product->load('images')], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Product creation failed: '.$e->getMessage());
            return response()->json(['message' => 'Failed to create product.', 'error' => $e->getMessage()], 500);
        }
    }

    /** Update product */
    public function update(Request $request, Product $product)
    {
        $user = Auth::user();
        if (!$user || !$user->seller || $product->seller_id !== $user->seller->seller_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'productname' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric',
            'quantity_available' => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|integer|exists:category,category_id',
            'harvest_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:harvest_date',
            'images' => 'sometimes|array',
            'images.*' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'unit' => 'nullable|string|max:20',
            'stock' => 'sometimes|required|string|in:available,out_of_stock,discontinued',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            $product->update($validated);

            // Replace images if new ones uploaded
            if ($request->hasFile('images')) {
                $product->images()->delete();
                foreach ($request->file('images') as $index => $file) {
                    $path = $file->store('product_images', 'public');
                    $product->images()->create([
                        'image_url' => $path,
                        'is_primary' => $index === 0,
                        'display_order' => $index,
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Product updated successfully!', 'data' => $product->fresh()->load('images')], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Product update failed: '.$e->getMessage());
            return response()->json(['message' => 'Failed to update product.', 'error' => $e->getMessage()], 500);
        }
    }

    /** Toggle active status */
    public function toggleActive($id)
    {
        $product = Product::findOrFail($id);
        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json(['success' => true, 'is_active' => $product->is_active]);
    }

    /** Delete product */
    public function destroy(Product $product)
    {
        DB::beginTransaction();
        try {
            $product->images()->delete();
            $product->delete();
            DB::commit();
            return response()->json(['message' => 'Product deleted successfully!'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Product delete failed: '.$e->getMessage());
            return response()->json(['message' => 'Failed to delete product.', 'error' => $e->getMessage()], 500);
        }
    }
}
