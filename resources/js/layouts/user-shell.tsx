import { type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { DashboardLayout, type DashboardUser } from '@/components/dashboard-layout';
import { userNav } from '@/components/dashboard-nav';
import { FloatingAiChat } from '@/components/floating-ai-chat';
import type { SharedData } from '@/types';

const roleLabel: Record<string, string> = { learner: 'Learner', admin: 'Admin', super: 'Super Admin' };

export function useCurrentUser(): DashboardUser {
    const user = usePage<SharedData>().props.auth.user;
    return {
        name: user.name,
        role: roleLabel[(user.role as string) ?? 'learner'] ?? 'Learner',
        avatar: (user.avatar_path as string | undefined) ?? undefined,
    };
}

export default function UserShell({ children }: { children: ReactNode }) {
    return (
        <DashboardLayout title="Learner Dashboard" nav={userNav} user={useCurrentUser()} showSearch notifications={3}>
            {children}
            <FloatingAiChat />
        </DashboardLayout>
    );
}
