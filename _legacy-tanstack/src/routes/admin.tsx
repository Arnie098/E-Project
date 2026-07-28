import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { adminNav } from "@/components/dashboard-nav";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <DashboardLayout
      title="Admin Dashboard"
      nav={adminNav}
      user={{ name: "Maria Santos", role: "Administrator" }}
      notifications={5}
    >
      <Outlet />
    </DashboardLayout>
  );
}
