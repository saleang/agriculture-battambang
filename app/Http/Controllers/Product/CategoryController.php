<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    // Display a listing of categories
    public function index(Request $request)
    {
        $categories = Category::with('parent')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // If this is an AJAX/JSON request, return JSON (for frontend axios)
        if ($request->wantsJson()) {
            return response()->json(['data' => $categories], 200);
        }

        return Inertia::render('product/category', [
            'categories' => $categories
        ]);
    }

    // Show the form for creating a new category
    public function create()
    {
        $parentCategories = Category::where('is_active', true)
            ->orderBy('categoryname')
            ->get(['category_id', 'categoryname']);
        
        return Inertia::render('product/category/Create', [
            'parentCategories' => $parentCategories
        ]);
    }

    // Store a newly created category
    public function store(Request $request)
    {
        $request->validate([
            'categoryname' => 'required|unique:category,categoryname|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'parent_category_id' => [
                'nullable',
                'exists:category,category_id',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $parent = Category::find($value);
                        if ($parent && !$parent->is_active) {
                            $fail('The selected parent category is inactive.');
                        }
                    }
                }
            ],
        ]);

        $category = Category::create([
            'categoryname' => $request->categoryname,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active'),
            'parent_category_id' => $request->parent_category_id,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Category created successfully.', 'data' => $category], 201);
        }

        return redirect()->route('category.index')
            ->with('success', 'Category created successfully.');
    }

    // Show the form for editing a category
    public function edit(Category $category)
    {
        $parentCategories = Category::where('is_active', true)
            ->where('category_id', '!=', $category->category_id)
            ->orderBy('categoryname')
            ->get(['category_id', 'categoryname']);
        
        return Inertia::render('product/category/Edit', [
            'category' => $category,
            'parentCategories' => $parentCategories
        ]);
    }

    // Update a category
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'categoryname' => 'required|max:100|unique:category,categoryname,' . $category->category_id . ',category_id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'parent_category_id' => [
                'nullable',
                'exists:category,category_id',
                function ($attribute, $value, $fail) use ($category) {
                    if ($value == $category->category_id) {
                        $fail('A category cannot be its own parent.');
                    }
                }
            ],
        ]);

        // Prevent circular reference
        if ($request->parent_category_id) {
            $this->validateCircularReference($category->category_id, $request->parent_category_id);
        }

        // If deactivating, check if category has active children
        if (!$request->boolean('is_active') && $category->is_active) {
            $activeChildren = Category::where('parent_category_id', $category->category_id)
                ->where('is_active', true)
                ->exists();
            
            if ($activeChildren) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Cannot deactivate category with active sub-categories.');
            }
        }

        $category->update([
            'categoryname' => $request->categoryname,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active'),
            'parent_category_id' => $request->parent_category_id,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Category updated successfully.', 'data' => $category], 200);
        }

        return redirect()->route('category.index')
            ->with('success', 'Category updated successfully.');
    }

    // Delete a category
    public function destroy(Category $category)
    {
        // Check if category has children
        $childrenCount = Category::where('parent_category_id', $category->category_id)->count();
        if ($childrenCount > 0) {
            return redirect()->back()
                ->with('error', "Cannot delete category. It has $childrenCount sub-category(s).");
        }

        $category->delete();
        
        if (request()->wantsJson()) {
            return response()->json(['message' => 'Category deleted successfully.'], 200);
        }

        return redirect()->route('category.index')
            ->with('success', 'Category deleted successfully.');
    }

    // Toggle category status
    public function toggleStatus(Request $request, Category $category)
    {
        $newStatus = !$category->is_active;
        
        // If deactivating, check if category has active children
        if (!$newStatus) {
            $activeChildren = Category::where('parent_category_id', $category->category_id)
                ->where('is_active', true)
                ->exists();
            
            if ($activeChildren) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Cannot deactivate category with active sub-categories.'], 409);
                }
                return redirect()->back()
                    ->with('error', 'Cannot deactivate category with active sub-categories.');
            }
        }
        
        // If activating, check if parent is active (if has parent)
        if ($newStatus && $category->parent_category_id) {
            $parent = Category::find($category->parent_category_id);
            if ($parent && !$parent->is_active) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Cannot activate category with inactive parent.'], 409);
                }
                return redirect()->back()
                    ->with('error', 'Cannot activate category with inactive parent.');
            }
        }
        
        $category->update(['is_active' => $newStatus]);
        
        $statusText = $newStatus ? 'activated' : 'deactivated';

        if ($request->wantsJson()) {
            return response()->json(['message' => "Category $statusText successfully.", 'data' => $category], 200);
        }

        return redirect()->back()
            ->with('success', "Category $statusText successfully.");
    }

    /**
     * Helper method to prevent circular references
     */
    private function validateCircularReference($categoryId, $parentId)
    {
        // Get all descendants of the current category
        $descendantIds = $this->getDescendantIds($categoryId);
        
        // Check if the proposed parent is a descendant
        if (in_array($parentId, $descendantIds)) {
            throw new \Exception('Cannot set a descendant category as parent.');
        }
    }

    /**
     * Get all descendant IDs of a category
     */
    private function getDescendantIds($categoryId)
    {
        $descendantIds = [];
        $this->collectDescendantIds($categoryId, $descendantIds);
        return $descendantIds;
    }

    /**
     * Recursively collect descendant IDs
     */
    private function collectDescendantIds($categoryId, &$descendantIds)
    {
        $children = Category::where('parent_category_id', $categoryId)
            ->pluck('category_id')
            ->toArray();
        
        foreach ($children as $childId) {
            $descendantIds[] = $childId;
            $this->collectDescendantIds($childId, $descendantIds);
        }
    }
}