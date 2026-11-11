<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
class CustomerController extends Controller {
 public function index(): View {return view('admin.customers.index',['customers'=>User::where('role','customer')->withCount('orders')->latest()->paginate(30)]);}
 public function toggle(Request $request,User $user): RedirectResponse {
  abort_unless($user->role==='customer',404);
  $user->update(['is_active'=>!$user->is_active]);
  return back()->with('success',$user->is_active?'Compte client réactivé.':'Compte client désactivé.');
 }
}
