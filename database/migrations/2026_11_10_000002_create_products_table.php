<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('products', function(Blueprint $table){$table->id();$table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();$table->string('name',180);$table->string('slug',200)->unique();$table->string('sku',80)->nullable()->unique();$table->string('brand',120)->nullable()->index();$table->string('short_description',255)->nullable();$table->longText('description')->nullable();$table->decimal('price_usd',12,2)->nullable();$table->string('image_path')->nullable();$table->unsignedInteger('stock_quantity')->default(0);$table->json('specifications')->nullable();$table->boolean('is_active')->default(false)->index();$table->boolean('is_featured')->default(false)->index();$table->timestamps();$table->index(['category_id','is_active']);});}
 public function down(): void {Schema::dropIfExists('products');}
};
