<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;
class CategoryController extends Controller {
 public function index(): View {return view('admin.categories.index',['categories'=>Category::withCount('products')->orderBy('sort_order')->paginate(25)]);}
 public function create(): View {return view('admin.categories.form',['category'=>new Category()]);}
 public function store(Request $request): RedirectResponse {$data=$this->validated($request);$data['slug']=$this->slug($data['name']);$data['is_active']=$request->boolean('is_active');Category::create($data);return redirect()->route('admin.categories.index')->with('success','Catégorie créée.');}
 public function edit(Category $category): View {return view('admin.categories.form',compact('category'));}
 public function update(Request $request,Category $category): RedirectResponse {$data=$this->validated($request);$data['slug']=$this->slug($data['name'],$category->id);$data['is_active']=$request->boolean('is_active');$category->update($data);return redirect()->route('admin.categories.index')->with('success','Catégorie mise à jour.');}
 private function validated(Request $request): array {return $request->validate(['name'=>['required','string','max:120'],'description'=>['nullable','string'],'sort_order'=>['required','integer','min:0']]);}
 private function slug(string $name,?int $ignore=null): string {$base=Str::slug($name);$slug=$base;$n=1;while(Category::where('slug',$slug)->when($ignore,fn($q)=>$q->where('id','!=',$ignore))->exists())$slug=$base.'-'.(++$n);return $slug;}
}