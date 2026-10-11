<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Outlet;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
{
    $user = Auth::user();

    $query = Customer::with('outlet');

    if (!$user->isAdmin() && $user->outlet_id) {
        $query->where('outlet_id', $user->outlet_id);
    }

    return Inertia::render('customers', [
        'customers' => $query->orderBy('name')->get(),
        'outlets' => $user->isAdmin() ? Outlet::orderBy('name')->get(['id', 'name']) : [],
    ]);
}

    public function store(Request $request)
    {
        $user = Auth::user();

        $rules = [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
        ];

        if ($user->isAdmin()) {
            $rules['outlet_id'] = 'required|exists:outlets,id';
        }

        $validated = $request->validate($rules);

        $validated['outlet_id'] = $user->isAdmin()
            ? $validated['outlet_id']
            : $user->outlet_id;

        Customer::create($validated);

        return redirect()->route('customers.index')->with('success', 'Pelanggan berhasil ditambahkan.');
    }

    public function update(Request $request, Customer $customer)
    {
        $user = Auth::user();

        $rules = [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
        ];

        if ($user->isAdmin()) {
            $rules['outlet_id'] = 'required|exists:outlets,id';
        }

        $validated = $request->validate($rules);

        if ($user->isAdmin()) {
            $customer->update($validated);
        } else {
            $customer->update([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);
        }

        return redirect()->route('customers.index')->with('success', 'Pelanggan berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        try {
            $customer->delete();
        } catch (QueryException $e) {
            return redirect()->route('customers.index')->with('error', 'Pelanggan tidak bisa dihapus karena masih punya transaksi terkait.');
        }

        return redirect()->route('customers.index')->with('success', 'Pelanggan berhasil dihapus.');
    }
}