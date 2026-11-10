<?php
namespace Database\Seeders;
use App\Models\Category;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder
{
 public function run(): void {
  foreach([['Ordinateurs','ordinateurs',1],['Téléphones & tablettes','telephones-tablettes',2],['Accessoires','accessoires',3],['Réseaux & connectivité','reseaux-connectivite',4],['Périphériques','peripheriques',5]] as [$name,$slug,$order]){
   Category::query()->updateOrCreate(['slug'=>$slug],['name'=>$name,'is_active'=>true,'sort_order'=>$order]);
  }
  // Aucun produit, prix ou stock fictif n'est généré.
 }
}
