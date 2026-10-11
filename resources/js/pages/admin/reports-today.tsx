import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

type PaymentRow = {
    id: number;
    amount: number;
    method: string;
    paid_at: string;
    invoice_number: string;
    customer_name: string;
    outlet_name: string;
    services: string;
};

type Props = {
    date: string;
    totalRevenue: number;
    totalBelumDibayar: number;
    payments: PaymentRow[];
};

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatWaktu(value: string) {
    return new Date(value).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatTanggalPanjang(value: string) {
    return new Date(value).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

const methodLabel: Record<string, string> = {
    cash: 'Tunai',
    transfer: 'Transfer',
    qris: 'QRIS',
};

export default function ReportsToday({ date, totalRevenue, totalBelumDibayar, payments }: Props) {
    return (
        <>
            <Head title="Pendapatan Hari Ini" />

            <div className="flex flex-col gap-4 p-4">
                <Link
                    href="/dashboard"
                    className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Dashboard
                </Link>

                <div>
                    <h1 className="text-lg font-semibold">Pendapatan Hari Ini</h1>
                    <p className="text-sm text-muted-foreground">{formatTanggalPanjang(date)}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <p className="text-xs text-muted-foreground">Total Uang Masuk Hari Ini</p>
                        <p className="mt-1 text-2xl font-semibold text-green-700">{formatRupiah(totalRevenue)}</p>
                    </div>

                    {totalBelumDibayar > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                            <p className="text-xs text-amber-700">Belum Dibayar (dari transaksi hari ini)</p>
                            <p className="mt-1 text-2xl font-semibold text-amber-700">{formatRupiah(totalBelumDibayar)}</p>
                            <p className="mt-1 text-xs text-amber-600">Ini hanya info, tidak dihitung ke total pendapatan.</p>
                        </div>
                    )}
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                    <h2 className="mb-4 text-sm font-semibold">Rincian Pembayaran</h2>

                    {payments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada pembayaran masuk hari ini.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 pr-4 font-medium">Waktu</th>
                                        <th className="pb-2 pr-4 font-medium">Invoice</th>
                                        <th className="pb-2 pr-4 font-medium">Pelanggan</th>
                                        <th className="pb-2 pr-4 font-medium">Layanan</th>
                                        <th className="pb-2 pr-4 font-medium">Outlet</th>
                                        <th className="pb-2 pr-4 font-medium">Metode</th>
                                        <th className="pb-2 text-right font-medium">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.id} className="border-b last:border-0">
                                            <td className="py-2.5 pr-4">{formatWaktu(p.paid_at)}</td>
                                            <td className="py-2.5 pr-4 font-medium">{p.invoice_number}</td>
                                            <td className="py-2.5 pr-4">{p.customer_name}</td>
                                            <td className="py-2.5 pr-4">{p.services}</td>
                                            <td className="py-2.5 pr-4">{p.outlet_name}</td>
                                            <td className="py-2.5 pr-4">{methodLabel[p.method] ?? p.method}</td>
                                            <td className="py-2.5 text-right font-medium">{formatRupiah(p.amount)}</td>
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