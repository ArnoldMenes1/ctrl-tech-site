<?php
return [
    'name' => env('STOREFRONT_NAME', 'CTRL-Tech'),
    'usd_to_cdf_rate' => (float) env('USD_TO_CDF_RATE', 2800),
    'currency_default' => env('STORE_CURRENCY', 'USD'),
    'contact_phone' => env('STORE_CONTACT_PHONE', ''),
    'contact_email' => env('STORE_CONTACT_EMAIL', ''),
    'address' => env('STORE_ADDRESS', 'Lubumbashi, Haut-Katanga, RDC'),
];
