<?php
namespace App\Http\Controllers;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
class CheckoutController extends Controller {
 public function create(Request $request): View|RedirectResponse {
  $cart=$this->cart($request);
  if($cart['items']===[]) return redirect()->route('cart.index')->with('error','Votre panier est vide ou certains prix doivent encore être confirmés.');
  return view('checkout.create',compact('cart'));
 }
 public function store(Request $request): RedirectResponse {
  $data=$request->validate([
   'customer_name'=>['required','string','max:160'],'customer_email'=>['required','email','max:190'],
   'customer_phone'=>['required','string','max:40'],'delivery_address'=>['required','string','max:500'],
   'delivery_area'=>['required','string','max:120'],'currency'=>['required','in:USD,CDF'],
   'delivery_method'=>['required','in:local_delivery,pickup'],'notes'=>['nullable','string','max:1000'],
  ]);
  $cart=$request->session()->get('cart',[]);
  if($cart===[]) return redirect()->route('cart.index')->with('error','Votre panier est vide.');
  $rate=(float)config('storefront.usd_to_cdf_rate',2800);
  try {
   $order=DB::transaction(function() use($data,$cart,$rate,$request) {
    $lines=[];$subtotalUsd=0;
    foreach($cart as $id=>$line) {
     $product=Product::whereKey($id)->where('is_active',true)->lockForUpdate()->first();
     $qty=(int)($line['quantity']??0);
     if(!$product || !$product->price_confirmed || !$product->price_usd || $qty<1) throw ValidationException::withMessages(['cart'=>'Un produit n’est plus disponible au prix affiché. Actualisez votre panier.']);
     if($product->stock_quantity<$qty) throw ValidationException::withMessages(['cart'=>'Stock insuffisant pour '.$product->name.'. Contactez notre équipe pour confirmer le délai.']);
     $lines[]=['product'=>$product,'quantity'=>$qty,'unit_usd'=>(float)$product->price_usd];
     $subtotalUsd+=(float)$product->price_usd*$qty;
    }
    $currency=$data['currency'];$subtotal=$currency==='CDF'?round($subtotalUsd*$rate,2):$subtotalUsd;
    $order=Order::create([
     'user_id'=>$request->user()?->id,'reference'=>'CT-'.Str::upper(Str::random(8)),
     'customer_name'=>$data['customer_name'],'customer_email'=>$data['customer_email'],'customer_phone'=>$data['customer_phone'],
     'delivery_address'=>$data['delivery_address'],'delivery_area'=>$data['delivery_area'],'delivery_method'=>$data['delivery_method'],
     'notes'=>$data['notes']??null,'currency'=>$currency,'subtotal'=>$subtotal,'delivery_fee'=>0,'total'=>$subtotal,
     'status'=>'pending','payment_status'=>'unpaid',
    ]);
    foreach($lines as $line) {
     $product=$line['product'];$qty=$line['quantity'];
     $unit=$currency==='CDF'?round($line['unit_usd']*$rate,2):$line['unit_usd'];
     $order->items()->create(['product_id'=>$product->id,'product_name'=>$product->name,'sku'=>$product->sku,'quantity'=>$qty,'unit_price'=>$unit,'line_total'=>$unit*$qty]);
     $product->decrement('stock_quantity',$qty);
     $product->update(['availability_status'=>$product->fresh()->stock_quantity>0?'in_stock':'out_of_stock']);
     InventoryMovement::create(['product_id'=>$product->id,'user_id'=>$request->user()?->id,'type'=>'sale','quantity'=>-$qty,'stock_after'=>$product->fresh()->stock_quantity,'reason'=>'Vente e-commerce','reference'=>$order->reference]);
    }
    return $order;
   });
  } catch(ValidationException $e) {throw $e;}
  $request->session()->forget('cart');
  return redirect()->route('checkout.success',['order'=>$order->reference]);
 }
 public function success(Order $order): View {return view('checkout.success',['order'=>$order->load('items')]);}
 private function cart(Request $request): array {
  $items=[];$subtotal=0;
  foreach($request->session()->get('cart',[]) as $id=>$line) {
   $product=Product::where('is_active',true)->where('price_confirmed',true)->whereNotNull('price_usd')->find($id);
   if(!$product) continue;
   $qty=(int)$line['quantity'];$lineTotal=(float)$product->price_usd*$qty;
   $items[]=['product'=>$product,'quantity'=>$qty,'line_total'=>$lineTotal];$subtotal+=$lineTotal;
  }
  return ['items'=>$items,'subtotal'=>$subtotal,'count'=>array_sum(array_column($items,'quantity'))];
 }
}
