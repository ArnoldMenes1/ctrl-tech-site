<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\View\View;
class DashboardController extends Controller {
 public function index(): View {
  return view('admin.dashboard',[
   'productsCount'=>Product::count(),'ordersCount'=>Order::count(),
   'pendingOrders'=>Order::whereIn('status',['pending','confirmed','processing'])->count(),
   'categoriesCount'=>Category::count(),'recentOrders'=>Order::latest()->take(8)->get(),
   'lowStock'=>Product::where('is_active',true)->whereColumn('stock_quantity','<=','low_stock_threshold')->count(),
   'unconfirmedPrices'=>Product::where('is_active',true)->where('price_confirmed',false)->count(),
  ]);
 }
}
