import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — EPANAW BAGOBO" },
      { name: "description", content: "Engagement and content performance." },
      { property: "og:title", content: "Reports & Analytics — EPANAW BAGOBO" },
      { property: "og:description", content: "Engagement and content performance." },
    ],
  }),
  component: () => (
    <PageStub title="Reports & Analytics" description="Engagement and content performance." icon={BarChart3} />
  ),
});
