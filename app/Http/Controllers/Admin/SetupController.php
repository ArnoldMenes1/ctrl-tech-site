<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;
class SetupController extends Controller {
 public function show(Request $request): View {
  abort_if(User::where('role','admin')->exists(),404);
  abort_unless($this->validToken((string)$request->query('token')),404);
  return view('admin.setup',['token'=>$request->query('token')]);
 }
 public function store(Request $request): RedirectResponse {
  abort_if(User::where('role','admin')->exists(),404);
  $data=$request->validate(['token'=>['required','string'],'name'=>['required','string','max:160'],'email'=>['required','email','max:190','unique:users,email'],'password'=>['required','string','min:12','confirmed']]);
  abort_unless($this->validToken($data['token']),404);
  $user=User::create(['name'=>$data['name'],'email'=>$data['email'],'password'=>Hash::make($data['password']),'role'=>'admin','is_active'=>true]);
  Auth::login($user);$request->session()->regenerate();
  return redirect()->route('admin.dashboard')->with('success','Compte administrateur initialisé.');
 }
 private function validToken(string $token): bool {
  $secret=(string)env('ADMIN_SETUP_TOKEN','');
  return $secret!=='' && $token!=='' && hash_equals($secret,$token);
 }
}
