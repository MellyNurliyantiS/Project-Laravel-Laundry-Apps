import { ConfirmDialog } from '@/components/confirm-dialog';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Store, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Outlet = {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    users_count: number;
    customers_count: number;
    orders_count: number;
};

type Props = {
    outlets: Outlet[];
};

export default function AdminOutlets({ outlets }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        address: '',
        phone: '',
    });

    function openCreateForm() {
        reset();
        setEditingId(null);
        setShowForm(true);
    }

    function openEditForm(outlet: Outlet) {
        setData({
            name: outlet.name,
            address: outlet.address ?? '',
            phone: outlet.phone ?? '',
        });
        setEditingId(outlet.id);
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
            put(`/admin/outlets/${editingId}`, { onSuccess });
        } else {
            post('/admin/outlets', { onSuccess });
        }
    }

    function handleDelete(id: number) {
        setDeleteId(id);
    }

    function confirmDelete() {
        if (deleteId) {
            router.delete(`/admin/outlets/${deleteId}`);
            setDeleteId(null);
        }
    }

    return (
    <>
        <Head title="Outlet" />

        <div className="flex flex-col gap-4 p-4">
            <Link
                href="/dashboard"
                className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
            </Link>

            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Outlet</h1>
                    {!showForm && (
                        <button
                            onClick={openCreateForm}
                            className="flex items-center gap-2 rounded-lg bg-[#378add] px-4 py-2 text-sm font-medium text-white hover:bg-[#185fa5]"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Outlet
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
                                {editingId ? 'Edit Outlet' : 'Outlet Baru'}
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
                            <div>
                                <label className="mb-1 block text-sm font-medium">Nama Outlet</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Laundry Kilat - Cabang Ciamis"
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">No. Telepon</label>
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {outlets.length === 0 ? (
                        <div className="rounded-xl bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-3 dark:bg-[#0f2a44]">
                            <p className="text-sm text-muted-foreground">Belum ada outlet.</p>
                        </div>
                    ) : (
                        outlets.map((outlet) => (
                            <div key={outlet.id} className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-blue-100 p-2">
                                            <Store className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h3 className="font-medium">{outlet.name}</h3>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditForm(outlet)}
                                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(outlet.id)}
                                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {outlet.address && (
                                    <p className="mt-2 text-sm text-muted-foreground">{outlet.address}</p>
                                )}
                                {outlet.phone && (
                                    <p className="mt-1 text-sm text-muted-foreground">{outlet.phone}</p>
                                )}

                                <div className="mt-3 flex gap-4 border-t pt-3 text-xs text-muted-foreground">
                                    <span>{outlet.users_count} staff</span>
                                    <span>{outlet.customers_count} pelanggan</span>
                                    <span>{outlet.orders_count} transaksi</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={deleteId !== null}
                title="Hapus Outlet"
                message="Yakin ingin menghapus outlet ini? Outlet dengan data terkait tidak bisa dihapus."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}