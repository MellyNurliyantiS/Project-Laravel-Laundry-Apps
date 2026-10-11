<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin utama
        User::updateOrCreate(
            ['email' => 'admin@laundrykilat.test'],
            [
                'name' => 'Admin Laundry Kilat',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Buat 5 outlet
        $outletNames = [
            'Laundry Kilat - Ciamis Kota',
            'Laundry Kilat - Cijeungjing',
            'Laundry Kilat - Cikoneng',
            'Laundry Kilat - Baregbeg',
            'Laundry Kilat - Sindangkasih',
        ];

        $outlets = collect($outletNames)->map(function ($name) {
            return Outlet::create([
                'name' => $name,
                'address' => 'Jl. Raya '.$name.', Ciamis, Jawa Barat',
                'phone' => '0821'.rand(10000000, 99999999),
            ]);
        });

        // 3. Buat 5 kasir, masing-masing di outlet berbeda
        $kasirNames = ['Siti Aminah', 'Budi Santoso', 'Dewi Lestari', 'Agus Setiawan', 'Rina Wulandari'];

        foreach ($kasirNames as $i => $name) {
            $email = strtolower(str_replace(' ', '.', $name)).'@laundrykilat.test';
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => 'kasir',
                    'outlet_id' => $outlets[$i % $outlets->count()]->id,
                    'email_verified_at' => now(),
                ]
            );
        }

        // 4. Buat 5 layanan (global, tidak terikat outlet tertentu)
        $serviceTemplates = [
            ['name' => 'Cuci Kiloan Reguler', 'unit' => 'kg', 'price' => 7000, 'duration_days' => 2],
            ['name' => 'Cuci Kiloan Express', 'unit' => 'kg', 'price' => 12000, 'duration_days' => 1],
            ['name' => 'Cuci Setrika', 'unit' => 'kg', 'price' => 9000, 'duration_days' => 2],
            ['name' => 'Cuci Sepatu', 'unit' => 'pcs', 'price' => 25000, 'duration_days' => 3],
            ['name' => 'Cuci Selimut/Bedcover', 'unit' => 'set', 'price' => 35000, 'duration_days' => 3],
        ];

        $services = collect($serviceTemplates)->map(fn ($tmpl) => Service::create($tmpl));

        // 5. Buat 5 pelanggan, tersebar di beberapa outlet
        $customerNames = ['Andi Wijaya', 'Sri Rahayu', 'Yusuf Hidayat', 'Nur Fadhilah', 'Bambang Priyono'];
        $customers = collect();

        foreach ($customerNames as $i => $name) {
            $outlet = $outlets[$i % $outlets->count()];
            $customers->push(Customer::create([
                'outlet_id' => $outlet->id,
                'name' => $name,
                'phone' => '0812'.rand(10000000, 99999999),
                'address' => 'Jl. Contoh No. '.rand(1, 99).', Ciamis',
            ]));
        }

        // 6. Buat 5 transaksi contoh (di outlet pertama)
        $mainOutlet = $outlets->first();
        $mainServices = $services;
        $kasir = User::where('role', 'kasir')->where('outlet_id', $mainOutlet->id)->first();
        $statusOptions = ['baru', 'proses', 'selesai', 'diambil', 'proses'];

        foreach (range(1, 5) as $i) {
            $customer = $customers[($i - 1) % $customers->count()];
            $service = $mainServices[($i - 1) % $mainServices->count()];
            $qty = rand(1, 5);
            $subtotal = $service->price * $qty;

            $order = Order::create([
                'invoice_number' => 'INV-'.now()->format('Ymd').'-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'outlet_id' => $mainOutlet->id,
                'customer_id' => $customer->id,
                'user_id' => $kasir?->id ?? User::where('role', 'admin')->first()->id,
                'status' => $statusOptions[$i - 1],
                'total_amount' => $subtotal,
                'estimated_finish' => now()->addDays($service->duration_days)->toDateString(),
                'notes' => null,
            ]);

            $order->items()->create([
                'service_id' => $service->id,
                'qty' => $qty,
                'price' => $service->price,
                'subtotal' => $subtotal,
            ]);

            // 3 dari 5 transaksi dianggap sudah dibayar (lunas), sisanya belum
            if ($i <= 3) {
                $order->payments()->create([
                    'amount' => $subtotal,
                    'method' => ['cash', 'transfer', 'qris'][($i - 1) % 3],
                    'paid_at' => now(),
                ]);
            }
        }
    }
}