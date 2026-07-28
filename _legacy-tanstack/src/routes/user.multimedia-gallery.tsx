import { createFileRoute } from "@tanstack/react-router";
import { Image } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/multimedia-gallery")({
  head: () => ({
    meta: [
      { title: "Multimedia Gallery — EPANAW BAGOBO" },
      { name: "description", content: "Photos, audio, and video of Bagobo heritage." },
      { property: "og:title", content: "Multimedia Gallery — EPANAW BAGOBO" },
      { property: "og:description", content: "Photos, audio, and video of Bagobo heritage." },
    ],
  }),
  component: () => (
    <PageStub title="Multimedia Gallery" description="Photos, audio, and video of Bagobo heritage." icon={Image} />
  ),
});
