<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\View\View;
class AccountController extends Controller {
 public function index(Request $request): View {
  return view('account.index',['orders'=>$request->user()->orders()->with('items')->latest()->paginate(10)]);
 }
}
