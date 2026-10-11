<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'outlet_id',
        'name',
        'phone',
        'address',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}