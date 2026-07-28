import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/storytelling-archive")({
  head: () => ({
    meta: [
      { title: "Storytelling Archive — EPANAW BAGOBO" },
      { name: "description", content: "Folk tales, myths, and oral history." },
      { property: "og:title", content: "Storytelling Archive — EPANAW BAGOBO" },
      { property: "og:description", content: "Folk tales, myths, and oral history." },
    ],
  }),
  component: () => (
    <PageStub title="Storytelling Archive" description="Folk tales, myths, and oral history." icon={ScrollText} />
  ),
});
