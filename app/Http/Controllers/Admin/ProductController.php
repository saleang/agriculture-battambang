<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{
    // Display a listing of all products for admin
    public function index(Request $request)
    {
        $query = Product::with(['images', 'category', 'seller.user']);

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('productname', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('seller.user', function ($sq) use ($search) {
                      $sq->where('username', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by category
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by stock
        if ($request->has('stock') && $request->stock !== '') {
            $query->where('stock', $request->stock);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(20);

        $categories = Category::all();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status', 'stock'])
        ]);
    }

    // Show the form for creating a new product (admin can create products for any seller)
    public function create()
    {
        $categories = Category::all();
        $sellers = Seller::with('user')->get();

        return Inertia::render('admin/products/create', [
            'categories' => $categories,
            'sellers' => $sellers
        ]);
    }

    // Store a newly created product
    public function store(Request $request)
    {
        $validated = $request->validate([
            'seller_id' => 'required|integer|exists:seller,seller_id',
            'productname' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|integer|exists:category,category_id',
            'unit' => 'nullable|string|max:20',
            'stock' => 'required|string|in:available,out_of_stock',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // Get next seller_product_id for this seller
            $last = Product::where('seller_id', $validated['seller_id'])
                ->lockForUpdate()
                ->orderByDesc('seller_product_id')
                ->first();

            $nextId = $last ? $last->seller_product_id + 1 : 1;

            $product = Product::create(array_merge($validated, [
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
            return redirect()->route('admin.products.index')
                ->with('success', 'Product created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin product creation failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create product. Please try again.']);
        }
    }

    //  Display the specified product
    public function show(Product $product)
    {
        $product->load(['images', 'category', 'seller.user']);

        return Inertia::render('admin/products/show', [
            'product' => $product
        ]);
    }

    // Show the form for editing the specified product
    public function edit(Product $product)
    {
        $product->load(['images', 'category', 'seller.user']);

        $categories = Category::all();
        $sellers = Seller::with('user')->get();

        return Inertia::render('admin/products/edit', [
            'product' => $product,
            'categories' => $categories,
            'sellers' => $sellers
        ]);
    }

    // Update the specified product
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'seller_id' => 'sometimes|required|integer|exists:seller,seller_id',
            'productname' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'category_id' => 'sometimes|required|integer|exists:category,category_id',
            'unit' => 'nullable|string|max:20',
            'stock' => 'sometimes|required|string|in:available,out_of_stock',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'string',
        ]);

        DB::beginTransaction();
        try {
            // If seller changed, update seller_product_id
            if (isset($validated['seller_id']) && $validated['seller_id'] != $product->seller_id) {
                $last = Product::where('seller_id', $validated['seller_id'])
                    ->lockForUpdate()
                    ->orderByDesc('seller_product_id')
                    ->first();

                $validated['seller_product_id'] = $last ? $last->seller_product_id + 1 : 1;
            }

            $product->update($validated);

            // Handle delete_images
            if ($request->has('delete_images') && is_array($request->delete_images)) {
                $deleteImages = array_map(function ($url) {
                    $path = parse_url($url, PHP_URL_PATH);
                    if (strpos($path, '/storage/') === 0) {
                        return substr($path, 9);
                    }
                    return $url;
                }, $request->delete_images);

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
            return redirect()->route('admin.products.index')
                ->with('success', 'Product updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin product update failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update product. Please try again.']);
        }
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product)
    {
        DB::beginTransaction();
        try {
            $product->images()->delete();
            $product->delete();
            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Product deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin product delete failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete product. Please try again.']);
        }
    }

    /**
     * Toggle product active status
     */
    public function toggleActive(Product $product)
    {
        $product->update(['is_active' => !$product->is_active]);

        return back()->with('success',
            'Product ' . ($product->is_active ? 'activated' : 'deactivated') . ' successfully!'
        );
    }

    /**
     * Bulk actions for products
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:activate,deactivate,delete',
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'integer|exists:product,product_id',
        ]);

        $products = Product::whereIn('product_id', $validated['product_ids']);

        switch ($validated['action']) {
            case 'activate':
                $products->update(['is_active' => true]);
                $message = 'Products activated successfully!';
                break;
            case 'deactivate':
                $products->update(['is_active' => false]);
                $message = 'Products deactivated successfully!';
                break;
            case 'delete':
                // Delete images first
                foreach ($products->get() as $product) {
                    $product->images()->delete();
                }
                $products->delete();
                $message = 'Products deleted successfully!';
                break;
        }

        return back()->with('success', $message);
    }
}
