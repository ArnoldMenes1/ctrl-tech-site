<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Product extends Model
{
    protected $fillable = ['category_id','name','slug','sku','short_description','description','brand','price_usd','price_cdf','image_path','is_active','is_featured','stock_quantity','specifications'];
    protected function casts(): array { return ['is_active'=>'boolean','is_featured'=>'boolean','stock_quantity'=>'integer','price_usd'=>'decimal:2','price_cdf'=>'decimal:2','specifications'=>'array']; }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
}
