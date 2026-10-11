<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OutletController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/outlets', [
            'outlets' => Outlet::withCount(['users', 'customers', 'orders'])->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
        ]);

        Outlet::create($validated);

        return redirect()->route('admin.outlets.index')->with('success', 'Outlet berhasil ditambahkan.');
    }

    public function update(Request $request, Outlet $outlet)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
        ]);

        $outlet->update($validated);

        return redirect()->route('admin.outlets.index')->with('success', 'Outlet berhasil diperbarui.');
    }

    public function destroy(Outlet $outlet)
    {
        try {
            $outlet->delete();
        } catch (QueryException $e) {
            return redirect()->route('admin.outlets.index')->with('error', 'Outlet tidak bisa dihapus karena masih punya data terkait (user, pelanggan, atau transaksi).');
        }

        return redirect()->route('admin.outlets.index')->with('success', 'Outlet berhasil dihapus.');
    }
}