<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('orders', function(Blueprint $table){$table->id();$table->string('reference',24)->unique();$table->string('customer_name',160);$table->string('customer_email',190)->index();$table->string('customer_phone',40);$table->string('delivery_address',500);$table->string('delivery_area',120);$table->text('notes')->nullable();$table->char('currency',3)->default('USD');$table->decimal('subtotal',15,2);$table->decimal('delivery_fee',15,2)->default(0);$table->decimal('total',15,2);$table->string('status',30)->default('pending')->index();$table->string('payment_method',50)->nullable();$table->string('payment_status',30)->default('unpaid')->index();$table->timestamps();});}
 public function down(): void {Schema::dropIfExists('orders');}
};
