<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $ordersQuery = Order::query();

        if (!$user->isAdmin() && $user->outlet_id) {
            $ordersQuery->where('outlet_id', $user->outlet_id);
        }

        $todayOrders = (clone $ordersQuery)->whereDate('created_at', today());

        $paymentsToday = Payment::whereDate('paid_at', today())
            ->whereHas('order', function ($q) use ($user) {
                if (!$user->isAdmin() && $user->outlet_id) {
                    $q->where('outlet_id', $user->outlet_id);
                }
            });

        $customersQuery = Customer::query();
        $outletsQuery = Outlet::query();

        if (!$user->isAdmin() && $user->outlet_id) {
            $customersQuery->where('outlet_id', $user->outlet_id);
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'ordersToday' => $todayOrders->count(),
                'revenueToday' => $paymentsToday->sum('amount'),
                'totalCustomers' => $customersQuery->count(),
                'totalOutlets' => $user->isAdmin() ? $outletsQuery->count() : 1,
                'ordersBelumSelesai' => (clone $ordersQuery)->whereIn('status', ['baru', 'proses'])->count(),
            ],
            'recentOrders' => (clone $ordersQuery)
                ->with(['customer', 'outlet'])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}