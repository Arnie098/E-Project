import { type ReactNode } from 'react';
import { SidebarDashboardLayout } from '@/components/sidebar-dashboard-layout';
import { adminNav } from '@/components/dashboard-nav';
import { useCurrentUser } from '@/layouts/user-shell';

export default function AdminShell({ children }: { children: ReactNode }) {
    return (
        <SidebarDashboardLayout title="Admin Dashboard" nav={adminNav} user={useCurrentUser()} notifications={5}>
            {children}
        </SidebarDashboardLayout>
    );
}
