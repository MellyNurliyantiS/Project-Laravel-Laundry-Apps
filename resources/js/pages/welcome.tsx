import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, CalendarClock, LayoutDashboard } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props as unknown as SharedData;

    return (
        <>
            <Head title="Laundry Kilat" />
            <div className="relative min-h-screen overflow-hidden bg-[#eaf3fc] dark:bg-[#0a1a2b]">
                {/* Bubbles */}
                <div className="pointer-events-none absolute top-5 right-16 h-20 w-20 rounded-full bg-white/50" />
                <div className="pointer-events-none absolute top-28 right-6 h-10 w-10 rounded-full bg-white/40" />
                <div className="pointer-events-none absolute bottom-10 left-10 h-8 w-8 rounded-full bg-white/40" />
                <div className="pointer-events-none absolute bottom-24 left-28 h-14 w-14 rounded-full bg-white/30" />

                <div className="relative z-10 mx-auto max-w-5xl px-6 py-8 lg:px-8">
                    {/* Header */}
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xl font-semibold text-[#0c447c] dark:text-[#85b7eb]">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#378add]" />
                            Laundry Kilat
                        </div>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-lg bg-[#378add] px-5 py-2 text-sm font-medium text-white hover:bg-[#185fa5]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-lg border border-[#85b7eb] px-5 py-2 text-sm font-medium text-[#0c447c] hover:bg-white/40 dark:text-[#85b7eb]"
                                    >
                                        Masuk
                                    </Link>
                                    
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Hero */}
                    <main className="mt-20 max-w-md">
                        <h1 className="text-4xl font-semibold text-[#042c53] dark:text-white">
                        Satu Sistem untuk Semua Cabang Laundry Anda
                            </h1>
                            <p className="mt-3 text-base leading-relaxed text-[#185fa5] dark:text-[#b5d4f4]">
                                Pantau transaksi, kelola kasir, dan analisis laporan bisnis secara
                                real-time dari mana saja.
                            </p>

                        {!auth.user && (
                            <Link
                                href="/register"
                                className="mt-6 inline-block rounded-lg bg-[#0c447c] px-7 py-3 text-sm font-medium text-white hover:bg-[#042c53]"
                            >
                                Daftar Sekarang
                            </Link>
                        )}
                    </main>

                    {/* Feature cards */}
                    <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                            <Building2 className="h-6 w-6 text-[#378add]" />
                            <p className="mt-2 text-sm text-[#5f5e5a] dark:text-[#b5d4f4]">Multi outlet</p>
                        </div>
                        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                            <LayoutDashboard className="h-6 w-6 text-[#378add]" />
                            <p className="mt-2 text-sm text-[#5f5e5a] dark:text-[#b5d4f4]">Kasir cepat</p>
                        </div>
                        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#0f2a44]">
                            <CalendarClock className="h-6 w-6 text-[#378add]" />
                            <p className="mt-2 text-sm text-[#5f5e5a] dark:text-[#b5d4f4]">Laporan real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}