<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
class OrderController extends Controller {
 public function index(): View {return view('admin.orders.index',['orders'=>Order::with('items')->latest()->paginate(20)]);}
 public function update(Request $request,Order $order): RedirectResponse {
  $data=$request->validate(['status'=>['required','in:pending,confirmed,processing,ready,shipped,completed,cancelled'],'payment_status'=>['required','in:unpaid,pending,paid,refunded']]);
  if($order->status==='cancelled' && $data['status']!=='cancelled') return back()->with('error','Une commande annulée ne peut pas être réactivée. Créez une nouvelle commande si nécessaire.');
  DB::transaction(function() use($request,$order,$data) {
   if($data['status']==='cancelled' && $order->status!=='cancelled') {
    foreach($order->items as $item) {
     if(!$item->product_id) continue;
     $product=Product::whereKey($item->product_id)->lockForUpdate()->first();
     if(!$product) continue;
     $product->increment('stock_quantity',$item->quantity);
     $product->update(['availability_status'=>'in_stock']);
     InventoryMovement::create(['product_id'=>$product->id,'user_id'=>$request->user()->id,'type'=>'return','quantity'=>$item->quantity,'stock_after'=>$product->fresh()->stock_quantity,'reason'=>'Annulation commande '.$order->reference,'reference'=>$order->reference]);
    }
   }
   $order->update($data);
  });
  return back()->with('success','Commande mise à jour.');
 }
}
