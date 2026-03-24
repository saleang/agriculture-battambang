<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('customer/orders/cart-page');
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:product,product_id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);
        $cart = $request->session()->get('cart', []);

        // Check if product is already in cart
        if (isset($cart[$product->product_id])) {
            $cart[$product->product_id]['quantity'] += $request->quantity;
        } else {
            $cart[$product->product_id] = [
                'product_id' => $product->product_id,
                'productname' => $product->productname,
                'price' => $product->price,
                'quantity' => $request->quantity,
            ];
        }

        $request->session()->put('cart', $cart);

        $cartCount = array_sum(array_column($cart, 'quantity'));
        return response()->json(['cart_count' => $cartCount]);
    }
}