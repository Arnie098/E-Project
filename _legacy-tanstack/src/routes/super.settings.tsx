import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/settings")({
  head: () => ({
    meta: [
      { title: "System Settings — EPANAW BAGOBO" },
      { name: "description", content: "Global configuration." },
      { property: "og:title", content: "System Settings — EPANAW BAGOBO" },
      { property: "og:description", content: "Global configuration." },
    ],
  }),
  component: () => (
    <PageStub title="System Settings" description="Global configuration." icon={Settings} />
  ),
});
