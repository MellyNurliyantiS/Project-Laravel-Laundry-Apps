import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';

type Customer = { id: number; name: string; phone?: string };
type Service = { id: number; name: string; unit: string; price: number };
type Outlet = { id: number; name: string };
type KasirUser = { id: number; name: string; outlet_id: number | null };

type Props = {
    customers: Customer[];
    services: Service[];
    outlets: Outlet[];
    kasirUsers: KasirUser[];
    defaultOutletId: number | null;
    today: string;
};

type ItemForm = {
    service_id: string;
    qty: string;
};

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

export default function OrdersCreate({ customers, services, outlets, kasirUsers, defaultOutletId, today }: Props) {
    const isAdmin = outlets.length > 0;

    const { data, setData, post, processing, errors } = useForm<{
        customer_id: string;
        outlet_id: string;
        order_date: string;
        user_id: string;
        notes: string;
        items: ItemForm[];
    }>({
        customer_id: '',
        outlet_id: defaultOutletId ? String(defaultOutletId) : '',
        order_date: today,
        user_id: '',
        notes: '',
        items: [{ service_id: '', qty: '1' }],
    });

    function addItem() {
        setData('items', [...data.items, { service_id: '', qty: '1' }]);
    }

    function removeItem(index: number) {
        setData('items', data.items.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof ItemForm, value: string) {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    }

    function getServicePrice(serviceId: string) {
        const service = services.find((s) => String(s.id) === serviceId);
        return service ? service.price : 0;
    }

    const total = data.items.reduce((sum, item) => {
        const price = getServicePrice(item.service_id);
        const qty = parseFloat(item.qty) || 0;
        return sum + price * qty;
    }, 0);

    const filteredKasir = data.outlet_id
        ? kasirUsers.filter((k) => String(k.outlet_id) === data.outlet_id)
        : kasirUsers;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/orders');
    }

    return (
        <>
            <Head title="Transaksi Baru" />

            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-lg font-semibold">Transaksi Baru</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Tanggal Transaksi</label>
                                <input
                                    type="date"
                                    value={data.order_date}
                                    onChange={(e) => setData('order_date', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                                {errors.order_date && <p className="mt-1 text-xs text-red-600">{errors.order_date}</p>}
                            </div>

                            {outlets.length > 0 && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Outlet</label>
                                    <select
                                        value={data.outlet_id}
                                        onChange={(e) => {
                                            setData('outlet_id', e.target.value);
                                            setData('user_id', '');
                                        }}
                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <option value="">Pilih outlet</option>
                                        {outlets.map((outlet) => (
                                            <option key={outlet.id} value={outlet.id}>
                                                {outlet.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.outlet_id && <p className="mt-1 text-xs text-red-600">{errors.outlet_id}</p>}
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-sm font-medium">Pelanggan</label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => setData('customer_id', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="">Pilih pelanggan</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && <p className="mt-1 text-xs text-red-600">{errors.customer_id}</p>}
                            </div>

                            {isAdmin && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Diproses oleh Kasir</label>
                                    <select
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                        disabled={!data.outlet_id}
                                    >
                                        <option value="">
                                            {data.outlet_id ? 'Saya sendiri (Admin)' : 'Pilih outlet dulu'}
                                        </option>
                                        {filteredKasir.map((kasir) => (
                                            <option key={kasir.id} value={kasir.id}>
                                                {kasir.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="mt-1 text-xs text-red-600">{errors.user_id}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Item Layanan</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1 text-sm font-medium text-[#0c447c] hover:underline"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah item
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {data.items.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="mb-1 block text-xs text-muted-foreground">Layanan</label>
                                        <select
                                            value={item.service_id}
                                            onChange={(e) => updateItem(index, 'service_id', e.target.value)}
                                            className="w-full rounded-lg border px-3 py-2 text-sm"
                                        >
                                            <option value="">Pilih layanan</option>
                                            {services.map((service) => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name} - {formatRupiah(service.price)}/{service.unit}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-28">
                                        <label className="mb-1 block text-xs text-muted-foreground">Qty</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            value={item.qty}
                                            onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                            className="w-full rounded-lg border px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="w-32 text-right text-sm font-medium">
                                        {formatRupiah(getServicePrice(item.service_id) * (parseFloat(item.qty) || 0))}
                                    </div>
                                    {data.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.items && <p className="mt-2 text-xs text-red-600">{errors.items}</p>}

                        <div className="mt-4 flex justify-end border-t pt-3">
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-xl font-semibold">{formatRupiah(total)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                        <label className="mb-1 block text-sm font-medium">Catatan (opsional)</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                            placeholder="Contoh: baju putih dipisah, jangan pakai pewangi, dll."
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-[#378add] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#185fa5] disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}