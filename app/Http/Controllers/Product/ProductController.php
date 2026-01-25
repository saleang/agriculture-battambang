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
            'category_id' => 'required|integer|exists:category,category_id',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'unit' => 'nullable|string|max:20',
            'stock' => 'required|string|in:available,out_of_stock',
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
        'category_id' => 'sometimes|required|integer|exists:category,category_id',
        'images' => 'nullable|array',
        'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        'delete_images' => 'nullable',
        'unit' => 'nullable|string|max:20',
        'stock' => 'sometimes|required|string|in:available,out_of_stock',
        'description' => 'nullable|string',
        'is_active' => 'nullable|boolean',
    ]);

    DB::beginTransaction();
    try {
        $product->update($validated);

        // Handle delete_images
        $deleteImages = [];
        if ($request->has('delete_images')) {
            if (is_array($request->delete_images)) {
                $deleteImages = $request->delete_images;
            } elseif (is_string($request->delete_images)) {
                $decoded = json_decode($request->delete_images, true);
                $deleteImages = is_array($decoded) ? $decoded : [$request->delete_images];
            }

            // Convert full URLs to storage paths
            $deleteImages = array_map(function ($url) {
                $path = parse_url($url, PHP_URL_PATH);
                // If the path starts with '/storage/', remove that prefix
                if (strpos($path, '/storage/') === 0) {
                    return substr($path, 9);
                }
                return $url;
            }, $deleteImages);

            // Delete the images
            $product->images()->whereIn('image_url', $deleteImages)->delete();
        }

        // Add new images
        if ($request->hasFile('images')) {
            $maxOrder = $product->images()->max('display_order') ?? -1;
            
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('product_images', 'public');
                $product->images()->create([
                    'image_url' => $path,
                    'is_primary' => $product->images()->count() === 0 && $index === 0,
                    'display_order' => $maxOrder + $index + 1,
                ]);
            }
        }

        // Ensure there's at least one primary image
        if ($product->images()->where('is_primary', true)->doesntExist() && $product->images()->exists()) {
            $product->images()->orderBy('display_order')->first()->update(['is_primary' => true]);
        }

        DB::commit();
        return response()->json([
            'message' => 'Product updated successfully!',
            'data' => $product->fresh()->load('images')
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Product update failed: '.$e->getMessage());
        return response()->json([
            'message' => 'Failed to update product.',
            'error' => $e->getMessage()
        ], 500);
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
