<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
// use App\Http\Requests\Customer\PasswordUpdateRequest;
use App\Http\Controllers\Controller;


class CustomerPasswordController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'min:3', 'confirmed'], //Password::defaults()
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
