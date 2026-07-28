import { createFileRoute } from "@tanstack/react-router";
import { UserCog } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/users")({
  head: () => ({
    meta: [
      { title: "User Management — EPANAW BAGOBO" },
      { name: "description", content: "All accounts across the platform." },
      { property: "og:title", content: "User Management — EPANAW BAGOBO" },
      { property: "og:description", content: "All accounts across the platform." },
    ],
  }),
  component: () => (
    <PageStub title="User Management" description="All accounts across the platform." icon={UserCog} />
  ),
});
