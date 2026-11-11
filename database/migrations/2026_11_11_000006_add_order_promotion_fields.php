<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::table('orders',function(Blueprint $table){
   $table->foreignId('promotion_id')->nullable()->constrained('promotions')->nullOnDelete();
   $table->string('promotion_code',40)->nullable();
   $table->decimal('discount_amount',15,2)->default(0);
  });
 }
 public function down(): void {
  Schema::table('orders',function(Blueprint $table){
   $table->dropConstrainedForeignId('promotion_id');
   $table->dropColumn(['promotion_code','discount_amount']);
  });
 }
};