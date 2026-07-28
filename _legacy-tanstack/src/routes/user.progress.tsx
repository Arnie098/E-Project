import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — EPANAW BAGOBO" },
      { name: "description", content: "Track your learning journey." },
      { property: "og:title", content: "My Progress — EPANAW BAGOBO" },
      { property: "og:description", content: "Track your learning journey." },
    ],
  }),
  component: () => (
    <PageStub title="My Progress" description="Track your learning journey." icon={BarChart3} />
  ),
});
