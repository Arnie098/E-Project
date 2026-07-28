import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { userNav } from "@/components/dashboard-nav";

export const Route = createFileRoute("/user")({
  component: UserLayout,
});

function UserLayout() {
  return (
    <DashboardLayout
      title="Learner Dashboard"
      nav={userNav}
      user={{ name: "Juan Dela Cruz", role: "Learner" }}
      showSearch
      notifications={3}
    >
      <Outlet />
    </DashboardLayout>
  );
}
