<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\View\View;
class DashboardController extends Controller {
 public function index(): View {return view('admin.dashboard',['productsCount'=>Product::count(),'ordersCount'=>Order::count(),'pendingOrders'=>Order::where('status','pending')->count(),'categoriesCount'=>Category::count(),'recentOrders'=>Order::latest()->take(8)->get()]);}
}
