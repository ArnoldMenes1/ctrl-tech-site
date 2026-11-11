<?php
namespace App\Providers;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
class AppServiceProvider extends ServiceProvider
{
 public function register(): void {}
 public function boot(): void {
  $vercelUrl=env('VERCEL_URL');
  if($vercelUrl) {
   $root=str_starts_with($vercelUrl,'http')?$vercelUrl:'https://'.$vercelUrl;
   URL::forceRootUrl($root);
   URL::forceScheme('https');
  } elseif(app()->environment('production')) {
   URL::forceScheme('https');
  }
 }
}
