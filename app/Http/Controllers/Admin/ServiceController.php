<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/services', [
            'services' => Service::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|in:kg,pcs,set',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
        ]);

        Service::create($validated);

        return redirect()->route('admin.services.index')->with('success', 'Layanan berhasil ditambahkan.');
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|in:kg,pcs,set',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
        ]);

        $service->update($validated);

        return redirect()->route('admin.services.index')->with('success', 'Layanan berhasil diperbarui.');
    }

    public function destroy(Service $service)
    {
        $hasActiveOrder = OrderItem::where('service_id', $service->id)
            ->whereHas('order', function ($query) {
                $query->whereIn('status', ['baru', 'proses']);
            })
            ->exists();

        if ($hasActiveOrder) {
            return redirect()->route('admin.services.index')->with('error', 'Layanan tidak bisa dihapus karena masih dipakai di transaksi yang belum selesai/diambil.');
        }

        $hasAnyOrder = OrderItem::where('service_id', $service->id)->exists();

        if ($hasAnyOrder) {
            $service->update(['is_active' => false]);

            return redirect()->route('admin.services.index')->with('success', 'Layanan dinonaktifkan (riwayat transaksi lama tetap aman, tapi tidak muncul lagi untuk transaksi baru).');
        }

        $service->delete();

        return redirect()->route('admin.services.index')->with('success', 'Layanan berhasil dihapus.');
    }
}