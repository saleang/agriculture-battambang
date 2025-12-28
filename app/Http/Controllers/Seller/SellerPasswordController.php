<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SellerPasswordController extends Controller
{
    //show password
    public function edit() : Response
    {
        return Inertia::render('seller/password');
    }
    //update password
    public function update(Request $request): RedirectResponse{
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required','min:3' , 'confirmed'],//Password::defaults()
        ]);

        // $request->user()->update([
        //     'password' => $validated['password'],
        // ]);
        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }
}
