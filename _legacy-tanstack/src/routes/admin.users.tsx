import { createFileRoute } from "@tanstack/react-router";
import { UserCog } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — EPANAW BAGOBO" },
      { name: "description", content: "Manage learners and staff accounts." },
      { property: "og:title", content: "User Management — EPANAW BAGOBO" },
      { property: "og:description", content: "Manage learners and staff accounts." },
    ],
  }),
  component: () => (
    <PageStub title="User Management" description="Manage learners and staff accounts." icon={UserCog} />
  ),
});
