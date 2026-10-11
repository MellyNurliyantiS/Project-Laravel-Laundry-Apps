import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type FlashProps = {
    success?: string;
    error?: string;
};

export function FlashToast() {
    useEffect(() => {
        return router.on('success', (event) => {
            const flash = event.detail.page.props.flash as FlashProps | undefined;

            if (flash?.success) {
                toast.success(flash.success);
            }
            if (flash?.error) {
                toast.error(flash.error);
            }
        });
    }, []);

    return null;
}