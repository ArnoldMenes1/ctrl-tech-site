<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\View\View;
class ReportController extends Controller {
 public function index(): View {
  $paid=Order::with('items')->where('payment_status','paid')->get();
  $all=Order::count();
  $monthly=$paid->groupBy(fn($order)=>$order->created_at->format('Y-m'))->map(fn($rows)=>['orders'=>$rows->count(),'revenue'=>$rows->sum('total')])->sortKeysDesc()->take(12);
  $topProducts=$paid->flatMap->items->groupBy('product_name')->map(fn($rows)=>$rows->sum('quantity'))->sortDesc()->take(8);
  return view('admin.reports.index',['ordersCount'=>$all,'paidCount'=>$paid->count(),'revenue'=>$paid->sum('total'),'monthly'=>$monthly,'topProducts'=>$topProducts]);
 }
}
