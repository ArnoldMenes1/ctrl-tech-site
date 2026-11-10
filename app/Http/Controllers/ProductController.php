<?php
namespace App\Http\Controllers;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\View\View;
class ProductController extends Controller
{
 public function index(Request $request): View {
  $term=$request->string('q')->toString();
  $products=Product::with('category')->where('is_active',true)
   ->when($term!=='',fn($q)=>$q->where(fn($s)=>$s->where('name','like',"%{$term}%")->orWhere('brand','like',"%{$term}%")->orWhere('sku','like',"%{$term}%")))
   ->when($request->filled('categorie'),fn($q)=>$q->whereHas('category',fn($c)=>$c->where('slug',$request->input('categorie'))))
   ->when($request->input('tri')==='prix-croissant',fn($q)=>$q->orderBy('price_usd'))
   ->when($request->input('tri')==='prix-decroissant',fn($q)=>$q->orderByDesc('price_usd'))
   ->when(!in_array($request->input('tri'),['prix-croissant','prix-decroissant'],true),fn($q)=>$q->latest())
   ->paginate(12)->withQueryString();
  return view('products.index',['products'=>$products,'categories'=>Category::where('is_active',true)->orderBy('sort_order')->get()]);
 }
 public function show(Product $product): View {
  abort_unless($product->is_active,404);
  return view('products.show',['product'=>$product->load('category'),'relatedProducts'=>Product::where('is_active',true)->where('category_id',$product->category_id)->whereKeyNot($product->id)->take(4)->get()]);
 }
}
