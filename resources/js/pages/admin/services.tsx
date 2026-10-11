import { ConfirmDialog } from '@/components/confirm-dialog';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Service = {
    id: number;
    name: string;
    unit: string;
    price: number;
    duration_days: number;
    is_active: boolean;
};

type Props = {
    services: Service[];
};

const presetNames = [
    'Cuci Kiloan Reguler',
    'Cuci Kiloan Express',
    'Cuci Setrika',
    'Cuci Sepatu',
    'Cuci Selimut/Bedcover',
];

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

const unitLabel: Record<string, string> = {
    kg: 'per kg',
    pcs: 'per pcs',
    set: 'per set',
};

export default function AdminServices({ services }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [useCustomName, setUseCustomName] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        unit: 'kg',
        price: '',
        duration_days: '1',
    });

    function openCreateForm() {
        reset();
        setEditingId(null);
        setUseCustomName(false);
        setShowForm(true);
    }

    function openEditForm(service: Service) {
        setData({
            name: service.name,
            unit: service.unit,
            price: String(service.price),
            duration_days: String(service.duration_days),
        });
        setUseCustomName(!presetNames.includes(service.name));
        setEditingId(service.id);
        setShowForm(true);
    }

    function handleNameSelect(value: string) {
        if (value === '__custom__') {
            setUseCustomName(true);
            setData('name', '');
        } else {
            setUseCustomName(false);
            setData('name', value);
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const onSuccess = () => {
            reset();
            setShowForm(false);
            setEditingId(null);
        };

        if (editingId) {
            put(`/admin/services/${editingId}`, { onSuccess });
        } else {
            post('/admin/services', { onSuccess });
        }
    }

    function handleDelete(id: number) {
        setDeleteId(id);
    }

    function confirmDelete() {
        if (deleteId) {
            router.delete(`/admin/services/${deleteId}`);
            setDeleteId(null);
        }
    }

    return (
        <>
            <Head title="Layanan" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Layanan</h1>
                    {!showForm && (
                        <button
                            onClick={openCreateForm}
                            className="flex items-center gap-2 rounded-lg bg-[#378add] px-4 py-2 text-sm font-medium text-white hover:bg-[#185fa5]"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Layanan
                        </button>
                    )}
                </div>

                {showForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                {editingId ? 'Edit Layanan' : 'Layanan Baru'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-lg p-1.5 hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="mb-1 block text-sm font-medium">Nama Layanan</label>
                                {!useCustomName ? (
                                    <select
                                        value={data.name}
                                        onChange={(e) => handleNameSelect(e.target.value)}
                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <option value="">Pilih layanan</option>
                                        {presetNames.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                        <option value="__custom__">+ Lainnya (ketik manual)</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Nama layanan custom"
                                            className="w-full rounded-lg border px-3 py-2 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseCustomName(false);
                                                setData('name', '');
                                            }}
                                            className="shrink-0 rounded-lg border px-2 text-xs text-muted-foreground hover:bg-muted"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                )}
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Satuan</label>
                                <select
                                    value={data.unit}
                                    onChange={(e) => setData('unit', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="pcs">Per Item (pcs)</option>
                                    <option value="set">Per Set</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Harga (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="7000"
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Estimasi (hari)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.duration_days}
                                    onChange={(e) => setData('duration_days', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                                {errors.duration_days && (
                                    <p className="mt-1 text-xs text-red-600">{errors.duration_days}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-[#378add] px-6 py-2 text-sm font-medium text-white hover:bg-[#185fa5] disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                    {services.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada layanan.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 pr-4 font-medium">Nama</th>
                                    <th className="pb-2 pr-4 font-medium">Harga</th>
                                    <th className="pb-2 pr-4 font-medium">Estimasi</th>
                                    <th className="pb-2 pr-4 font-medium">Status</th>
                                    <th className="pb-2 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id} className="border-b last:border-0">
                                        <td className="py-2.5 pr-4 font-medium">{service.name}</td>
                                        <td className="py-2.5 pr-4">
                                            {formatRupiah(service.price)} {unitLabel[service.unit]}
                                        </td>
                                        <td className="py-2.5 pr-4">{service.duration_days} hari</td>
                                        <td className="py-2.5 pr-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    service.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {service.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditForm(service)}
                                                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={deleteId !== null}
                title="Hapus Layanan"
                message="Yakin ingin menghapus layanan ini? Jika masih dipakai di transaksi, layanan akan dinonaktifkan alih-alih dihapus permanen."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}