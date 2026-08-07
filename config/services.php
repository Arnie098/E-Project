<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022'),
    ],

    'ai' => [
        'provider' => env('AI_PROVIDER', 'aerolink'),
        'key' => env('AI_API_KEY', env('ANTHROPIC_API_KEY')),
        'base_url' => rtrim(env('AI_BASE_URL', 'https://cgapi.aerolink.lat'), '/'),
        'wire_api' => env('AI_WIRE_API', 'responses'),
        'model' => env('AI_MODEL', 'gpt-5.6-luna'),
        'reasoning_effort' => env('AI_REASONING_EFFORT', 'high'),
        'disable_response_storage' => filter_var(env('AI_DISABLE_RESPONSE_STORAGE', true), FILTER_VALIDATE_BOOLEAN),
        'auth_method' => env('AI_AUTH_METHOD', 'apikey'),
        'embeddings' => [
            'enabled' => env('AI_EMBEDDINGS_ENABLED', false),
            'model' => env('AI_EMBEDDINGS_MODEL'),
            'base_url' => env('AI_EMBEDDINGS_BASE_URL'),
        ],
    ],

];
