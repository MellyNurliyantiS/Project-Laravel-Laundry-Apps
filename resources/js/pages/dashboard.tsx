import { Head, Link, usePage } from '@inertiajs/react';
import { Banknote, ClipboardList, ShoppingBag, Store } from 'lucide-react';

type Customer = { id: number; name: string };
type Outlet = { id: number; name: string };

type Order = {
    id: number;
    invoice_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    customer: Customer;
    outlet: Outlet;
};

type Stats = {
    ordersToday: number;
    revenueToday: number;
    totalCustomers: number;
    totalOutlets: number;
    ordersBelumSelesai: number;
};

type DashboardProps = {
    stats: Stats;
    recentOrders: Order[];
};

type Auth = {
    user: { role: 'admin' | 'kasir' };
};

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

const statusLabel: Record<string, string> = {
    baru: 'Baru',
    proses: 'Diproses',
    selesai: 'Selesai',
    diambil: 'Diambil',
};

const statusColor: Record<string, string> = {
    baru: 'bg-blue-100 text-blue-700',
    proses: 'bg-amber-100 text-amber-700',
    selesai: 'bg-green-100 text-green-700',
    diambil: 'bg-gray-100 text-gray-700',
};

export default function Dashboard({ stats, recentOrders }: DashboardProps) {
    const { auth } = usePage().props as unknown as { auth: Auth };
    const isAdmin = auth.user.role === 'admin';

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">
                <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
                    <Link
                        href="/orders?filter=today"
                        className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-[#0f2a44]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <ShoppingBag className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Pesanan Hari Ini</p>
                                <p className="text-xl font-semibold">{stats.ordersToday}</p>
                            </div>
                        </div>
                    </Link>

                    {isAdmin ? (
                        <Link
                            href="/admin/reports/today"
                            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-[#0f2a44]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <Banknote className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Pendapatan Hari Ini</p>
                                    <p className="text-xl font-semibold">{formatRupiah(stats.revenueToday)}</p>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <Banknote className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Pendapatan Hari Ini</p>
                                    <p className="text-xl font-semibold">{formatRupiah(stats.revenueToday)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/orders?filter=belum_selesai"
                        className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-[#0f2a44]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-100 p-2">
                                <ClipboardList className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Belum Selesai</p>
                                <p className="text-xl font-semibold">{stats.ordersBelumSelesai}</p>
                            </div>
                        </div>
                    </Link>

                    {isAdmin && (
                        <Link
                            href="/admin/outlets"
                            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-[#0f2a44]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Store className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Outlet</p>
                                    <p className="text-xl font-semibold">{stats.totalOutlets}</p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                    <h2 className="mb-4 text-base font-semibold">Pesanan Terbaru</h2>

                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 pr-4 font-medium">Invoice</th>
                                        <th className="pb-2 pr-4 font-medium">Pelanggan</th>
                                        <th className="pb-2 pr-4 font-medium">Outlet</th>
                                        <th className="pb-2 pr-4 font-medium">Status</th>
                                        <th className="pb-2 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0">
                                            <td className="py-2.5 pr-4 font-medium">
                                                <Link href={`/orders/${order.id}`} className="hover:underline">
                                                    {order.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="py-2.5 pr-4">{order.customer?.name ?? '-'}</td>
                                            <td className="py-2.5 pr-4">{order.outlet?.name ?? '-'}</td>
                                            <td className="py-2.5 pr-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                                                >
                                                    {statusLabel[order.status] ?? order.status}
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-right font-medium">
                                                {formatRupiah(order.total_amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}