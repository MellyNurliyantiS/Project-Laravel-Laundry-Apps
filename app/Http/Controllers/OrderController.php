<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Payment;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $filter = $request->query('filter');

        $query = Order::with(['customer', 'outlet']);

        if (!$user->isAdmin() && $user->outlet_id) {
            $query->where('outlet_id', $user->outlet_id);
        }

        if ($filter === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($filter === 'belum_selesai') {
            $query->whereIn('status', ['baru', 'proses']);
        }

        $totalBelumDibayar = null;

        if ($filter === 'belum_selesai') {
            $orderIds = (clone $query)->pluck('id');
            $totalTagihan = Order::whereIn('id', $orderIds)->sum('total_amount');
            $totalDibayar = Payment::whereIn('order_id', $orderIds)->sum('amount');
            $totalBelumDibayar = max($totalTagihan - $totalDibayar, 0);
        }

        return Inertia::render('orders/index', [
            'orders' => $query->latest()->get(),
            'filter' => $filter,
            'totalBelumDibayar' => $totalBelumDibayar,
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        $customersQuery = Customer::query();

        if (!$user->isAdmin() && $user->outlet_id) {
            $customersQuery->where('outlet_id', $user->outlet_id);
        }

        return Inertia::render('orders/create', [
            'customers' => $customersQuery->orderBy('name')->get(),
            'services' => Service::where('is_active', true)->orderBy('name')->get(),
            'outlets' => $user->isAdmin() ? Outlet::orderBy('name')->get() : [],
            'kasirUsers' => $user->isAdmin()
                ? User::where('role', 'kasir')->orderBy('name')->get(['id', 'name', 'outlet_id'])
                : [],
            'defaultOutletId' => $user->outlet_id,
            'today' => now()->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'outlet_id' => 'required|exists:outlets,id',
            'order_date' => 'required|date',
            'user_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'required|exists:services,id',
            'items.*.qty' => 'required|numeric|min:0.1',
        ]);

        $order = DB::transaction(function () use ($validated, $user) {
            $orderDate = \Carbon\Carbon::parse($validated['order_date']);

            $services = Service::whereIn('id', collect($validated['items'])->pluck('service_id'))
                ->get()
                ->keyBy('id');

            $total = 0;
            $maxDays = 1;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $service = $services[$item['service_id']];
                $subtotal = $service->price * $item['qty'];
                $total += $subtotal;
                $maxDays = max($maxDays, $service->duration_days);

                $itemsToCreate[] = [
                    'service_id' => $service->id,
                    'qty' => $item['qty'],
                    'price' => $service->price,
                    'subtotal' => $subtotal,
                ];
            }

            $processedByUserId = $user->isAdmin() && !empty($validated['user_id'])
                ? $validated['user_id']
                : $user->id;

            $order = Order::create([
                'invoice_number' => $this->generateInvoiceNumber($orderDate),
                'customer_id' => $validated['customer_id'],
                'outlet_id' => $validated['outlet_id'],
                'user_id' => $processedByUserId,
                'status' => 'baru',
                'total_amount' => $total,
                'notes' => $validated['notes'] ?? null,
                'estimated_finish' => $orderDate->copy()->addDays($maxDays)->toDateString(),
            ]);

            $order->created_at = $orderDate;
            $order->updated_at = $orderDate;
            $order->save();

            foreach ($itemsToCreate as $itemData) {
                $order->items()->create($itemData);
            }

            return $order;
        });

        return redirect()->route('orders.index')->with('success', "Transaksi {$order->invoice_number} berhasil disimpan.");
    }

    public function show(Order $order)
    {
        $order->load(['customer', 'outlet', 'user', 'items.service', 'payments']);

        return Inertia::render('orders/show', ['order' => $order]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:baru,proses,selesai,diambil',
        ]);

        $order->update(['status' => $validated['status']]);

        return redirect()->route('orders.show', $order)->with('success', 'Status transaksi diperbarui.');
    }

    private function generateInvoiceNumber(\Carbon\Carbon $date): string
    {
        $formatted = $date->format('Ymd');
        $count = Order::whereDate('created_at', $date->toDateString())->count() + 1;

        return "INV-{$formatted}-".str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}