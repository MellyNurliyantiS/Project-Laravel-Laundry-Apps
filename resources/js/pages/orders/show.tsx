import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

type Customer = { id: number; name: string; phone?: string; address?: string };
type Outlet = { id: number; name: string };
type User = { id: number; name: string };
type Service = { id: number; name: string; unit: string };

type OrderItem = {
    id: number;
    qty: number;
    price: number;
    subtotal: number;
    service: Service;
};

type Payment = {
    id: number;
    amount: number;
    method: string;
    paid_at: string;
};

type Order = {
    id: number;
    invoice_number: string;
    status: string;
    total_amount: number;
    notes: string | null;
    estimated_finish: string | null;
    created_at: string;
    customer: Customer;
    outlet: Outlet;
    user: User;
    items: OrderItem[];
    payments: Payment[];
    paid_amount: number;
    payment_status: string;
};

type Props = {
    order: Order;
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

const statusOptions = [
    { value: 'baru', label: 'Baru' },
    { value: 'proses', label: 'Diproses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'diambil', label: 'Diambil' },
];

const methodLabel: Record<string, string> = {
    cash: 'Tunai',
    transfer: 'Transfer',
    qris: 'QRIS',
};

export default function OrdersShow({ order }: Props) {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const sisaBayar = order.total_amount - order.paid_amount;

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: sisaBayar > 0 ? String(sisaBayar) : '',
        method: 'cash',
    });

    function handleStatusChange(newStatus: string) {
        router.patch(
            `/orders/${order.id}/status`,
            { status: newStatus },
            {
                onSuccess: () => router.visit('/orders'),
            }
        );
    }

    function handlePaymentSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/orders/${order.id}/payments`, {
            onSuccess: () => {
                reset();
                setShowPaymentForm(false);
            },
        });
    }

    return (
        <>
            <Head title={`Transaksi ${order.invoice_number}`} />

            <div className="flex flex-col gap-4 p-4">
                <Link
                    href="/orders"
                    className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Transaksi
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">{order.invoice_number}</h1>
                        <p className="text-sm text-muted-foreground">
                            {order.customer?.name} &middot; {order.outlet?.name}
                        </p>
                    </div>
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="rounded-lg border px-4 py-2 text-sm font-medium"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2 dark:bg-[#0f2a44]">
                        <h2 className="mb-3 text-sm font-semibold">Item Layanan</h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 font-medium">Layanan</th>
                                    <th className="pb-2 text-right font-medium">Qty</th>
                                    <th className="pb-2 text-right font-medium">Harga</th>
                                    <th className="pb-2 text-right font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                                            Detail item tidak tersedia (mungkin layanan terkait sudah dihapus).
                                        </td>
                                    </tr>
                                ) : (
                                    order.items.map((item) => (
                                        <tr key={item.id} className="border-b last:border-0">
                                            <td className="py-2.5">{item.service?.name ?? '-'}</td>
                                            <td className="py-2.5 text-right">
                                                {item.qty} {item.service?.unit}
                                            </td>
                                            <td className="py-2.5 text-right">{formatRupiah(item.price)}</td>
                                            <td className="py-2.5 text-right font-medium">{formatRupiah(item.subtotal)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div className="mt-4 flex justify-end border-t pt-3">
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-xl font-semibold">{formatRupiah(order.total_amount)}</p>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
                                <p className="text-xs font-medium text-muted-foreground">Catatan</p>
                                <p className="mt-1">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                            <h2 className="mb-3 text-sm font-semibold">Info</h2>
                            <dl className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
    <dt className="text-muted-foreground">Diproses oleh</dt>
    <dd>{order.user?.name}</dd>
</div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Tanggal masuk</dt>
                                    <dd>{formatTanggal(order.created_at)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Estimasi selesai</dt>
                                    <dd>{order.estimated_finish ? formatTanggal(order.estimated_finish) : '-'}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-sm font-semibold">Pembayaran</h2>
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                        order.payment_status === 'lunas'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}
                                >
                                    {order.payment_status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                </span>
                            </div>

                            <dl className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Total tagihan</dt>
                                    <dd>{formatRupiah(order.total_amount)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Sudah dibayar</dt>
                                    <dd>{formatRupiah(order.paid_amount)}</dd>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-medium">
                                    <dt>Sisa</dt>
                                    <dd>{formatRupiah(Math.max(sisaBayar, 0))}</dd>
                                </div>
                            </dl>

                            {order.payments.length > 0 && (
                                <div className="mt-3 flex flex-col gap-1.5 border-t pt-3 text-xs text-muted-foreground">
                                    {order.payments.map((p) => (
                                        <div key={p.id} className="flex justify-between">
                                            <span>
                                                {formatTanggal(p.paid_at)} &middot; {methodLabel[p.method]}
                                            </span>
                                            <span>{formatRupiah(p.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {sisaBayar > 0 && (
                                <>
                                    {!showPaymentForm ? (
                                        <button
                                            onClick={() => setShowPaymentForm(true)}
                                            className="mt-4 w-full rounded-lg bg-[#378add] px-4 py-2 text-sm font-medium text-white hover:bg-[#185fa5]"
                                        >
                                            Catat Pembayaran
                                        </button>
                                    ) : (
                                        <form onSubmit={handlePaymentSubmit} className="mt-4 flex flex-col gap-2 border-t pt-3">
                                            <div>
                                                <label className="mb-1 block text-xs text-muted-foreground">Jumlah bayar</label>
                                                <input
                                                    type="number"
                                                    value={data.amount}
                                                    onChange={(e) => setData('amount', e.target.value)}
                                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                                />
                                                {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs text-muted-foreground">Metode</label>
                                                <select
                                                    value={data.method}
                                                    onChange={(e) => setData('method', e.target.value)}
                                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                                >
                                                    <option value="cash">Tunai</option>
                                                    <option value="transfer">Transfer</option>
                                                    <option value="qris">QRIS</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPaymentForm(false)}
                                                    className="flex-1 rounded-lg border px-4 py-2 text-sm"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex-1 rounded-lg bg-[#378add] px-4 py-2 text-sm font-medium text-white hover:bg-[#185fa5] disabled:opacity-50"
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}