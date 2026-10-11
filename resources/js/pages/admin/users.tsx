import { ConfirmDialog } from '@/components/confirm-dialog';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Outlet = {
    id: number;
    name: string;
};

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'kasir';
    outlet_id: number | null;
    outlet?: Outlet | null;
};

type Props = {
    users: UserRow[];
    outlets: Outlet[];
};

const roleLabel: Record<string, string> = {
    admin: 'Admin',
    kasir: 'Kasir',
};

const roleColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    kasir: 'bg-blue-100 text-blue-700',
};

export default function AdminUsers({ users, outlets }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'kasir',
        outlet_id: '',
    });

    function openCreateForm() {
        reset();
        setEditingId(null);
        setShowForm(true);
    }

    function openEditForm(user: UserRow) {
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            outlet_id: user.outlet_id ? String(user.outlet_id) : '',
        });
        setEditingId(user.id);
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
            put(`/admin/users/${editingId}`, { onSuccess });
        } else {
            post('/admin/users', { onSuccess });
        }
    }

    function handleDelete(id: number) {
        setDeleteId(id);
    }

    function confirmDelete() {
        if (deleteId) {
            router.delete(`/admin/users/${deleteId}`);
            setDeleteId(null);
        }
    }

    return (
        <>
            <Head title="User" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">User</h1>
                    {!showForm && (
                        <button
                            onClick={openCreateForm}
                            className="flex items-center gap-2 rounded-lg bg-[#378add] px-4 py-2 text-sm font-medium text-white hover:bg-[#185fa5]"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah User
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
                                {editingId ? 'Edit User' : 'User Baru'}
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
                                <label className="mb-1 block text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Password {editingId && <span className="text-xs text-muted-foreground">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Role</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="kasir">Kasir</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Outlet {data.role === 'kasir' && <span className="text-red-500">*</span>}
                                </label>
                                <select
                                    value={data.outlet_id}
                                    onChange={(e) => setData('outlet_id', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="">
                                        {data.role === 'admin' ? 'Tidak terikat outlet' : 'Pilih outlet'}
                                    </option>
                                    {outlets.map((outlet) => (
                                        <option key={outlet.id} value={outlet.id}>
                                            {outlet.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.outlet_id && <p className="mt-1 text-xs text-red-600">{errors.outlet_id}</p>}
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
                    {users.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada user.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 pr-4 font-medium">Nama</th>
                                    <th className="pb-2 pr-4 font-medium">Email</th>
                                    <th className="pb-2 pr-4 font-medium">Role</th>
                                    <th className="pb-2 pr-4 font-medium">Outlet</th>
                                    <th className="pb-2 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b last:border-0">
                                        <td className="py-2.5 pr-4 font-medium">{user.name}</td>
                                        <td className="py-2.5 pr-4">{user.email}</td>
                                        <td className="py-2.5 pr-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleColor[user.role]}`}
                                            >
                                                {roleLabel[user.role]}
                                            </span>
                                        </td>
                                        <td className="py-2.5 pr-4">{user.outlet?.name ?? '-'}</td>
                                        <td className="py-2.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditForm(user)}
                                                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
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
                title="Hapus User"
                message="Yakin ingin menghapus user ini?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}