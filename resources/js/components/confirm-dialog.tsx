import { AlertTriangle } from 'lucide-react';

type Props = {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-[#0f2a44]">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-100 p-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}