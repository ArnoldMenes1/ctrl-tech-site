<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;
class CustomerAuthController extends Controller {
 public function loginForm(): View {return view('auth.login');}
 public function registerForm(): View {return view('auth.register');}
 public function register(Request $request): RedirectResponse {
  $data=$request->validate(['name'=>['required','string','max:160'],'email'=>['required','email','max:190','unique:users,email'],'phone'=>['required','string','max:40'],'password'=>['required','string','min:10','confirmed']]);
  $user=User::create([...$data,'password'=>Hash::make($data['password']),'role'=>'customer','is_active'=>true]);
  Auth::login($user);$request->session()->regenerate();
  return redirect()->route('account.index')->with('success','Votre compte CTRL-Tech est créé.');
 }
 public function login(Request $request): RedirectResponse {
  $data=$request->validate(['email'=>['required','email'],'password'=>['required','string']]);
  if(!Auth::attempt([...$data,'is_active'=>true])) return back()->withErrors(['email'=>'Adresse e-mail ou mot de passe incorrect.'])->onlyInput('email');
  $request->session()->regenerate();
  if($request->user()->role==='admin') return redirect()->route('admin.dashboard');
  return redirect()->intended(route('account.index'));
 }
 public function logout(Request $request): RedirectResponse {
  Auth::logout();$request->session()->invalidate();$request->session()->regenerateToken();
  return redirect()->route('home');
 }
}
