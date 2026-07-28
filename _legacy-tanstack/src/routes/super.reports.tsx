import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — EPANAW BAGOBO" },
      { name: "description", content: "Platform-wide reporting." },
      { property: "og:title", content: "Reports & Analytics — EPANAW BAGOBO" },
      { property: "og:description", content: "Platform-wide reporting." },
    ],
  }),
  component: () => (
    <PageStub title="Reports & Analytics" description="Platform-wide reporting." icon={BarChart3} />
  ),
});
