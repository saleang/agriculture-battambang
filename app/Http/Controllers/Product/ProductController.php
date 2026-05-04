<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Wishlist;
use Inertia\Inertia;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
            Log::error('Product creation failed: ' . $e->getMessage());
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
            Log::error('Product update failed: ' . $e->getMessage());
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
            Log::error('Product delete failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete product.', 'error' => $e->getMessage()], 500);
        }
    }public function publicProducts()
    {
        $products = \App\Models\Product::with([
            'images',
            'category',
            'seller.user:user_id,photo',
        ])
            ->where('is_active', true)
            ->whereHas('seller.user', function ($query) {
                $query->where('status', 'active');
            })
            ->get();

        // Append the primary image URL and category name to each product
        $products->each(function ($product) {
            $primaryImage = $product->images->firstWhere('is_primary', true);
            $product->image = $primaryImage ? Storage::url($primaryImage->image_url) : null;
            $product->category_name = $product->category ? $product->category->category_name : null;
        });

        $categories = \App\Models\Category::where('is_active', true)
            ->get()
            ->unique('category_name')
            ->values();

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /** Show product details */
    public function show(Request $request, $id)
    {
        $product = Product::with([
            'images',
            'category',
            'seller.user',
            'comments.user'
        ])->findOrFail($id);

        $isInWishlist = false;
        $isFollowing = false;
        $followersCount = 0;
        $user = $request->user();

        if ($product->seller) {
            $followersCount = $product->seller->followers()->count();
        }

        if ($user) {
            $isInWishlist = Wishlist::where('user_id', $user->user_id)
                ->where('product_id', $product->product_id)
                ->exists();

            if ($product->seller) {
                $isFollowing = $user->following()->where('sellers.seller_id', $product->seller->seller_id)->exists();
            }
        }

        return Inertia::render('ProductDetail', [
            'product' => $product,
            'is_in_wishlist' => $isInWishlist,
            'is_following' => $isFollowing,
            'followers_count' => $followersCount,
        ])->withViewData([
            'title' => $product->productname,
        ]);
    }

    public function allProducts(Request $request)
    {
        $filters = $request->only(['max_price', 'tags', 'search']);

        $baseQuery = Product::where('is_active', true);

        // Get min and max price from all active products
        $minPrice = $baseQuery->min('price') ?? 0;
        $maxPrice = $baseQuery->max('price') ?? 50000;

        $productsQuery = Product::with(['images' => function ($query) {
            $query->where('is_primary', true);
        }, 'seller' => function ($query) {
            $query->select('seller_id', 'farm_name', 'user_id')->with('user:user_id,photo');
        }, 'category'])
            ->where('is_active', true)
            ->whereHas('seller.user', function ($query) {
                $query->where('status', 'active');
            })
            ->orderBy('created_at', 'desc');

        if ($request->filled('max_price')) {
            $productsQuery->where('price', '<=', $request->input('max_price'));
        }

        // Apply tags (category) filter
        if ($request->filled('tags')) {
            $tagIds = $request->input('tags');
            $productsQuery->whereIn('category_id', $tagIds);
        }

        // Apply search filter
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $productsQuery->where(function ($query) use ($searchTerm) {
                $query->where('productname', 'like', "%{$searchTerm}%")
                      ->orWhere('price', 'like', "%{$searchTerm}%");
            });
        }

        $products = $productsQuery->paginate(18)->withQueryString();

        $products->through(function ($product) {
            $product->seller_photo = $product->seller && $product->seller->user ? $product->seller->user->photo_url : null;
            return $product;
        });


        $wishlistProductIds = [];
        if (Auth::check()) {
            $wishlistProductIds = Wishlist::where('user_id', Auth::id())->pluck('product_id')->toArray();
        }

        $categories = Category::whereHas('products', function ($query) {
            $query->where('is_active', true);
        })->select('category_id', 'category_name as name')->get();

        return Inertia::render('AllProducts', [
            'products' => $products,
            'wishlistProductIds' => $wishlistProductIds,
            'categories' => $categories,
            'minPrice' => (int)$minPrice,
            'maxPrice' => (int)$maxPrice,
            'filters' => $filters,
        ]);
    }

    /**
     * Fetch full product details for cart items.
     */
    public function getCartProducts(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer|exists:product,product_id',
        ]);

        $products = Product::with([
            'seller:seller_id,farm_name',
            'seller.user:user_id,photo', // Also load the user photo for the seller
            'images' => function ($query) {
                $query->where('is_primary', true)->orWhere(function ($q) {
                    $q->whereDoesntHave('product.images', function ($r) {
                        $r->where('is_primary', true);
                    })->orderBy('display_order', 'asc');
                });
            }
        ])->findMany($validated['product_ids']);

        $formatted = $products->map(function ($p) {
            $image = $p->images->first();
            $sellerPhoto = $p->seller && $p->seller->user ? Storage::url($p->seller->user->photo) : null;

            return [
                'product_id' => $p->product_id,
                'productname' => $p->productname,
                'price' => $p->price,
                'unit' => $p->unit,
                'seller_id' => $p->seller_id,
                'farm_name' => $p->seller->farm_name ?? 'Unknown Farm',
                'image' => $image ? Storage::url($image->image_url) : 'https://via.placeholder.com/150?text=No+Image',
                'seller_photo' => $sellerPhoto,
            ];
        });

        return response()->json($formatted);
    }
}