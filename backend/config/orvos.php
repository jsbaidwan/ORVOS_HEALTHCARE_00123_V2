<?php

return [

    'ted_app_name' => env('TED_APP_NAME'),

    'pagination_per_page' => (int) env('PAGINATION_PER_PAGE', 15),

    'url_id_encryption' => env('URL_ID_ENCRYPTION', true),

    'google_map_api_key' => env('GOOGLE_MAP_API_KEY'),

    'google_map_geocode_api_key' => env('GOOGLE_MAP_GEOCODE_API_KEY'),

    'recaptcha' => [
        'v2' => [
            'site_key' => env('RECAPTCHA_SITE_KEY_V2'),
            'secret_key' => env('RECAPTCHA_SECRET_KEY_V2'),
        ],
        'v3' => [
            'site_key' => env('RECAPTCHA_SITE_KEY_V3'),
            'secret_key' => env('RECAPTCHA_SECRET_KEY_V3'),
        ],
    ],

    'fax' => [
        'access_token' => env('FAX_ACCESS_TOKEN'),
        'caller_id' => env('Fax_CALLER_ID'),
    ],

    'orthanc' => [
        'endpoint' => env('ORTHANC_ENDPOINT'),
        'port2' => env('ORTHANC_PORT2'),
        'username2' => env('ORTHANC_USERNAME2'),
        'password2' => env('ORTHANC_PASSWORD2'),
    ],

];
