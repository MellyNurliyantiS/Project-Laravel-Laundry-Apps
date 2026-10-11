<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request, Order $order)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'method' => 'required|in:cash,transfer,qris',
        ]);

        $order->payments()->create([
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'paid_at' => now(),
        ]);

        return redirect()->route('orders.show', $order)->with('success', 'Pembayaran berhasil dicatat.');
    }
}