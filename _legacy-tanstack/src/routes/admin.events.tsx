import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/events")({
  head: () => ({
    meta: [
      { title: "Events Management — EPANAW BAGOBO" },
      { name: "description", content: "Create and schedule cultural events." },
      { property: "og:title", content: "Events Management — EPANAW BAGOBO" },
      { property: "og:description", content: "Create and schedule cultural events." },
    ],
  }),
  component: () => (
    <PageStub title="Events Management" description="Create and schedule cultural events." icon={Calendar} />
  ),
});
