import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/contributions")({
  head: () => ({
    meta: [
      { title: "Community Contributions — EPANAW BAGOBO" },
      { name: "description", content: "Review and approve submissions." },
      { property: "og:title", content: "Community Contributions — EPANAW BAGOBO" },
      { property: "og:description", content: "Review and approve submissions." },
    ],
  }),
  component: () => (
    <PageStub title="Community Contributions" description="Review and approve submissions." icon={Users} />
  ),
});
