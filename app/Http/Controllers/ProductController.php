<?php
namespace App\Http\Controllers;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\View\View;
class ProductController extends Controller {
 public function index(Request $request): View {
  $term=mb_strtolower(trim($request->string('q')->toString()));
  $sort=$request->input('tri');
  $products=Product::with('category')->where('is_active',true)
   ->when($term!=='',fn($q)=>$q->where(fn($s)=>$s->whereRaw('LOWER(name) LIKE ?',["%{$term}%"])->orWhereRaw('LOWER(brand) LIKE ?',["%{$term}%"])->orWhereRaw('LOWER(sku) LIKE ?',["%{$term}%"])))
   ->when($request->filled('categorie'),fn($q)=>$q->whereHas('category',fn($c)=>$c->where('slug',$request->input('categorie'))))
   ->when($request->filled('marque'),fn($q)=>$q->where('brand',$request->input('marque')))
   ->when($request->filled('famille'),fn($q)=>$q->where('family',$request->input('famille')))
   ->when($request->boolean('disponible'),fn($q)=>$q->where('availability_status','in_stock')->where('stock_quantity','>',0))
   ->when($request->filled('prix_min'),fn($q)=>$q->where('price_usd','>=',(float)$request->input('prix_min')))
   ->when($request->filled('prix_max'),fn($q)=>$q->where('price_usd','<=',(float)$request->input('prix_max')))
   ->when($sort==='prix-croissant',fn($q)=>$q->orderBy('price_usd'))
   ->when($sort==='prix-decroissant',fn($q)=>$q->orderByDesc('price_usd'))
   ->when(!in_array($sort,['prix-croissant','prix-decroissant'],true),fn($q)=>$q->latest())
   ->paginate(12)->withQueryString();
  return view('products.index',['products'=>$products,'categories'=>Category::where('is_active',true)->orderBy('sort_order')->get(),'brands'=>Product::where('is_active',true)->whereNotNull('brand')->distinct()->orderBy('brand')->pluck('brand')]);
 }
 public function show(Product $product): View {
  abort_unless($product->is_active,404);
  return view('products.show',['product'=>$product->load(['category','images','variants']),'relatedProducts'=>Product::where('is_active',true)->where('category_id',$product->category_id)->where('id','!=',$product->id)->take(4)->get()]);
 }
}
