<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OtpController extends Controller
{
    /**
     * Generate and send an OTP to the user.
     */
    public function generateOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user = User::where('email', $request->email)->first();

        // Generate a 6-digit OTP
        $otp = random_int(100000, 999999);
        $expiresAt = now()->addMinutes(10);

        $user->update([
            'otp' => $otp,
            'otp_expires_at' => $expiresAt,
        ]);

        // In a real application, you would send this OTP via SMS or email.
        // For this development-focused feature, we'll return it in the response.
        return response()->json(['message' => 'An OTP has been generated.', 'otp' => $otp]);
    }

    /**
     * Verify the OTP provided by the user.
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user->otp || $user->otp !== $request->otp) {
            return response()->json(['message' => 'The OTP is invalid.'], 422);
        }

        if (now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'The OTP has expired.'], 422);
        }

        // OTP is correct and not expired.
        // Clear the OTP fields.
        $user->update([
            'otp' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['message' => 'OTP verified successfully.']);
    }
}