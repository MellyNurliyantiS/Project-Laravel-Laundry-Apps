<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'service_id',
        'qty',
        'price',
        'subtotal',
    ];

    protected $casts = [
        'qty' => 'float',
        'price' => 'float',
        'subtotal' => 'float',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}