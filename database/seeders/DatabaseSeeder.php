<?php
namespace Database\Seeders;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder {
 public function run(): void {
  $categories=[
   ['Ordinateurs','ordinateurs',1],['Téléphones & tablettes','telephones-tablettes',2],
   ['Accessoires','accessoires',3],['Réseaux & connectivité','reseaux-connectivite',4],['Périphériques','peripheriques',5],
  ];
  foreach($categories as [$name,$slug,$order]) Category::updateOrCreate(['slug'=>$slug],['name'=>$name,'is_active'=>true,'sort_order'=>$order]);
  $phoneCategory=Category::where('slug','telephones-tablettes')->firstOrFail();
  $source='https://take.app/matikbusiness';
  $items=[
   ['samsung-galaxy-a05','Samsung Galaxy A05','Samsung','galaxy-a-series',120,'https://cdn.beebom.com/mobile/samsung-galaxy-a05-front-and-back-6.png','Écran 6,7 pouces HD+, appareil photo principal 50 MP et batterie 5 000 mAh.'],
   ['samsung-galaxy-a05s','Samsung Galaxy A05s','Samsung','galaxy-a-series',135,'https://cdn.beebom.com/mobile/samsung-galaxy-a05s-front-and-back-6.png','Smartphone de la gamme Galaxy A05s référencé dans le catalogue local.'],
   ['samsung-galaxy-a16','Samsung Galaxy A16','Samsung','galaxy-a-series',170,'https://welectronics.com/images/stories/virtuemart/product/SamsungGalaxyA16blue16.jpg','Écran Super AMOLED 6,7 pouces, appareil photo principal 50 MP et batterie 5 000 mAh.'],
   ['samsung-galaxy-a26','Samsung Galaxy A26','Samsung','galaxy-a-series',250,'https://cdn.mafrservices.com/pim-content/UAE/media/product/2237693/1741929003/2237693_main.jpg','Smartphone Galaxy A26 5G, écran 6,7 pouces et batterie 5 000 mAh.'],
   ['samsung-galaxy-a36','Samsung Galaxy A36','Samsung','galaxy-a-series',300,'https://gangaelectronica.es/712319-large_default/smartphone-samsung-galaxy-a36-6gb-128gb-6-7-5g-negro.jpg','Smartphone Galaxy A36 5G, écran Super AMOLED 120 Hz et batterie 5 000 mAh.'],
   ['samsung-galaxy-a56','Samsung Galaxy A56','Samsung','galaxy-a-series',380,'https://static01.galaxus.com/productimages/3/5/3/9/6/0/1/5/0/7/9/9/2/8/4/7/4/3/ced3903e-b3b5-4903-88b1-f3f49e89f851.jpg_sea.jpeg','Smartphone Galaxy A56 5G, écran Super AMOLED 120 Hz et batterie 5 000 mAh.'],
   ['samsung-galaxy-s25','Samsung Galaxy S25','Samsung','galaxy-s-series',860,'https://multimedia.bbycastatic.ca/multimedia/products/1500x1500/189/18925/18925584.jpg','Smartphone Samsung Galaxy S25, gamme premium et triple appareil photo.'],
   ['apple-iphone-11','Apple iPhone 11','Apple','iphone',340,'https://media-ik.croma.com/Croma%20Assets/Communication/Mobiles/Images/230107_t40uo8.png','Écran Liquid Retina 6,1 pouces, puce A13 Bionic et double appareil photo 12 MP.'],
   ['apple-iphone-12','Apple iPhone 12','Apple','iphone',470,'https://media.ldlc.com/r1600/ld/products/00/05/94/15/LD0005941549.jpg','Écran Super Retina XDR 6,1 pouces, puce A14 Bionic et connectivité 5G.'],
   ['apple-iphone-16','Apple iPhone 16','Apple','iphone',900,'https://res.cloudinary.com/telia-pim/image/upload/v1725969455/pood/apple/nutitelefonid/iphone-16/sinine/128-gb/myec3hxa/apple-iphone-16-nutitelefon-sinine-eest-tagant-koos.png','Écran Super Retina XDR 6,1 pouces, puce A18 et double appareil photo avancé.'],
  ];
  foreach($items as $index=>$item) {
   [$slug,$name,$brand,$family,$price,$image,$description]=$item;
   Product::updateOrCreate(['slug'=>$slug],[
    'category_id'=>$phoneCategory->id,'name'=>$name,'brand'=>$brand,'family'=>$family,
    'short_description'=>'Référence repérée dans un catalogue de vente à Lubumbashi. Prix et disponibilité CTRL-Tech à confirmer.',
    'description'=>$description.' Le tarif affiché est un prix repère public relevé dans un catalogue local indépendant, et non une confirmation du prix de vente CTRL-Tech.',
    'price_usd'=>$price,'price_confirmed'=>false,'price_cdf'=>null,'image_path'=>$image,
    'stock_quantity'=>0,'availability_status'=>'to_confirm','source_name'=>'Matik Business — catalogue local','source_url'=>$source,
    'is_active'=>true,'is_featured'=>$index<4,'low_stock_threshold'=>2,
    'specifications'=>['Référence locale'=>'Catalogue Matik Business','Prix affiché'=>'Prix repère en USD','Disponibilité'=>'À confirmer auprès de CTRL-Tech'],
   ]);
  }
  if(env('ADMIN_EMAIL') && env('ADMIN_PASSWORD')) $this->call(AdminUserSeeder::class);
 }
}
