<?php
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\TeamController;
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
Route::middleware('auth')->prefix('compte')->name('account.')->group(function(){Route::get('/',[AccountController::class,'index'])->name('index');});
Route::view('/a-propos','pages.about')->name('about');
Route::view('/contact','pages.contact')->name('contact');
Route::view('/livraison-retours','pages.shipping')->name('shipping');
Route::view('/confidentialite','pages.privacy')->name('privacy');
Route::view('/conditions-generales','pages.terms')->name('terms');

Route::prefix('admin')->name('admin.')->group(function(){\n Route::get('/initialisation',[SetupController::class,'show'])->name('setup');\n Route::post('/initialisation',[SetupController::class,'store'])->middleware('throttle:5,1')->name('setup.store');
 Route::get('/connexion',[AdminAuthController::class,'show'])->name('login');
 Route::post('/connexion',[AdminAuthController::class,'login'])->middleware('throttle:5,1')->name('login.submit');
 Route::middleware(['auth','admin'])->group(function(){
  Route::post('/deconnexion',[AdminAuthController::class,'logout'])->name('logout');\n  Route::get('/profil',[ProfileController::class,'edit'])->name('profile.edit');\n  Route::patch('/profil',[ProfileController::class,'update'])->name('profile.update');
  Route::get('/',[AdminDashboardController::class,'index'])->name('dashboard');
  Route::middleware('permission:catalog')->group(function(){
   Route::resource('produits',AdminProductController::class)->parameters(['produits'=>'product'])->except(['show'])->names(['index'=>'products.index','create'=>'products.create','store'=>'products.store','edit'=>'products.edit','update'=>'products.update','destroy'=>'products.destroy']);
   Route::resource('categories',AdminCategoryController::class)->except(['show','destroy'])->names(['index'=>'categories.index','create'=>'categories.create','store'=>'categories.store','edit'=>'categories.edit','update'=>'categories.update']);
   Route::get('/marques',[BrandController::class,'index'])->name('brands.index');
   Route::post('/marques',[BrandController::class,'store'])->name('brands.store');
   Route::patch('/marques/{brand}',[BrandController::class,'update'])->name('brands.update');
   Route::delete('/marques/{brand}',[BrandController::class,'destroy'])->name('brands.destroy');
   Route::get('/inventaire',[InventoryController::class,'index'])->name('inventory.index');
   Route::post('/inventaire/{product}',[InventoryController::class,'store'])->name('inventory.store');
  });
  Route::middleware('permission:orders')->group(function(){
   Route::get('/commandes',[AdminOrderController::class,'index'])->name('orders.index');
   Route::patch('/commandes/{order}',[AdminOrderController::class,'update'])->name('orders.update');
  });
  Route::middleware('permission:customers')->group(function(){
   Route::get('/clients',[CustomerController::class,'index'])->name('customers.index');
   Route::patch('/clients/{user}/etat',[CustomerController::class,'toggle'])->name('customers.toggle');
  });
  Route::middleware('permission:promotions')->group(function(){
   Route::get('/promotions',[PromotionController::class,'index'])->name('promotions.index');
   Route::post('/promotions',[PromotionController::class,'store'])->name('promotions.store');
   Route::patch('/promotions/{promotion}',[PromotionController::class,'update'])->name('promotions.update');
   Route::delete('/promotions/{promotion}',[PromotionController::class,'destroy'])->name('promotions.destroy');
  });
  Route::middleware('permission:reports')->get('/rapports',[ReportController::class,'index'])->name('reports.index');
  Route::middleware('permission:team')->group(function(){
   Route::get('/equipe',[TeamController::class,'index'])->name('team.index');
   Route::post('/equipe',[TeamController::class,'store'])->name('team.store');
   Route::patch('/equipe/{user}',[TeamController::class,'update'])->name('team.update');
  });
 });
});
