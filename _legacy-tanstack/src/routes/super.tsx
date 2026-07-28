import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { superNav } from "@/components/dashboard-nav";

export const Route = createFileRoute("/super")({
  component: SuperLayout,
});

function SuperLayout() {
  return (
    <DashboardLayout
      title="Super Admin Dashboard"
      nav={superNav}
      user={{ name: "Super Admin", role: "Super Administrator" }}
      notifications={8}
    >
      <Outlet />
    </DashboardLayout>
  );
}
