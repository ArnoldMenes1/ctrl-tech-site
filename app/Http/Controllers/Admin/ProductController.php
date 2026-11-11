<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;
class ProductController extends Controller {
 public function index(): View {return view('admin.products.index',['products'=>Product::with('category')->latest()->paginate(20)]);}
 public function create(): View {return view('admin.products.form',['product'=>new Product(),'categories'=>Category::orderBy('name')->get()]);}
 public function store(Request $request): RedirectResponse {
  $data=$this->validated($request);$data['slug']=$this->uniqueSlug($data['name']);$data['is_active']=$request->boolean('is_active');$data['is_featured']=$request->boolean('is_featured');$data['price_confirmed']=$request->boolean('price_confirmed');
  if($request->hasFile('image')) $data['image_path']=$request->file('image')->store('products','public');
  $product=Product::create($data);
  if($product->stock_quantity>0) InventoryMovement::create(['product_id'=>$product->id,'user_id'=>$request->user()->id,'type'=>'initial','quantity'=>$product->stock_quantity,'stock_after'=>$product->stock_quantity,'reason'=>'Stock initial']);
  return redirect()->route('admin.products.index')->with('success','Produit créé.');
 }
 public function edit(Product $product): View {return view('admin.products.form',['product'=>$product,'categories'=>Category::orderBy('name')->get()]);}
 public function update(Request $request,Product $product): RedirectResponse {
  $oldStock=$product->stock_quantity;$data=$this->validated($request);$data['slug']=$this->uniqueSlug($data['name'],$product->id);
  $data['is_active']=$request->boolean('is_active');$data['is_featured']=$request->boolean('is_featured');$data['price_confirmed']=$request->boolean('price_confirmed');
  if($request->hasFile('image')) {if($product->image_path && !Str::startsWith($product->image_path,['http://','https://'])) Storage::disk('public')->delete($product->image_path);$data['image_path']=$request->file('image')->store('products','public');}
  $product->update($data);$delta=$product->stock_quantity-$oldStock;
  if($delta!==0) InventoryMovement::create(['product_id'=>$product->id,'user_id'=>$request->user()->id,'type'=>$delta>0?'restock':'adjustment','quantity'=>$delta,'stock_after'=>$product->stock_quantity,'reason'=>'Ajustement depuis la fiche produit']);
  return redirect()->route('admin.products.index')->with('success','Produit mis à jour.');
 }
 public function destroy(Product $product): RedirectResponse {$product->update(['is_active'=>false]);return back()->with('success','Produit désactivé.');}
 private function validated(Request $request): array {
  return $request->validate([
   'category_id'=>['nullable','exists:categories,id'],'name'=>['required','string','max:180'],
   'sku'=>['nullable','string','max:80','unique:products,sku,'.($request->route('product')?->id??'NULL')],
   'brand'=>['nullable','string','max:120'],'family'=>['nullable','string','max:120'],
   'short_description'=>['nullable','string','max:255'],'description'=>['nullable','string'],
   'price_usd'=>['nullable','numeric','min:0'],'price_cdf'=>['nullable','numeric','min:0'],
   'availability_status'=>['required','in:in_stock,out_of_stock,to_confirm,preorder'],
   'stock_quantity'=>['required','integer','min:0'],'low_stock_threshold'=>['required','integer','min:0'],
   'source_name'=>['nullable','string','max:160'],'source_url'=>['nullable','url','max:500'],
   'image'=>['nullable','image','max:5120'],'specifications'=>['nullable','array'],
  ]);
 }
 private function uniqueSlug(string $name,?int $ignore=null): string {$base=Str::slug($name);$slug=$base;$n=1;while(Product::where('slug',$slug)->when($ignore,fn($q)=>$q->where('id','!=',$ignore))->exists())$slug=$base.'-'.(++$n);return $slug;}
}
