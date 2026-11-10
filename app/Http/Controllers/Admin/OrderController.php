<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
class OrderController extends Controller {
 public function index(): View {return view('admin.orders.index',['orders'=>Order::with('items')->latest()->paginate(20)]);}
 public function update(Request $request,Order $order): RedirectResponse {
  $data=$request->validate(['status'=>['required','in:pending,confirmed,processing,ready,shipped,completed,cancelled'],'payment_status'=>['required','in:unpaid,pending,paid,refunded']]);
  $order->update($data);return back()->with('success','Commande mise à jour.');
 }
}
