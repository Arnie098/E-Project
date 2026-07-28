import { type ReactNode } from 'react';
import { SidebarDashboardLayout } from '@/components/sidebar-dashboard-layout';
import { superNav } from '@/components/dashboard-nav';
import { useCurrentUser } from '@/layouts/user-shell';

export default function SuperShell({ children }: { children: ReactNode }) {
    const user = useCurrentUser();
    return (
        <SidebarDashboardLayout
            title="Super Admin Dashboard"
            nav={superNav}
            user={{ ...user, role: 'Super Administrator' }}
            notifications={8}
        >
            {children}
        </SidebarDashboardLayout>
    );
}
