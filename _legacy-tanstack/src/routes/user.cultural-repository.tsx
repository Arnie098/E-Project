import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/cultural-repository")({
  head: () => ({
    meta: [
      { title: "Cultural Repository — EPANAW BAGOBO" },
      { name: "description", content: "Explore stories, documents, images, and audio." },
      { property: "og:title", content: "Cultural Repository — EPANAW BAGOBO" },
      { property: "og:description", content: "Explore stories, documents, images, and audio." },
    ],
  }),
  component: () => (
    <PageStub title="Cultural Repository" description="Explore stories, documents, images, and audio." icon={Building2} />
  ),
});
