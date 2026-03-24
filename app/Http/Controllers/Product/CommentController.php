<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:product,product_id',
            'content' => 'required|string|min:3|max:2000',
        ]);

        $comment = Comment::create([
            'product_id' => $request->product_id,
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        // Load the user relationship without specifying columns
        $comment->load('user');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'មតិត្រូវបានបន្ថែមដោយជោគជ័យ!',
                'comment' => [
                    'comment_id' => $comment->comment_id,
                    'product_id' => $comment->product_id,
                    'user_id' => $comment->user_id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                    'updated_at' => $comment->updated_at,
                    'user' => $comment->user ? [
                        'id' => $comment->user->user_id, // Use user_id instead of id
                        'username' => $comment->user->username,
                        'photo' => $comment->user->photo
                    ] : null
                ]
            ]);
        }

        return redirect()->back()->with('success', 'មតិត្រូវបានបន្ថែមដោយជោគជ័យ!');
    }

    public function update(Request $request, $commentId)
    {
        $comment = Comment::findOrFail($commentId);

        if (Auth::id() != $comment->user_id) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'អ្នកមិនមានសិទ្ធិកែប្រែមតិនេះទេ។'], 403);
            }
            return back()->with('error', 'អ្នកមិនមានសិទ្ធិកែប្រែមតិនេះទេ។');
        }

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $comment->update($validated);

        // Load the user relationship with correct column names
        $comment->load('user');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'មតិត្រូវបានកែប្រែរួចរាល់!',
                'comment' => [
                    'comment_id' => $comment->comment_id,
                    'product_id' => $comment->product_id,
                    'user_id' => $comment->user_id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                    'updated_at' => $comment->updated_at,
                    'user' => $comment->user ? [
                        'id' => $comment->user->user_id, // Use user_id instead of id
                        'username' => $comment->user->username,
                        'photo' => $comment->user->photo
                    ] : null
                ]
            ]);
        }

        return back()->with('success', 'មតិត្រូវបានកែប្រែរួចរាល់!');
    }

    public function destroy(Request $request, $commentId)
    {
        $comment = Comment::findOrFail($commentId);

        if (Auth::id() != $comment->user_id) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'អ្នកមិនមានសិទ្ធិលុបមតិនេះទេ។'], 403);
            }
            return back()->with('error', 'អ្នកមិនមានសិទ្ធិលុបមតិនេះទេ។');
        }

        $comment->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'មតិត្រូវបានលុបរួចរាល់!'
            ]);
        }

        return back()->with('success', 'មតិត្រូវបានលុបរួចរាល់!');
    }
}
