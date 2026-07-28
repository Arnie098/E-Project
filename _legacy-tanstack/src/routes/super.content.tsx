import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/content")({
  head: () => ({
    meta: [
      { title: "Content Management — EPANAW BAGOBO" },
      { name: "description", content: "Cross-module content oversight." },
      { property: "og:title", content: "Content Management — EPANAW BAGOBO" },
      { property: "og:description", content: "Cross-module content oversight." },
    ],
  }),
  component: () => (
    <PageStub title="Content Management" description="Cross-module content oversight." icon={FolderKanban} />
  ),
});
