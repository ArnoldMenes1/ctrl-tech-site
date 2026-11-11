<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
class InventoryController extends Controller {
 public function index(): View {
  return view('admin.inventory.index',['products'=>Product::orderBy('name')->paginate(25),'movements'=>InventoryMovement::with('product','user')->latest()->take(30)->get()]);
 }
 public function store(Request $request,Product $product): RedirectResponse {
  $data=$request->validate(['type'=>['required','in:restock,adjustment'],'quantity'=>['required','integer','min:1','max:100000'],'reason'=>['required','string','max:255']]);
  DB::transaction(function() use($request,$product,$data){
   $locked=Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
   $next=$data['type']==='restock'?$locked->stock_quantity+$data['quantity']:$data['quantity'];
   $delta=$next-$locked->stock_quantity;$locked->update(['stock_quantity'=>$next,'availability_status'=>$next>0?'in_stock':'out_of_stock']);
   InventoryMovement::create(['product_id'=>$locked->id,'user_id'=>$request->user()->id,'type'=>$data['type'],'quantity'=>$delta,'stock_after'=>$next,'reason'=>$data['reason']]);
  });
  return back()->with('success','Mouvement de stock enregistré.');
 }
}
