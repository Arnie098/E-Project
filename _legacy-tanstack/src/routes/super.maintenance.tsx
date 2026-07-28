import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance — EPANAW BAGOBO" },
      { name: "description", content: "Scheduled downtime and tasks." },
      { property: "og:title", content: "Maintenance — EPANAW BAGOBO" },
      { property: "og:description", content: "Scheduled downtime and tasks." },
    ],
  }),
  component: () => (
    <PageStub title="Maintenance" description="Scheduled downtime and tasks." icon={Wrench} />
  ),
});
