<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Order extends Model {
 protected $fillable=['user_id','promotion_id','promotion_code','discount_amount','reference','customer_name','customer_email','customer_phone','delivery_address','delivery_area','delivery_method','payment_reference','notes','currency','subtotal','delivery_fee','total','status','payment_method','payment_status'];
 protected function casts(): array {return ['subtotal'=>'decimal:2','delivery_fee'=>'decimal:2','discount_amount'=>'decimal:2','total'=>'decimal:2'];}
 public function items(): HasMany {return $this->hasMany(OrderItem::class);}
 public function user(): BelongsTo {return $this->belongsTo(User::class);}
 public function promotion(): BelongsTo {return $this->belongsTo(Promotion::class);}
}