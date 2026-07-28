import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/roles")({
  head: () => ({
    meta: [
      { title: "Role & Permission Management — EPANAW BAGOBO" },
      { name: "description", content: "RBAC for Super Admin, Admin, and Users." },
      { property: "og:title", content: "Role & Permission Management — EPANAW BAGOBO" },
      { property: "og:description", content: "RBAC for Super Admin, Admin, and Users." },
    ],
  }),
  component: () => (
    <PageStub title="Role & Permission Management" description="RBAC for Super Admin, Admin, and Users." icon={ShieldCheck} />
  ),
});
