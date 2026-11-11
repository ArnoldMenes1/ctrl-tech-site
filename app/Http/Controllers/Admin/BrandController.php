<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;
class BrandController extends Controller {
 public function index(): View {
  $brands=Brand::latest()->paginate(30);
  $brands->getCollection()->transform(function($brand){$brand->products_count=Product::where('brand',$brand->name)->count();return $brand;});
  return view('admin.brands.index',compact('brands'));
 }
 public function store(Request $request): RedirectResponse {
  $data=$request->validate(['name'=>['required','string','max:120'],'description'=>['nullable','string']]);
  Brand::create(['name'=>$data['name'],'slug'=>$this->slug($data['name']),'description'=>$data['description']??null,'is_active'=>true]);
  return back()->with('success','Marque ajoutée.');
 }
 public function update(Request $request,Brand $brand): RedirectResponse {
  $data=$request->validate(['name'=>['required','string','max:120'],'description'=>['nullable','string']]);
  $old=$brand->name;$brand->update(['name'=>$data['name'],'slug'=>$this->slug($data['name'],$brand->id),'description'=>$data['description']??null,'is_active'=>$request->boolean('is_active')]);
  Product::where('brand',$old)->update(['brand'=>$data['name']]);
  return back()->with('success','Marque mise à jour.');
 }
 public function destroy(Brand $brand): RedirectResponse {$brand->update(['is_active'=>false]);return back()->with('success','Marque désactivée.');}
 private function slug(string $name,?int $ignore=null): string {$base=Str::slug($name);$slug=$base;$i=1;while(Brand::where('slug',$slug)->when($ignore,fn($q)=>$q->where('id','!=',$ignore))->exists())$slug=$base.'-'.(++$i);return $slug;}
}
