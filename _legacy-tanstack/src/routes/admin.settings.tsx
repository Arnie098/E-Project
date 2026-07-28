import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "System Settings — EPANAW BAGOBO" },
      { name: "description", content: "General configuration." },
      { property: "og:title", content: "System Settings — EPANAW BAGOBO" },
      { property: "og:description", content: "General configuration." },
    ],
  }),
  component: () => (
    <PageStub title="System Settings" description="General configuration." icon={Settings} />
  ),
});
