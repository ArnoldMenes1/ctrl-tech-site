<?php
namespace App\Http\Controllers;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;
class CheckoutController extends Controller
{
 public function create(Request $request): View|RedirectResponse {
  $cart=$this->cart($request);if($cart['items']===[])return redirect()->route('cart.index')->with('error','Votre panier est vide.');
  return view('checkout.create',compact('cart'));
 }
 public function store(Request $request): RedirectResponse {
  $cart=$this->cart($request);if($cart['items']===[])return redirect()->route('cart.index')->with('error','Votre panier est vide.');
  $data=$request->validate(['customer_name'=>['required','string','max:160'],'customer_email'=>['required','email','max:190'],'customer_phone'=>['required','string','max:40'],'delivery_address'=>['required','string','max:500'],'delivery_area'=>['required','string','max:120'],'currency'=>['required','in:USD,CDF'],'notes'=>['nullable','string','max:1000']]);
  $rate=(float)config('storefront.usd_to_cdf_rate',2800);$subtotal=$data['currency']==='CDF'?round($cart['subtotal']*$rate,2):$cart['subtotal'];
  $order=Order::create(['reference'=>'CT-'.Str::upper(Str::random(8)),...$data,'subtotal'=>$subtotal,'delivery_fee'=>0,'total'=>$subtotal,'status'=>'pending','payment_status'=>'unpaid']);
  foreach($cart['items'] as $line){$unit=$data['currency']==='CDF'?round((float)$line['product']->price_usd*$rate,2):(float)$line['product']->price_usd;$order->items()->create(['product_id'=>$line['product']->id,'product_name'=>$line['product']->name,'sku'=>$line['product']->sku,'quantity'=>$line['quantity'],'unit_price'=>$unit,'line_total'=>$unit*$line['quantity']]);}
  $request->session()->forget('cart');return redirect()->route('checkout.success',$order);
 }
 public function success(Order $order): View {return view('checkout.success',['order'=>$order->load('items')]);}
 private function cart(Request $request): array {
  $items=[];$subtotal=0;foreach($request->session()->get('cart',[]) as $id=>$line){$product=Product::where('is_active',true)->find($id);if(!$product)continue;$qty=(int)$line['quantity'];$lineTotal=(float)$product->price_usd*$qty;$items[]=['product'=>$product,'quantity'=>$qty,'line_total'=>$lineTotal];$subtotal+=$lineTotal;}
  return ['items'=>$items,'subtotal'=>$subtotal,'count'=>array_sum(array_column($items,'quantity'))];
 }
}
