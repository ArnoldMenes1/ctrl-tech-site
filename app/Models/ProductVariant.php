<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class ProductVariant extends Model
{
 protected $fillable=['product_id','name','sku','options','price_delta','stock_quantity','is_active'];
 protected function casts(): array {return ['options'=>'array','is_active'=>'boolean','stock_quantity'=>'integer','price_delta'=>'decimal:2'];}
 public function product(): BelongsTo {return $this->belongsTo(Product::class);}
}
