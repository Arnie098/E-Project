import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/logs")({
  head: () => ({
    meta: [
      { title: "Activity Logs — EPANAW BAGOBO" },
      { name: "description", content: "Audit trail of all system activity." },
      { property: "og:title", content: "Activity Logs — EPANAW BAGOBO" },
      { property: "og:description", content: "Audit trail of all system activity." },
    ],
  }),
  component: () => (
    <PageStub title="Activity Logs" description="Audit trail of all system activity." icon={FileText} />
  ),
});
