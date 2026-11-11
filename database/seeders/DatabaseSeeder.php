<?php
namespace Database\Seeders;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
class DatabaseSeeder extends Seeder {
 public function run(): void {
  $categories=[
   ['Ordinateurs','ordinateurs',1],['Téléphones & tablettes','telephones-tablettes',2],
   ['Accessoires','accessoires',3],['Réseaux & connectivité','reseaux-connectivite',4],
   ['Périphériques','peripheriques',5],['Impression & bureautique','impression-bureautique',6],
  ];
  foreach($categories as [$name,$slug,$order]) Category::updateOrCreate(['slug'=>$slug],['name'=>$name,'is_active'=>true,'sort_order'=>$order]);
  foreach(['Samsung','Apple','Tecno','Infinix','itel','Lenovo','HP','Dell','Epson','Canon','Brother','Acer','Logitech','Generic'] as $brand) Brand::updateOrCreate(['slug'=>Str::slug($brand)],['name'=>$brand,'is_active'=>true]);
  $sources=[
   'matik'=>['Matik Business — Lubumbashi','https://take.app/matikbusiness'],
   'telephone'=>['Telephone Lubumbashi — Avenue Mama Yemo','https://instasoko.africa/cd/fr/lubumbashi/s/lub-telephone'],
   'bcs'=>['BCS-IT — Lubumbashi','https://www.bcs-itcd.com/produits'],
  ];
  $items=[
   ['samsung-galaxy-a05','Samsung Galaxy A05','Samsung','galaxy-a-series','telephones-tablettes',120,'https://cdn.beebom.com/mobile/samsung-galaxy-a05-front-and-back-6.png','Écran 6,7 pouces HD+, caméra principale 50 MP et batterie 5 000 mAh.','matik'],
   ['samsung-galaxy-a05s','Samsung Galaxy A05s','Samsung','galaxy-a-series','telephones-tablettes',135,'https://cdn.beebom.com/mobile/samsung-galaxy-a05s-front-and-back-6.png','Smartphone de la gamme Galaxy A05s référencé dans le catalogue local.','matik'],
   ['samsung-galaxy-a06','Samsung Galaxy A06 4 Go / 64 Go','Samsung','galaxy-a-series','telephones-tablettes',115,'https://files.foxtrot.com.ua/PhotoNew/img_0_60_10487_0_1_lCTXfD.jpg','Écran 6,7 pouces, caméra 50 MP et batterie 5 000 mAh.','matik'],
   ['samsung-galaxy-a14','Samsung Galaxy A14 4 Go / 64 Go','Samsung','galaxy-a-series','telephones-tablettes',150,'https://www.notebookcheck.net/uploads/tx_nbc2/Samsung_Galaxy_A14.jpg','Écran 6,6 pouces FHD+, caméra principale 50 MP et batterie 5 000 mAh.','matik'],
   ['samsung-galaxy-a15','Samsung Galaxy A15 4 Go / 128 Go','Samsung','galaxy-a-series','telephones-tablettes',180,'https://www.reuse.mx/cdn/shop/files/1_3783a97e-e772-4b91-982d-86550ce72fe6.png?v=1778528536&width=1214','Écran Super AMOLED 6,5 pouces et triple appareil photo.','matik'],
   ['samsung-galaxy-a16','Samsung Galaxy A16 4 Go / 128 Go','Samsung','galaxy-a-series','telephones-tablettes',170,'https://welectronics.com/images/stories/virtuemart/product/SamsungGalaxyA16blue16.jpg','Écran Super AMOLED 6,7 pouces, caméra principale 50 MP et batterie 5 000 mAh.','matik'],
   ['samsung-galaxy-a26','Samsung Galaxy A26 5G 6 Go / 128 Go','Samsung','galaxy-a-series','telephones-tablettes',250,'https://cdn.mafrservices.com/pim-content/UAE/media/product/2237693/1741929003/2237693_main.jpg','Smartphone Galaxy A26 5G avec écran 6,7 pouces et batterie 5 000 mAh.','matik'],
   ['samsung-galaxy-a36','Samsung Galaxy A36 5G 6 Go / 128 Go','Samsung','galaxy-a-series','telephones-tablettes',300,'https://gangaelectronica.es/712319-large_default/smartphone-samsung-galaxy-a36-6gb-128gb-6-7-5g-negro.jpg','Écran Super AMOLED 120 Hz, caméra 50 MP et batterie 5 000 mAh.','matik'],
   ['samsung-galaxy-a55','Samsung Galaxy A55 5G 8 Go / 256 Go','Samsung','galaxy-a-series','telephones-tablettes',310,'https://cdn.movertix.com/media/catalog/product/s/a/samsung-galaxy-a55-5g-dual-sim-awesome-navy-256gb-and-8gb-ram-sm-a556b-ds.jpg','Écran Super AMOLED 6,6 pouces 120 Hz, caméra principale 50 MP et 8 Go de RAM.','matik'],
   ['samsung-galaxy-a56','Samsung Galaxy A56 5G 8 Go / 256 Go','Samsung','galaxy-a-series','telephones-tablettes',380,'https://static01.galaxus.com/productimages/3/5/3/9/6/0/1/5/0/7/9/9/2/8/4/7/4/3/ced3903e-b3b5-4903-88b1-f3f49e89f851.jpg_sea.jpeg','Écran Super AMOLED 120 Hz, triple appareil photo et batterie 5 000 mAh.','matik'],
   ['samsung-galaxy-a37','Samsung Galaxy A37 5G 8 Go / 256 Go','Samsung','galaxy-a-series','telephones-tablettes',368,'https://i5.walmartimages.ca/asr/73610e9f-8094-4330-a658-b024ec9509e4.d5dd1b3d1f33fd19f0b015192d0460df.jpeg','Smartphone Galaxy A37 5G 8 Go / 256 Go référencé chez un vendeur local.','telephone'],
   ['tecno-spark-40-pro','Tecno Spark 40 Pro 8 Go / 256 Go','Tecno','tecno-spark-series','telephones-tablettes',205,'https://assets.asaxiy.uz/product/main_image/desktop/68a58309ab527.png.webp','Écran AMOLED 6,78 pouces 144 Hz, caméra 50 MP et batterie 5 200 mAh.','telephone'],
   ['infinix-hot-60i','Infinix Hot 60i 4 Go / 128 Go','Infinix','infinix-hot-series','telephones-tablettes',147,'https://sumeks.disway.id/upload/f07cc498c3f1eebb8c1915dafc9d0d3d.jpg','Smartphone 4G avec appareil photo 50 MP et 128 Go de stockage.','telephone'],
   ['samsung-galaxy-tab-a11','Samsung Galaxy Tab A11 4 Go / 64 Go','Samsung','galaxy-tab-series','telephones-tablettes',200,'https://media.s-bol.com/LEPBVKAWOPrp/k5x4JpX/1156x1200.jpg','Tablette Samsung Galaxy Tab A11 8,7 pouces, 4 Go de RAM et 64 Go de stockage.','telephone'],
   ['samsung-galaxy-tab-a11-plus','Samsung Galaxy Tab A11+ 6 Go / 128 Go','Samsung','galaxy-tab-series','telephones-tablettes',357,'https://cdn.electronyat.qa/_next/image?q=90&url=https%3A%2F%2Fbackend.electronyat.qa%2Fmedia%2Fcatalog%2Fproduct%2Fu%2Fn%2Funtitled_design_-_2025-12-09t170439.489_1.png&w=576','Tablette Galaxy Tab A11+ 11 pouces 5G, 6 Go de RAM et 128 Go.','telephone'],
   ['tecno-spark-50','Tecno Spark 50 4 Go / 128 Go','Tecno','tecno-spark-series','telephones-tablettes',163,null,'Smartphone Tecno Spark 50 4 Go / 128 Go listé par le vendeur local.','telephone'],
   ['tecno-pop-10','Tecno Pop 10 3 Go / 64 Go','Tecno','tecno-pop-series','telephones-tablettes',105,null,'Smartphone Tecno Pop 10 3 Go / 64 Go listé par le vendeur local.','telephone'],
   ['infinix-smart-10','Infinix Smart 10 3 Go / 64 Go','Infinix','infinix-smart-series','telephones-tablettes',111,null,'Smartphone Infinix Smart 10 3 Go / 64 Go listé par le vendeur local.','telephone'],
   ['itel-a06','itel A06 2 Go / 64 Go','itel','itel-a-series','telephones-tablettes',84,null,'Smartphone itel A06 2 Go / 64 Go listé par le vendeur local.','telephone'],
   ['lenovo-v15-g3-i5','Lenovo V15 G3 Core i5 / 8 Go / 512 Go SSD','Lenovo','laptops','ordinateurs',null,'https://funtech.pl/hpeciai/110e544883791aedaf101392f850625f/pol_pl_Biznesowy-Laptop-Lenovo-V15-G3-I5-1235U-15-6-8GB-512GB-SSD-Win-11-20760_1.jpg','Ordinateur portable professionnel : Core i5-1235U, 8 Go RAM et SSD 512 Go. Prix sur devis.','bcs'],
   ['hp-15-fd0005dx','HP 15-FD0005DX Core i5 / 8 Go / 512 Go SSD','HP','laptops','ordinateurs',null,null,'Ordinateur portable HP avec Core i5-1235U, 8 Go RAM et SSD 512 Go. Prix sur devis.','bcs'],
   ['epson-ecotank-l3250','Epson EcoTank L3250','Epson','printers','impression-bureautique',null,null,'Imprimante multifonction à réservoir d’encre référencée dans le catalogue BCS-IT. Prix sur devis.','bcs'],
   ['tecno-camon-50','Tecno Camon 50 8 Go / 256 Go','Tecno','tecno-camon-series','telephones-tablettes',326,'https://d13pvy8xd75yde.cloudfront.net/camon/CN5-%E8%8E%AB%E5%A5%88%E7%B4%AB.png','Écran AMOLED 1,5K 144 Hz, caméra Sony 50 MP OIS et batterie 6 500 mAh.','telephone'],
   ['tecno-spark-40-pro-plus','Tecno Spark 40 Pro+ 8 Go / 256 Go','Tecno','tecno-spark-series','telephones-tablettes',252,null,'Smartphone Tecno Spark 40 Pro+ 8 Go / 256 Go listé par Telephone Lubumbashi.','telephone'],
   ['tecno-pop-20-4-64','Tecno Pop 20 4 Go / 64 Go','Tecno','tecno-pop-series','telephones-tablettes',132,null,'Smartphone Tecno Pop 20 4 Go / 64 Go listé par Telephone Lubumbashi.','telephone'],
   ['infinix-hot-60i-8-256','Infinix Hot 60i 8 Go / 256 Go','Infinix','infinix-hot-series','telephones-tablettes',189,'https://sumeks.disway.id/upload/f07cc498c3f1eebb8c1915dafc9d0d3d.jpg','Smartphone Infinix Hot 60i 8 Go / 256 Go listé par Telephone Lubumbashi.','telephone'],
   ['samsung-tab-a11-plus-8-256','Samsung Galaxy Tab A11+ 8 Go / 256 Go','Samsung','galaxy-tab-series','telephones-tablettes',399,'https://cdn.electronyat.qa/_next/image?q=90&url=https%3A%2F%2Fbackend.electronyat.qa%2Fmedia%2Fcatalog%2Fproduct%2Fu%2Fn%2Funtitled_design_-_2025-12-09t170439.489_1.png&w=576','Tablette Samsung Galaxy Tab A11+ 11 pouces 5G, 8 Go de RAM et 256 Go.','telephone'],
   ['lenovo-thinkbook-16-g6','Lenovo ThinkBook 16 G6 Core i7 / 16 Go / 512 Go SSD','Lenovo','thinkbook','ordinateurs',null,'https://www.dateks.lv/images/pic/1200/1200/859/1758.jpg','Ordinateur professionnel Lenovo ThinkBook 16 G6, Core i7, 16 Go RAM et SSD 512 Go. Prix sur devis.','bcs'],
   ['hp-probook-440-g11','HP ProBook 440 G11 8 Go / 512 Go SSD','HP','probook','ordinateurs',null,'https://mx-media.hptiendaenlinea.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/A/2/A24Z3LT-1_T1746824764.png','Ordinateur portable professionnel HP ProBook 440 G11, 14 pouces et SSD 512 Go. Prix sur devis.','bcs'],
   ['canon-i-sensys-mf465dw-ii','Canon i-SENSYS MF465dw II','Canon','laser-printers','impression-bureautique',null,'https://i1.adis.ws/i/canon/7188C020_i-SENSYS-MF465dw-II_01?aspect=1%3A1&bg=rgb%28245%2C246%2C246%29&fmt=webp&qlt=100&sm=aspect&w=940','Imprimante laser multifonction monochrome A4, réseau et recto-verso. Prix sur devis.','bcs'],
   ['brother-mfc-l2805dw','Brother MFC-L2805DW','Brother','laser-printers','impression-bureautique',null,'https://www.yv.com.hk/cdn/shop/files/mfcl2805dw_1_3b3b5d72-4d1a-43dd-a1ef-af52ede46357.jpg?v=1736752735&width=1200','Imprimante laser multifonction monochrome avec Wi-Fi, scanner et recto-verso. Prix sur devis.','bcs'],

   // iPhone — références ajoutées au catalogue, prix et stock à confirmer avant commercialisation.
   ['apple-iphone-13','Apple iPhone 13','Apple','iphone','telephones-tablettes',null,null,'iPhone 13 — capacité, état (neuf/reconditionné) et disponibilité à confirmer.','telephone'],
   ['apple-iphone-14','Apple iPhone 14','Apple','iphone','telephones-tablettes',null,null,'iPhone 14 — capacité, état (neuf/reconditionné) et disponibilité à confirmer.','telephone'],
   ['apple-iphone-15','Apple iPhone 15','Apple','iphone','telephones-tablettes',null,null,'iPhone 15 — capacité, état (neuf/reconditionné) et disponibilité à confirmer.','telephone'],
   ['apple-iphone-16','Apple iPhone 16','Apple','iphone','telephones-tablettes',null,null,'iPhone 16 — capacité, état (neuf/reconditionné) et disponibilité à confirmer.','telephone'],
   // Ordinateurs supplémentaires — configurations et prix à valider avec le fournisseur.
   ['dell-latitude-5450','Dell Latitude 5450','Dell','business-laptops','ordinateurs',null,null,'Ordinateur portable professionnel Dell Latitude 5450. Configuration exacte et disponibilité à confirmer. Prix sur devis.','bcs'],
   ['dell-inspiron-15','Dell Inspiron 15','Dell','consumer-laptops','ordinateurs',null,null,'Ordinateur portable Dell Inspiron 15. Configuration exacte et disponibilité à confirmer. Prix sur devis.','bcs'],
   ['lenovo-thinkpad-e14','Lenovo ThinkPad E14','Lenovo','business-laptops','ordinateurs',null,null,'Ordinateur portable professionnel Lenovo ThinkPad E14. Configuration exacte et disponibilité à confirmer. Prix sur devis.','bcs'],
   ['acer-aspire-5','Acer Aspire 5','Acer','consumer-laptops','ordinateurs',null,null,'Ordinateur portable Acer Aspire 5. Configuration exacte et disponibilité à confirmer. Prix sur devis.','bcs'],

  ];
  foreach($items as $index=>$item) {
   [$slug,$name,$brand,$family,$categorySlug,$price,$image,$description,$sourceKey]=$item;
   [$sourceName,$sourceUrl]=$sources[$sourceKey];$category=Category::where('slug',$categorySlug)->firstOrFail();
   Product::updateOrCreate(['slug'=>$slug],[
    'category_id'=>$category->id,'name'=>$name,'brand'=>$brand,'family'=>$family,
    'short_description'=>'Référence repérée dans un catalogue public de Lubumbashi. Prix et disponibilité CTRL-Tech à confirmer.',
    'description'=>$description.' Le prix affiché est un repère public relevé chez un vendeur tiers local, et non une confirmation du prix de vente CTRL-Tech.',
    'price_usd'=>$price,'price_confirmed'=>false,'price_cdf'=>null,'image_path'=>$image,
    'stock_quantity'=>0,'availability_status'=>'to_confirm','source_name'=>$sourceName,'source_url'=>$sourceUrl,
    'is_active'=>true,'is_featured'=>$index<8,'low_stock_threshold'=>2,
    'specifications'=>['Référence locale'=>$sourceName,'Prix affiché'=>$price===null?'Sur demande':'Prix repère en USD','Disponibilité'=>'À confirmer auprès de CTRL-Tech'],
   ]);
  }
  Product::whereIn('slug',['dell-latitude-3190','hp-elitebook-840-g4','hp-s1000-wireless-mouse','wireless-mouse-black'])->update(['is_active'=>false]);
  if(env('ADMIN_EMAIL') && env('ADMIN_PASSWORD')) $this->call(AdminUserSeeder::class);
 }
}
