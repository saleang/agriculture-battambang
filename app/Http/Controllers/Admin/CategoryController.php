<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('category_name', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('is_active') && $request->is_active !== '') {
            $query->where('is_active', (bool) $request->is_active);
        }

        $categories = $query
            // ->withCount('sellers')
            ->withCount(['sellers as sellers_count'])
            ->orderBy('category_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/category/index', [
            'categories' => $categories,
            'filters'    => $request->only(['search', 'is_active']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name'  => 'required|string|max:100|unique:category,category_name',
            'category_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'description'    => 'nullable|string',
            'is_active'      => 'nullable|boolean',
        ]);

        if ($request->hasFile('category_image')) {
            $path = $request->file('category_image')->store('categories', 'public');
            $validated['category_image'] = $path;
        }

        // Explicitly cast — FormData sends "1"/"0" strings
        $validated['is_active'] = $request->boolean('is_active', true);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully.',
            'data'    => $category,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'category_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('category', 'category_name')->ignore($category->category_id, 'category_id'),
            ],
            'category_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        // Explicitly handle is_active since boolean from FormData can be tricky
        $validated['is_active'] = $request->boolean('is_active');

        if ($request->hasFile('category_image')) {
            $path = $request->file('category_image')->store('categories', 'public');
            $validated['category_image'] = $path;
        } else {
            // Don't overwrite existing image if none uploaded
            unset($validated['category_image']);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data'    => $category->fresh(),
        ], 200);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        $products = DB::table('product')
            ->where('category_id', $id)
            ->select('productname')
            ->limit(5)
            ->pluck('productname')
            ->all();

        if (count($products) > 0) {
            $productList = implode('", "', $products);
            $extra = count($products) >= 5 ? ' and more' : '';
            return response()->json([
                'message' => "Cannot delete! Used by: \"{$productList}\"{$extra}. Reassign first.",
                'error'   => 'category_in_use',
            ], 409);
        }

        $category->sellers()->detach();
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.'], 200);
    }

    public function toggleStatus($id)
    {
        $category = Category::findOrFail($id);
        $newStatus = !$category->is_active;

        if (!$newStatus) {
            $products = DB::table('product')
                ->where('category_id', $id)
                ->select('productname')
                ->limit(5)
                ->pluck('productname')
                ->all();

            if (count($products) > 0) {
                $productList = implode('", "', $products);
                $extra = count($products) >= 5 ? ' and more' : '';
                return response()->json([
                    'message' => "Cannot deactivate! Used by: \"{$productList}\"{$extra}. Reassign first.",
                    'error'   => 'cannot_deactivate_in_use',
                ], 409);
            }
        }

        $category->update(['is_active' => $newStatus]);

        return response()->json([
            'message' => $newStatus ? 'Activated.' : 'Deactivated.',
            'data'    => $category->fresh(),
        ], 200);
    }
}
