<?php
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CompareController;
use App\Http\Controllers\CustomerAuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/',[HomeController::class,'index'])->name('home');
Route::get('/catalogue',[ProductController::class,'index'])->name('products.index');
Route::get('/produit/{product:slug}',[ProductController::class,'show'])->name('products.show');
Route::get('/panier',[CartController::class,'index'])->name('cart.index');
Route::post('/panier/ajouter/{product}',[CartController::class,'store'])->name('cart.store');
Route::patch('/panier/{product}',[CartController::class,'update'])->name('cart.update');
Route::delete('/panier/{product}',[CartController::class,'destroy'])->name('cart.destroy');
Route::get('/comparer',[CompareController::class,'index'])->name('compare.index');
Route::post('/comparer/ajouter/{product}',[CompareController::class,'add'])->name('compare.add');
Route::delete('/comparer/{product}',[CompareController::class,'remove'])->name('compare.remove');
Route::get('/commande',[CheckoutController::class,'create'])->name('checkout.create');
Route::post('/commande',[CheckoutController::class,'store'])->name('checkout.store');
Route::get('/commande/confirmation/{order:reference}',[CheckoutController::class,'success'])->name('checkout.success');
Route::get('/suivi-commande',[OrderTrackingController::class,'index'])->name('tracking.index');

Route::get('/connexion',[CustomerAuthController::class,'loginForm'])->name('customer.login');
Route::post('/connexion',[CustomerAuthController::class,'login'])->middleware('throttle:8,1')->name('customer.login.submit');
Route::get('/inscription',[CustomerAuthController::class,'registerForm'])->name('customer.register');
Route::post('/inscription',[CustomerAuthController::class,'register'])->middleware('throttle:5,1')->name('customer.register.submit');
Route::post('/deconnexion',[CustomerAuthController::class,'logout'])->name('customer.logout');
Route::middleware('auth')->prefix('compte')->name('account.')->group(function(){
 Route::get('/',[AccountController::class,'index'])->name('index');
});

Route::view('/a-propos','pages.about')->name('about');
Route::view('/contact','pages.contact')->name('contact');
Route::view('/livraison-retours','pages.shipping')->name('shipping');
Route::view('/confidentialite','pages.privacy')->name('privacy');
Route::view('/conditions-generales','pages.terms')->name('terms');

Route::prefix('admin')->name('admin.')->group(function(){
 Route::get('/connexion',[AdminAuthController::class,'show'])->name('login');
 Route::post('/connexion',[AdminAuthController::class,'login'])->middleware('throttle:5,1')->name('login.submit');
 Route::middleware(['auth','admin'])->group(function(){
  Route::post('/deconnexion',[AdminAuthController::class,'logout'])->name('logout');
  Route::get('/',[AdminDashboardController::class,'index'])->name('dashboard');
  Route::resource('produits',AdminProductController::class)->parameters(['produits'=>'product'])->except(['show'])->names(['index'=>'products.index','create'=>'products.create','store'=>'products.store','edit'=>'products.edit','update'=>'products.update','destroy'=>'products.destroy']);
  Route::resource('categories',AdminCategoryController::class)->except(['show','destroy'])->names(['index'=>'categories.index','create'=>'categories.create','store'=>'categories.store','edit'=>'categories.edit','update'=>'categories.update']);
  Route::get('/inventaire',[AdminInventoryController::class,'index'])->name('inventory.index');
  Route::post('/inventaire/{product}',[AdminInventoryController::class,'store'])->name('inventory.store');
  Route::get('/commandes',[AdminOrderController::class,'index'])->name('orders.index');
  Route::patch('/commandes/{order}',[AdminOrderController::class,'update'])->name('orders.update');
 });
});
