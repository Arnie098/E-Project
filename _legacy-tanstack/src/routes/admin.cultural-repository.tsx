import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/cultural-repository")({
  head: () => ({
    meta: [
      { title: "Cultural Repository — EPANAW BAGOBO" },
      { name: "description", content: "Curate cultural resources." },
      { property: "og:title", content: "Cultural Repository — EPANAW BAGOBO" },
      { property: "og:description", content: "Curate cultural resources." },
    ],
  }),
  component: () => (
    <PageStub title="Cultural Repository" description="Curate cultural resources." icon={Building2} />
  ),
});
