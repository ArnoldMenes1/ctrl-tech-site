<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
class AdminOnly {
 public function handle(Request $request,Closure $next): Response {
  if(!$request->user() || !$request->user()->is_active || !$request->user()->isAdmin()) return redirect()->route('admin.login');
  return $next($request);
 }
}
