<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Bakong Payment Integration
    |--------------------------------------------------------------------------
    |
    | Configuration for Cambodia's Bakong KHQR payment system
    |
    */

    'token'     => env('BAKONG_TOKEN'),
    'api_url'   => env('BAKONG_API_URL', 'https://api-bakong.nbc.org.kh/v1'),
    'currency'  => env('BAKONG_CURRENCY', 'KHR'),
    'timeout'   => env('BAKONG_QR_TIMEOUT_MINUTES', 30),
];
