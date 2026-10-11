<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'outlet_id',
        'name',
        'unit',
        'price',
        'duration_days',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'is_active' => 'boolean',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}