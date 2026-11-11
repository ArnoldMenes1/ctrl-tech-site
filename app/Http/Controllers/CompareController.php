<?php
namespace App\Http\Controllers;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
class CompareController extends Controller {
 public function index(Request $request): View {
  $ids=$request->session()->get('compare',[]);
  $products=Product::whereIn('id',$ids)->where('is_active',true)->get();
  return view('compare.index',compact('products'));
 }
 public function add(Request $request,Product $product): RedirectResponse {
  abort_unless($product->is_active,404);
  $ids=$request->session()->get('compare',[]);
  if(in_array($product->id,$ids,true)) return back()->with('success','Ce produit est déjà dans le comparateur.');
  if(count($ids)>=3) return back()->with('error','Le comparateur accepte trois produits maximum.');
  if($ids!==[]) {
   $first=Product::find($ids[0]);
   if(!$first || !$first->family || $first->family!==$product->family) return back()->with('error','Comparez uniquement des produits appartenant à la même famille.');
  }
  $ids[]=$product->id;$request->session()->put('compare',$ids);
  return back()->with('success','Produit ajouté au comparateur.');
 }
 public function remove(Request $request,Product $product): RedirectResponse {
  $request->session()->put('compare',array_values(array_filter($request->session()->get('compare',[]),fn($id)=>(int)$id!==$product->id)));
  return back()->with('success','Produit retiré du comparateur.');
 }
}
