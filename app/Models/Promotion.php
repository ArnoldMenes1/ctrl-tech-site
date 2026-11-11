<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Promotion extends Model {
 protected $fillable=['name','code','type','value','minimum_order','starts_at','ends_at','usage_limit','usage_count','is_active'];
 protected function casts(): array {return ['value'=>'decimal:2','minimum_order'=>'decimal:2','starts_at'=>'datetime','ends_at'=>'datetime','is_active'=>'boolean','usage_limit'=>'integer','usage_count'=>'integer'];}
}