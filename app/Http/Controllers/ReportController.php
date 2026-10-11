<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $totalRevenue = Payment::whereBetween('paid_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])->sum('amount');

        $ordersInRange = Order::whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
        $totalOrders = (clone $ordersInRange)->count();

        $orderIdsInRange = (clone $ordersInRange)->pluck('id');
        $totalTagihan = Order::whereIn('id', $orderIdsInRange)->sum('total_amount');
        $totalDibayarDariTransaksiIni = Payment::whereIn('order_id', $orderIdsInRange)->sum('amount');
        $totalUnpaid = max($totalTagihan - $totalDibayarDariTransaksiIni, 0);

        $revenueByOutlet = Outlet::query()
            ->withCount(['orders' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
            }])
            ->get(['id', 'name'])
            ->map(function ($outlet) use ($startDate, $endDate) {
                $revenue = Payment::whereBetween('paid_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                    ->whereHas('order', fn ($q) => $q->where('outlet_id', $outlet->id))
                    ->sum('amount');

                return [
                    'id' => $outlet->id,
                    'name' => $outlet->name,
                    'orders_count' => $outlet->orders_count,
                    'revenue' => $revenue,
                ];
            })
            ->sortByDesc('revenue')
            ->values();

        $topServices = OrderItem::query()
            ->join('services', 'services.id', '=', 'order_items.service_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->groupBy('services.id', 'services.name', 'services.unit')
            ->selectRaw('services.id, services.name, services.unit, SUM(order_items.qty) as total_qty, SUM(order_items.subtotal) as total_revenue')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        return Inertia::render('admin/reports', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'summary' => [
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'totalPaid' => $totalRevenue,
                'totalUnpaid' => $totalUnpaid,
            ],
            'revenueByOutlet' => $revenueByOutlet,
            'topServices' => $topServices,
        ]);
    }

    public function today()
    {
        $user = auth()->user();
        $todayDate = now()->toDateString();

        $paymentsQuery = Payment::whereDate('paid_at', $todayDate)
            ->whereHas('order', function ($q) use ($user) {
                if (!$user->isAdmin() && $user->outlet_id) {
                    $q->where('outlet_id', $user->outlet_id);
                }
            })
            ->with(['order.customer', 'order.outlet', 'order.items.service']);

        $payments = $paymentsQuery->get();

        $ordersTodayQuery = Order::whereDate('created_at', $todayDate);
        if (!$user->isAdmin() && $user->outlet_id) {
            $ordersTodayQuery->where('outlet_id', $user->outlet_id);
        }
        $orderIdsToday = (clone $ordersTodayQuery)->pluck('id');
        $totalTagihanToday = Order::whereIn('id', $orderIdsToday)->sum('total_amount');
        $totalDibayarDariHariIni = Payment::whereIn('order_id', $orderIdsToday)->sum('amount');
        $totalBelumDibayar = max($totalTagihanToday - $totalDibayarDariHariIni, 0);

        return Inertia::render('admin/reports-today', [
            'date' => $todayDate,
            'totalRevenue' => $payments->sum('amount'),
            'totalBelumDibayar' => $totalBelumDibayar,
            'payments' => $payments->map(function ($p) {
                return [
                    'id' => $p->id,
                    'amount' => $p->amount,
                    'method' => $p->method,
                    'paid_at' => $p->paid_at,
                    'invoice_number' => $p->order->invoice_number ?? '-',
                    'customer_name' => $p->order->customer->name ?? '-',
                    'outlet_name' => $p->order->outlet->name ?? '-',
                    'services' => $p->order->items->map(fn ($i) => $i->service->name ?? '-')->implode(', '),
                ];
            }),
        ]);
    }
}