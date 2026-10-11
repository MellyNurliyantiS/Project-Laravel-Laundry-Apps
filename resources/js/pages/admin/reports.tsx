import { Head, router } from '@inertiajs/react';
import { Banknote, CheckCircle2, Clock, ShoppingBag } from 'lucide-react';
import { FormEvent, useState } from 'react';

type OutletRevenue = {
    id: number;
    name: string;
    orders_count: number;
    revenue: number;
};

type TopService = {
    id: number;
    name: string;
    unit: string;
    total_qty: number;
    total_revenue: number;
};

type Summary = {
    totalOrders: number;
    totalRevenue: number;
    totalPaid: number;
    totalUnpaid: number;
};

type Props = {
    filters: {
        start_date: string;
        end_date: string;
    };
    summary: Summary;
    revenueByOutlet: OutletRevenue[];
    topServices: TopService[];
};

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

export default function AdminReports({ filters, summary, revenueByOutlet, topServices }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    function handleFilter(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/reports', { start_date: startDate, end_date: endDate }, { preserveState: true });
    }

    const maxOutletRevenue = Math.max(...revenueByOutlet.map((o) => o.revenue), 1);
    const maxServiceRevenue = Math.max(...topServices.map((s) => s.total_revenue), 1);

    return (
        <>
            <Head title="Laporan" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Laporan</h1>
                </div>

                {/* Filter tanggal */}
                <form
                    onSubmit={handleFilter}
                    className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-[#0f2a44]"
                >
                    <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Dari tanggal</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Sampai tanggal</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-lg bg-[#378add] px-5 py-2 text-sm font-medium text-white hover:bg-[#185fa5]"
                    >
                        Terapkan
                    </button>
                </form>

                {/* Ringkasan */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <ShoppingBag className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Transaksi</p>
                                <p className="text-xl font-semibold">{summary.totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <Banknote className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Pendapatan</p>
                                <p className="text-xl font-semibold">{formatRupiah(summary.totalRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-100 p-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Sudah Dibayar</p>
                                <p className="text-xl font-semibold">{formatRupiah(summary.totalPaid)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-100 p-2">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Belum Dibayar</p>
                                <p className="text-xl font-semibold">{formatRupiah(summary.totalUnpaid)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Pendapatan per outlet */}
                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <h2 className="mb-4 text-sm font-semibold">Pendapatan per Outlet</h2>
                        {revenueByOutlet.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada data.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {revenueByOutlet.map((outlet) => (
                                    <div key={outlet.id}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-medium">{outlet.name}</span>
                                            <span className="text-muted-foreground">
                                                {formatRupiah(outlet.revenue)} &middot; {outlet.orders_count} transaksi
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-[#378add]"
                                                style={{ width: `${(outlet.revenue / maxOutletRevenue) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Layanan paling laku */}
                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <h2 className="mb-4 text-sm font-semibold">Layanan Paling Laku</h2>
                        {topServices.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada data.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {topServices.map((service) => (
                                    <div key={service.id}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-medium">{service.name}</span>
                                            <span className="text-muted-foreground">
                                                {formatRupiah(service.total_revenue)} &middot; {service.total_qty} {service.unit}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-emerald-500"
                                                style={{ width: `${(service.total_revenue / maxServiceRevenue) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}