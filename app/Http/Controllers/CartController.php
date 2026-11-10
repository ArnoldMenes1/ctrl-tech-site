<?php
namespace App\Http\Controllers;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
class CartController extends Controller
{
 public function index(Request $request): View {return view('cart.index',['cart'=>$this->cart($request)]);}
 public function store(Request $request,Product $product): RedirectResponse {
  abort_unless($product->is_active,404);if($product->price_usd===null)return back()->with('error','Le prix de ce produit doit être confirmé avant son ajout au panier.');$qty=max(1,min(10,(int)$request->input('quantity',1)));$cart=$request->session()->get('cart',[]);$cart[$product->id]=['quantity'=>min(10,(int)($cart[$product->id]['quantity']??0)+$qty)];$request->session()->put('cart',$cart);
  return back()->with('success','Produit ajouté au panier.');
 }
 public function update(Request $request,Product $product): RedirectResponse {
  $data=$request->validate(['quantity'=>['required','integer','min:1','max:10']]);$cart=$request->session()->get('cart',[]);
  if(isset($cart[$product->id])){$cart[$product->id]['quantity']=$data['quantity'];$request->session()->put('cart',$cart);}
  return back()->with('success','Panier mis à jour.');
 }
 public function destroy(Request $request,Product $product): RedirectResponse {$cart=$request->session()->get('cart',[]);unset($cart[$product->id]);$request->session()->put('cart',$cart);return back()->with('success','Produit retiré du panier.');}
 private function cart(Request $request): array {
  $items=[];$subtotal=0;
  foreach($request->session()->get('cart',[]) as $id=>$line){$product=Product::where('is_active',true)->whereNotNull('price_usd')->find($id);if(!$product)continue;$qty=(int)$line['quantity'];$lineTotal=(float)$product->price_usd*$qty;$items[]=['product'=>$product,'quantity'=>$qty,'line_total'=>$lineTotal];$subtotal+=$lineTotal;}
  return ['items'=>$items,'subtotal'=>$subtotal,'count'=>array_sum(array_column($items,'quantity'))];
 }
}
