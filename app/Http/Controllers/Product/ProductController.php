<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('images')->get(); // eager load images

        if ($request->wantsJson()) {
            return response()->json($products, 200);
        }

        return Inertia::render('product/product');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'productname' => 'required|string|max:255',
            'price' => 'required|numeric',
            'quantity_available' => 'required|integer|min:0',
            'category_id' => 'required|integer|exists:category,category_id',
            'harvest_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:harvest_date',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048', // validate images
        ]);

        try {
            $product = Product::create($validated + $request->only([
                'description', 'is_organic', 'is_featured', 'status', 'discount_percentage', 'unit', 'views_count'
            ]));

            // Handle multiple image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('product_images', 'public');

                ProductImage::create([
                    'product_id' => $product->product_id,
                    'image_url' => '/storage/' . $path,
                    'is_primary' => $index === 0,
                    'display_order' => $index,
                ]);
            }
        }

            if ($request->wantsJson()) {
                return response()->json(['message' => 'Product created successfully!', 'data' => $product->load('images')], 201);
            }

            return redirect()->route('product.index')->with('success', 'Product created successfully!');
        } catch (\Exception $e) {
            Log::error('Product store error: ' . $e->getMessage(), ['exception' => $e]);
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Failed to create product.', 'error' => $e->getMessage()], 500);
            }
            return redirect()->back()->with('error', 'Failed to create product.');
        }
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'productname' => 'required|string|max:255',
            'price' => 'required|numeric',
            'quantity_available' => 'required|integer|min:0',
            'category_id' => 'required|integer|exists:category,category_id',
            'harvest_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:harvest_date',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        try {
            $product->update($validated + $request->only([
                'description', 'is_organic', 'is_featured', 'status', 'discount_percentage', 'unit'
            ]));

            // Add new images if any
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    $path = $file->store('product_images', 'public');

                    ProductImage::create([
                        'product_id' => $product->product_id,
                        'image_url' => '/storage/' . $path,
                        'is_primary' => false,
                        'display_order' => $index,
                    ]);
                }
            }

            if ($request->wantsJson()) {
                return response()->json(['message' => 'Product updated successfully!', 'data' => $product->load('images')], 200);
            }

            return redirect()->route('product.index')->with('success', 'Product updated successfully!');
        } catch (\Exception $e) {
            Log::error('Product update error: ' . $e->getMessage(), ['exception' => $e]);
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Failed to update product.', 'error' => $e->getMessage()], 500);
            }
            return redirect()->back()->with('error', 'Failed to update product.');
        }
    }

    public function destroy(Product $product)
    {
        // Delete related images first
        $product->images()->delete();
        $product->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Product deleted successfully!'], 200);
        }

        return redirect()->route('product.index')->with('success', 'Product deleted successfully!');
    }
}
