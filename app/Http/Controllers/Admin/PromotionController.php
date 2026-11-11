<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;
class PromotionController extends Controller {
 public function index(): View {return view('admin.promotions.index',['promotions'=>Promotion::latest()->paginate(20)]);}
 public function store(Request $request): RedirectResponse {
  $data=$this->validated($request);$data['code']=$data['code']?Str::upper(trim($data['code'])):null;$data['is_active']=$request->boolean('is_active');Promotion::create($data);
  return back()->with('success','Promotion créée.');
 }
 public function update(Request $request,Promotion $promotion): RedirectResponse {
  $data=$this->validated($request,$promotion);$data['code']=$data['code']?Str::upper(trim($data['code'])):null;$data['is_active']=$request->boolean('is_active');$promotion->update($data);
  return back()->with('success','Promotion mise à jour.');
 }
 public function destroy(Promotion $promotion): RedirectResponse {$promotion->update(['is_active'=>false]);return back()->with('success','Promotion désactivée.');}
 private function validated(Request $request,?Promotion $promotion=null): array {
  return $request->validate(['name'=>['required','string','max:140'],'code'=>['nullable','string','max:40','unique:promotions,code,'.($promotion?->id??'NULL')],'type'=>['required','in:percentage,fixed'],'value'=>['required','numeric','gt:0','max:100000'],'minimum_order'=>['nullable','numeric','min:0'],'starts_at'=>['nullable','date'],'ends_at'=>['nullable','date','after_or_equal:starts_at'],'usage_limit'=>['nullable','integer','min:1'],'usage_count'=>['nullable','integer','min:0']]);
 }
}