<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'invoice_number',
        'outlet_id',
        'customer_id',
        'user_id',
        'status',
        'total_amount',
        'estimated_finish',
        'notes',
    ];

    protected $casts = [
        'estimated_finish' => 'date',
        'total_amount' => 'float',
    ];

    protected $appends = ['paid_amount', 'payment_status'];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getPaidAmountAttribute()
    {
        return $this->payments()->sum('amount');
    }

    public function getPaymentStatusAttribute()
    {
        return $this->paid_amount >= $this->total_amount ? 'lunas' : 'belum_lunas';
    }
}