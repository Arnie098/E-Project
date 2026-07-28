import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback Management — EPANAW BAGOBO" },
      { name: "description", content: "Respond to learner feedback." },
      { property: "og:title", content: "Feedback Management — EPANAW BAGOBO" },
      { property: "og:description", content: "Respond to learner feedback." },
    ],
  }),
  component: () => (
    <PageStub title="Feedback Management" description="Respond to learner feedback." icon={MessageCircle} />
  ),
});
