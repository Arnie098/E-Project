import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — EPANAW BAGOBO" },
      { name: "description", content: "Send suggestions and report issues." },
      { property: "og:title", content: "Feedback — EPANAW BAGOBO" },
      { property: "og:description", content: "Send suggestions and report issues." },
    ],
  }),
  component: () => (
    <PageStub title="Feedback" description="Send suggestions and report issues." icon={MessageCircle} />
  ),
});
