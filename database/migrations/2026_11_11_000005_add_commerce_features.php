<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::table('products', function(Blueprint $table) {
   $table->decimal('price_cdf',15,2)->nullable();
   $table->boolean('price_confirmed')->default(false)->index();
   $table->string('availability_status',30)->default('to_confirm')->index();
   $table->string('family',120)->nullable()->index();
   $table->string('source_name',160)->nullable();
   $table->string('source_url',500)->nullable();
   $table->unsignedInteger('low_stock_threshold')->default(3);
   $table->timestamp('published_at')->nullable();
  });
  Schema::table('users', function(Blueprint $table) {
   $table->string('phone',40)->nullable();
   $table->string('address',500)->nullable();
   $table->boolean('is_active')->default(true)->index();
  });
  Schema::table('orders', function(Blueprint $table) {
   $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
   $table->string('delivery_method',40)->default('local_delivery');
   $table->string('payment_reference',120)->nullable();
  });
  Schema::create('brands', function(Blueprint $table) {
   $table->id(); $table->string('name',120); $table->string('slug',140)->unique();
   $table->text('description')->nullable(); $table->boolean('is_active')->default(true)->index();
   $table->timestamps();
  });
  Schema::create('product_images', function(Blueprint $table) {
   $table->id(); $table->foreignId('product_id')->constrained()->cascadeOnDelete();
   $table->string('path',500); $table->string('alt',180)->nullable();
   $table->boolean('is_primary')->default(false); $table->unsignedSmallInteger('sort_order')->default(0);
   $table->timestamps();
  });
  Schema::create('product_variants', function(Blueprint $table) {
   $table->id(); $table->foreignId('product_id')->constrained()->cascadeOnDelete();
   $table->string('name',120); $table->string('sku',80)->nullable()->unique();
   $table->json('options')->nullable(); $table->decimal('price_delta',12,2)->default(0);
   $table->unsignedInteger('stock_quantity')->default(0); $table->boolean('is_active')->default(true);
   $table->timestamps();
  });
  Schema::create('inventory_movements', function(Blueprint $table) {
   $table->id(); $table->foreignId('product_id')->constrained()->cascadeOnDelete();
   $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
   $table->string('type',24); $table->integer('quantity'); $table->unsignedInteger('stock_after');
   $table->string('reason',255)->nullable(); $table->string('reference',100)->nullable(); $table->timestamps();
   $table->index(['product_id','created_at']);
  });
  Schema::create('promotions', function(Blueprint $table) {
   $table->id(); $table->string('name',140); $table->string('code',40)->nullable()->unique();
   $table->string('type',20); $table->decimal('value',12,2); $table->decimal('minimum_order',12,2)->default(0);
   $table->timestamp('starts_at')->nullable(); $table->timestamp('ends_at')->nullable();
   $table->unsignedInteger('usage_limit')->nullable(); $table->unsignedInteger('usage_count')->default(0);
   $table->boolean('is_active')->default(true)->index(); $table->timestamps();
  });
  Schema::create('sessions', function(Blueprint $table) {
   $table->string('id')->primary(); $table->foreignId('user_id')->nullable()->index();
   $table->string('ip_address',45)->nullable(); $table->text('user_agent')->nullable();
   $table->longText('payload'); $table->integer('last_activity')->index();
  });
  Schema::create('password_reset_tokens', function(Blueprint $table) {
   $table->string('email')->primary(); $table->string('token'); $table->timestamp('created_at')->nullable();
  });
 }
 public function down(): void {
  Schema::dropIfExists('password_reset_tokens'); Schema::dropIfExists('sessions');
  Schema::dropIfExists('promotions'); Schema::dropIfExists('inventory_movements');
  Schema::dropIfExists('product_variants'); Schema::dropIfExists('product_images'); Schema::dropIfExists('brands');
  Schema::table('orders', function(Blueprint $table){$table->dropConstrainedForeignId('user_id');$table->dropColumn(['delivery_method','payment_reference']);});
  Schema::table('users', function(Blueprint $table){$table->dropColumn(['phone','address','is_active']);});
  Schema::table('products', function(Blueprint $table){$table->dropColumn(['price_cdf','price_confirmed','availability_status','family','source_name','source_url','low_stock_threshold','published_at']);});
 }
};