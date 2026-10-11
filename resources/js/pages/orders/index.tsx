import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';

type Customer = { id: number; name: string };
type Outlet = { id: number; name: string };

type Order = {
    id: number;
    invoice_number: string;
    status: string;
    total_amount: number;
    estimated_finish: string | null;
    created_at: string;
    customer: Customer;
    outlet: Outlet;
};

type Props = {
    orders: Order[];
    filter: string | null;
    totalBelumDibayar: number | null;
};

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatTanggal(value: string) {
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
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

const filterTitle: Record<string, string> = {
    today: 'Transaksi Hari Ini',
    belum_selesai: 'Transaksi Belum Selesai',
};

export default function OrdersIndex({ orders, filter, totalBelumDibayar }: Props) {
    const title = filter ? filterTitle[filter] ?? 'Transaksi' : 'Transaksi';

    return (
        <>
            <Head title={title} />

            <div className="flex flex-col gap-4 p-4">
                {filter && (
                    <Link
                        href="/dashboard"
                        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">{title}</h1>
                        {filter && (
                            <Link href="/orders" className="text-xs text-[#378add] hover:underline">
                                Lihat semua transaksi
                            </Link>
                        )}
                    </div>
                    <button
                        onClick={() => router.visit('/orders/create')}
                        className="flex items-center gap-2 rounded-lg bg-[#378add] px-4 py-2 text-sm font-medium text-white hover:bg-[#185fa5]"
                    >
                        <Plus className="h-4 w-4" />
                        Transaksi Baru
                    </button>
                </div>

                {filter === 'belum_selesai' && totalBelumDibayar !== null && totalBelumDibayar > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Total tagihan yang belum dibayar dari transaksi ini: <strong>{formatRupiah(totalBelumDibayar)}</strong>
                    </div>
                )}

                <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                    {orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 pr-4 font-medium">Invoice</th>
                                        <th className="pb-2 pr-4 font-medium">Pelanggan</th>
                                        <th className="pb-2 pr-4 font-medium">Outlet</th>
                                        <th className="pb-2 pr-4 font-medium">Estimasi Selesai</th>
                                        <th className="pb-2 pr-4 font-medium">Status</th>
                                        <th className="pb-2 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            onClick={() => router.visit(`/orders/${order.id}`)}
                                            className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                                        >
                                            <td className="py-2.5 pr-4 font-medium">
                                                <Link href={`/orders/${order.id}`} className="hover:underline">
                                                    {order.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="py-2.5 pr-4">{order.customer?.name ?? '-'}</td>
                                            <td className="py-2.5 pr-4">{order.outlet?.name ?? '-'}</td>
                                            <td className="py-2.5 pr-4">
                                                {order.estimated_finish ? formatTanggal(order.estimated_finish) : '-'}
                                            </td>
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