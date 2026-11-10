<?php
use Illuminate\Support\Facades\Artisan;
Artisan::command('storefront:status', function () {
    $this->info('CTRL-Tech storefront is ready for local development.');
})->purpose('Display the local storefront status');
