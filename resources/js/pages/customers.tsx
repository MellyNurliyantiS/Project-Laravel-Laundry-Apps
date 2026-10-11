import { ConfirmDialog } from '@/components/confirm-dialog';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Outlet = {
    id: number;
    name: string;
};

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    outlet_id?: number;
    outlet?: Outlet;
};

type Props = {
    customers: Customer[];
    outlets: Outlet[];
};

export default function Customers({ customers, outlets }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const isAdmin = outlets.length > 0;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        address: '',
        outlet_id: '',
    });

    function openCreateForm() {
        reset();
        setEditingId(null);
        setShowForm(true);
    }

    function openEditForm(customer: Customer) {
        setData({
            name: customer.name,
            phone: customer.phone ?? '',
            address: customer.address ?? '',
            outlet_id: customer.outlet_id ? String(customer.outlet_id) : '',
        });
        setEditingId(customer.id);
        setShowForm(true);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const onSuccess = () => {
            reset();
            setShowForm(false);
            setEditingId(null);
        };

        if (editingId) {
            put(`/customers/${editingId}`, { onSuccess });
        } else {
            post('/customers', { onSuccess });
        }
    }

    function handleDelete(id: number) {
        setDeleteId(id);
    }

    function confirmDelete() {
        if (deleteId) {
            router.delete(`/customers/${deleteId}`);
            setDeleteId(null);
        }
    }

    return (
        <>
            <Head title="Pelanggan" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Pelanggan</h1>
                    {!showForm && (
                        <button
                            onClick={openCreateForm}
                            className="flex items-center gap-2 rounded-lg bg-[#378add] px-4 py-2 text-sm font-medium text-white hover:bg-[#185fa5]"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pelanggan
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
                                {editingId ? 'Edit Pelanggan' : 'Pelanggan Baru'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-lg p-1.5 hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {isAdmin && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Outlet</label>
                                    <select
                                        value={data.outlet_id}
                                        onChange={(e) => setData('outlet_id', e.target.value)}
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
                                <label className="mb-1 block text-sm font-medium">Nama</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">No. HP</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-sm font-medium">Alamat</label>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
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
                    {customers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada pelanggan.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 pr-4 font-medium">Nama</th>
                                    <th className="pb-2 pr-4 font-medium">No. HP</th>
                                    <th className="pb-2 pr-4 font-medium">Alamat</th>
                                    {isAdmin && <th className="pb-2 pr-4 font-medium">Outlet</th>}
                                    <th className="pb-2 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b last:border-0">
                                        <td className="py-2.5 pr-4 font-medium">{customer.name}</td>
                                        <td className="py-2.5 pr-4">{customer.phone ?? '-'}</td>
                                        <td className="py-2.5 pr-4">{customer.address ?? '-'}</td>
                                        {isAdmin && <td className="py-2.5 pr-4">{customer.outlet?.name ?? '-'}</td>}
                                        <td className="py-2.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditForm(customer)}
                                                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
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
                title="Hapus Pelanggan"
                message="Yakin ingin menghapus pelanggan ini? Tindakan ini tidak bisa dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}