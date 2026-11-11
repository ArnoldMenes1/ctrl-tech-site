<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Product extends Model
{
 protected $fillable=['category_id','name','slug','sku','short_description','description','brand','price_usd','price_cdf','price_confirmed','availability_status','family','source_name','source_url','low_stock_threshold','published_at','image_path','is_active','is_featured','stock_quantity','specifications'];
 protected function casts(): array {return ['is_active'=>'boolean','is_featured'=>'boolean','price_confirmed'=>'boolean','published_at'=>'datetime','stock_quantity'=>'integer','price_usd'=>'decimal:2','price_cdf'=>'decimal:2','specifications'=>'array'];}
 public function category(): BelongsTo {return $this->belongsTo(Category::class);}
 public function images(): HasMany {return $this->hasMany(ProductImage::class)->orderBy('sort_order');}
 public function variants(): HasMany {return $this->hasMany(ProductVariant::class);}
 public function inventoryMovements(): HasMany {return $this->hasMany(InventoryMovement::class)->latest();}
 public function getDisplayPriceAttribute(): ?float {return $this->price_confirmed?(float)($this->price_usd??0):null;}
}
