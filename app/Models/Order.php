<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Order extends Model
{
    protected $fillable = ['reference','customer_name','customer_email','customer_phone','delivery_address','delivery_area','notes','currency','subtotal','delivery_fee','total','status','payment_method','payment_status'];
    protected function casts(): array { return ['subtotal'=>'decimal:2','delivery_fee'=>'decimal:2','total'=>'decimal:2']; }
    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
}
