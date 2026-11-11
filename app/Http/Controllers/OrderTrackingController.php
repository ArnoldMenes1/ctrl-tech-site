<?php
namespace App\Http\Controllers;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\View\View;
class OrderTrackingController extends Controller {
 public function index(Request $request): View {
  $order=null;
  if($request->filled('reference') && $request->filled('email')) {
   $order=Order::with('items')->where('reference',trim($request->input('reference')))->where('customer_email',trim($request->input('email')))->first();
  }
  return view('tracking.index',compact('order'));
 }
}
