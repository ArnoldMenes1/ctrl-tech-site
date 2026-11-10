<?php
namespace Tests\Feature;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class StorefrontTest extends TestCase
{
 use RefreshDatabase;
 public function test_homepage_loads(): void {$this->get('/')->assertOk()->assertSee('CTRL-Tech');}
 public function test_catalogue_shows_active_products_only(): void {
  $category=Category::create(['name'=>'Accessoires','slug'=>'accessoires']);
  Product::create(['category_id'=>$category->id,'name'=>'Produit visible','slug'=>'produit-visible','price_usd'=>20,'is_active'=>true]);
  Product::create(['category_id'=>$category->id,'name'=>'Produit masqué','slug'=>'produit-masque','price_usd'=>30,'is_active'=>false]);
  $this->get('/catalogue')->assertOk()->assertSee('Produit visible')->assertDontSee('Produit masqué');
 }
 public function test_customer_can_submit_an_order(): void {
  $category=Category::create(['name'=>'Accessoires','slug'=>'accessoires']);
  $product=Product::create(['category_id'=>$category->id,'name'=>'Souris','slug'=>'souris','sku'=>'CT-MOUSE-01','price_usd'=>15,'is_active'=>true]);
  $this->withSession(['cart'=>[$product->id=>['quantity'=>2]]])->post('/commande',['customer_name'=>'Client Test','customer_email'=>'client@example.com','customer_phone'=>'+243000000000','delivery_address'=>'Adresse de test','delivery_area'=>'Lubumbashi','currency'=>'USD'])->assertRedirect();
  $this->assertDatabaseHas('orders',['customer_email'=>'client@example.com','total'=>30]);
  $this->assertDatabaseHas('order_items',['product_name'=>'Souris','quantity'=>2]);
 }
}