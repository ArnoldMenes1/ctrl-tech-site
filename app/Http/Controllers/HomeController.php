<?php
namespace App\Http\Controllers;
use App\Models\Category;
use App\Models\Product;
use Illuminate\View\View;
class HomeController extends Controller
{
 public function index(): View {
  return view('home',['featuredProducts'=>Product::with('category')->where('is_active',true)->where('is_featured',true)->latest()->take(8)->get(),'categories'=>Category::where('is_active',true)->orderBy('sort_order')->get()]);
 }
}
