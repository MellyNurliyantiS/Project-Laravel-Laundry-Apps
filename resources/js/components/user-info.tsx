import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

const roleLabel: Record<string, string> = {
    admin: 'Admin',
    kasir: 'Kasir',
};

const roleColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    kasir: 'bg-blue-100 text-blue-700',
};

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const role = user.role as string | undefined;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{user.name}</span>
                    {role && (
                        <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${roleColor[role] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                            {roleLabel[role] ?? role}
                        </span>
                    )}
                </div>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}