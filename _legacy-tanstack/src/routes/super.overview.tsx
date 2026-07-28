import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/overview")({
  head: () => ({
    meta: [
      { title: "System Overview — EPANAW BAGOBO" },
      { name: "description", content: "Health, uptime, and performance metrics." },
      { property: "og:title", content: "System Overview — EPANAW BAGOBO" },
      { property: "og:description", content: "Health, uptime, and performance metrics." },
    ],
  }),
  component: () => (
    <PageStub title="System Overview" description="Health, uptime, and performance metrics." icon={Activity} />
  ),
});
