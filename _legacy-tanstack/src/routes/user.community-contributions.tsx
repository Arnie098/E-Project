import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/community-contributions")({
  head: () => ({
    meta: [
      { title: "Community Contributions — EPANAW BAGOBO" },
      { name: "description", content: "Share your knowledge with the community." },
      { property: "og:title", content: "Community Contributions — EPANAW BAGOBO" },
      { property: "og:description", content: "Share your knowledge with the community." },
    ],
  }),
  component: () => (
    <PageStub title="Community Contributions" description="Share your knowledge with the community." icon={Users} />
  ),
});
