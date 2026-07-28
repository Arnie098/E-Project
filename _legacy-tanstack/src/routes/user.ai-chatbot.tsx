import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/ai-chatbot")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — EPANAW BAGOBO" },
      { name: "description", content: "Ask questions in Bagobo Tagabawa and English." },
      { property: "og:title", content: "AI Chatbot — EPANAW BAGOBO" },
      { property: "og:description", content: "Ask questions in Bagobo Tagabawa and English." },
    ],
  }),
  component: () => (
    <PageStub title="AI Chatbot" description="Ask questions in Bagobo Tagabawa and English." icon={MessageSquare} />
  ),
});
