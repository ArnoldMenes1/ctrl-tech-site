<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
class User extends Authenticatable {
 use HasFactory,Notifiable;
 protected $fillable=['name','email','password','role','phone','address','is_active'];
 protected $hidden=['password','remember_token'];
 protected function casts(): array {return ['email_verified_at'=>'datetime','password'=>'hashed','is_active'=>'boolean'];}
 public function isAdmin(): bool {return in_array($this->role,['admin','manager','catalog_manager','operator','analyst'],true);}
 public function hasPermission(string $permission): bool {
  return match($permission) {
   'catalog'=>in_array($this->role,['admin','manager','catalog_manager'],true),
   'orders','customers'=>in_array($this->role,['admin','manager','operator'],true),
   'promotions'=>in_array($this->role,['admin','manager'],true),
   'reports'=>in_array($this->role,['admin','manager','analyst'],true),
   'team'=>$this->role==='admin',
   default=>false,
  };
 }
 public function orders(): HasMany {return $this->hasMany(Order::class);}
}
