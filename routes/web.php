<?php
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
Route::get('/',[HomeController::class,'index'])->name('home');
Route::get('/catalogue',[ProductController::class,'index'])->name('products.index');
Route::get('/produit/{product:slug}',[ProductController::class,'show'])->name('products.show');
Route::get('/panier',[CartController::class,'index'])->name('cart.index');
Route::post('/panier/ajouter/{product}',[CartController::class,'store'])->name('cart.store');
Route::patch('/panier/{product}',[CartController::class,'update'])->name('cart.update');
Route::delete('/panier/{product}',[CartController::class,'destroy'])->name('cart.destroy');
Route::get('/commande',[CheckoutController::class,'create'])->name('checkout.create');
Route::post('/commande',[CheckoutController::class,'store'])->name('checkout.store');
Route::get('/commande/confirmation/{order:reference}',[CheckoutController::class,'success'])->name('checkout.success');
Route::view('/a-propos','pages.about')->name('about');
Route::view('/contact','pages.contact')->name('contact');
Route::view('/livraison-retours','pages.shipping')->name('shipping');
Route::view('/confidentialite','pages.privacy')->name('privacy');
Route::view('/conditions-generales','pages.terms')->name('terms');
Route::prefix('admin')->name('admin.')->group(function(){
 Route::get('/connexion',[AdminAuthController::class,'show'])->name('login');
 Route::post('/connexion',[AdminAuthController::class,'login'])->name('login.submit');
 Route::middleware(['auth','admin'])->group(function(){
  Route::post('/deconnexion',[AdminAuthController::class,'logout'])->name('logout');
  Route::get('/',[AdminDashboardController::class,'index'])->name('dashboard');
  Route::resource('produits',AdminProductController::class)->except(['show'])->names('products');
  Route::get('/commandes',[AdminOrderController::class,'index'])->name('orders.index');
  Route::patch('/commandes/{order}',[AdminOrderController::class,'update'])->name('orders.update');
 });
});
