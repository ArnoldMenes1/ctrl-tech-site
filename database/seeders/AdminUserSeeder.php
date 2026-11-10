<?php
namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
class AdminUserSeeder extends Seeder {
 public function run(): void {
  $email=env('ADMIN_EMAIL');$password=env('ADMIN_PASSWORD');$name=env('ADMIN_NAME','Administrateur CTRL-Tech');
  if(!$email || !$password || strlen($password)<12) throw new RuntimeException('Définissez ADMIN_EMAIL et ADMIN_PASSWORD (12 caractères minimum) dans .env avant de créer le compte admin.');
  User::updateOrCreate(['email'=>$email],['name'=>$name,'password'=>Hash::make($password),'role'=>'admin']);
 }
}
