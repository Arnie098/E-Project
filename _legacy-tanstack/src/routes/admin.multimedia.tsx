import { createFileRoute } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/multimedia")({
  head: () => ({
    meta: [
      { title: "Multimedia Management — EPANAW BAGOBO" },
      { name: "description", content: "Manage photos, audio, and video." },
      { property: "og:title", content: "Multimedia Management — EPANAW BAGOBO" },
      { property: "og:description", content: "Manage photos, audio, and video." },
    ],
  }),
  component: () => (
    <PageStub title="Multimedia Management" description="Manage photos, audio, and video." icon={Film} />
  ),
});
