<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Brand extends Model {
 protected $fillable=['name','slug','description','is_active'];
 protected function casts(): array {return ['is_active'=>'boolean'];}
}
