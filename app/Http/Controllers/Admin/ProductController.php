<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;
class ProductController extends Controller {
 public function index(): View {return view('admin.products.index',['products'=>Product::with('category')->latest()->paginate(20)]);}
 public function create(): View {return view('admin.products.form',['product'=>new Product(),'categories'=>Category::orderBy('name')->get()]);}
 public function store(Request $request): RedirectResponse {
  $data=$this->validated($request);$data['slug']=$this->uniqueSlug($data['name']);$data['is_active']=$request->boolean('is_active');$data['is_featured']=$request->boolean('is_featured');Product::create($data);
  return redirect()->route('admin.products.index')->with('success','Produit créé.');
 }
 public function edit(Product $product): View {return view('admin.products.form',['product'=>$product,'categories'=>Category::orderBy('name')->get()]);}
 public function update(Request $request,Product $product): RedirectResponse {
  $data=$this->validated($request);$data['slug']=$this->uniqueSlug($data['name'],$product->id);$data['is_active']=$request->boolean('is_active');$data['is_featured']=$request->boolean('is_featured');$product->update($data);
  return redirect()->route('admin.products.index')->with('success','Produit mis à jour.');
 }
 public function destroy(Product $product): RedirectResponse {$product->update(['is_active'=>false]);return back()->with('success','Produit désactivé.');}
 private function validated(Request $request): array {
  return $request->validate(['category_id'=>['nullable','exists:categories,id'],'name'=>['required','string','max:180'],'sku'=>['nullable','string','max:80','unique:products,sku,'.($request->route('product')?->id ?? 'NULL')],'brand'=>['nullable','string','max:120'],'short_description'=>['nullable','string','max:255'],'description'=>['nullable','string'],'price_usd'=>['nullable','numeric','min:0'],'price_cdf'=>['nullable','numeric','min:0'],'stock_quantity'=>['required','integer','min:0'],'image_path'=>['nullable','string','max:255']]);
 }
 private function uniqueSlug(string $name,?int $ignore=null): string {$base=Str::slug($name);$slug=$base;$n=1;while(Product::where('slug',$slug)->when($ignore,fn($q)=>$q->where('id','!=',$ignore))->exists())$slug=$base.'-'.(++$n);return $slug;}
}
