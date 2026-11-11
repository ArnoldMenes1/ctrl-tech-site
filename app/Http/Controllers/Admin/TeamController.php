<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;
class TeamController extends Controller {
 private array $roles=['admin','manager','catalog_manager','operator','analyst'];
 public function index(): View {return view('admin.team.index',['members'=>User::whereIn('role',$this->roles)->latest()->paginate(30)]);}
 public function store(Request $request): RedirectResponse {
  $data=$request->validate(['name'=>['required','string','max:160'],'email'=>['required','email','max:190','unique:users,email'],'password'=>['required','string','min:12'],'role'=>['required','in:admin,manager,catalog_manager,operator,analyst']]);
  User::create([...$data,'password'=>Hash::make($data['password']),'is_active'=>true]);
  return back()->with('success','Membre ajouté à l’équipe.');
 }
 public function update(Request $request,User $user): RedirectResponse {
  abort_if($user->id===$request->user()->id,422,'Vous ne pouvez pas modifier votre propre rôle depuis cet écran.');
  $data=$request->validate(['role'=>['required','in:admin,manager,catalog_manager,operator,analyst'],'is_active'=>['nullable','boolean']]);
  $user->update(['role'=>$data['role'],'is_active'=>$request->boolean('is_active')]);
  return back()->with('success','Droits du membre mis à jour.');
 }
}
