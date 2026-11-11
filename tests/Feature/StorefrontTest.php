<?php
namespace Tests\Feature;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class StorefrontTest extends TestCase {
 use RefreshDatabase;
 protected function setUp(): void {parent::setUp();$this->withoutVite();}
 public function test_homepage_loads(): void {$this->get('/')->assertOk()->assertSee('CTRL-Tech');}
 public function test_catalogue_shows_active_products_only(): void {
  $category=Category::create(['name'=>'Accessoires','slug'=>'accessoires']);
  Product::create(['category_id'=>$category->id,'name'=>'Produit visible','slug'=>'produit-visible','price_usd'=>20,'is_active'=>true]);
  Product::create(['category_id'=>$category->id,'name'=>'Produit masqué','slug'=>'produit-masque','price_usd'=>30,'is_active'=>false]);
  $this->get('/catalogue')->assertOk()->assertSee('Produit visible')->assertDontSee('Produit masqué');
 }
 public function test_customer_can_submit_an_order_after_server_side_price_and_stock_checks(): void {
  $category=Category::create(['name'=>'Accessoires','slug'=>'accessoires']);
  $product=Product::create(['category_id'=>$category->id,'name'=>'Souris','slug'=>'souris','sku'=>'CT-MOUSE-01','price_usd'=>15,'price_confirmed'=>true,'stock_quantity'=>5,'availability_status'=>'in_stock','is_active'=>true]);
  $this->withSession(['cart'=>[$product->id=>['quantity'=>2]]])->post('/commande',[
   'customer_name'=>'Client Test','customer_email'=>'client@example.com','customer_phone'=>'+243000000000',
   'delivery_address'=>'Adresse de test','delivery_area'=>'Lubumbashi','delivery_method'=>'pickup','currency'=>'USD'
  ])->assertRedirect();
  $this->assertDatabaseHas('orders',['customer_email'=>'client@example.com','total'=>30]);
  $this->assertDatabaseHas('order_items',['product_name'=>'Souris','quantity'=>2]);
  $this->assertDatabaseHas('inventory_movements',['product_id'=>$product->id,'type'=>'sale','quantity'=>-2,'stock_after'=>3]);
  $this->assertDatabaseHas('products',['id'=>$product->id,'stock_quantity'=>3]);
 }
 public function test_compare_only_accepts_products_from_the_same_family(): void {
  $category=Category::create(['name'=>'Téléphones','slug'=>'telephones']);
  $a=Product::create(['category_id'=>$category->id,'name'=>'Galaxy A','slug'=>'galaxy-a','family'=>'galaxy-a-series','is_active'=>true]);
  $b=Product::create(['category_id'=>$category->id,'name'=>'Galaxy B','slug'=>'galaxy-b','family'=>'galaxy-a-series','is_active'=>true]);
  $c=Product::create(['category_id'=>$category->id,'name'=>'iPhone','slug'=>'iphone','family'=>'iphone','is_active'=>true]);
  $this->withSession(['compare'=>[$a->id]])->post(route('compare.add',$b))->assertRedirect()->assertSessionHas('compare',[$a->id,$b->id]);
  $this->withSession(['compare'=>[$a->id]])->from('/catalogue')->post(route('compare.add',$c))->assertRedirect('/catalogue')->assertSessionHas('error');
 }
}
