import { createFileRoute } from "@tanstack/react-router";
import { Book } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/vocabulary-dictionary")({
  head: () => ({
    meta: [
      { title: "Vocabulary Dictionary — EPANAW BAGOBO" },
      { name: "description", content: "Words, meanings, and pronunciations." },
      { property: "og:title", content: "Vocabulary Dictionary — EPANAW BAGOBO" },
      { property: "og:description", content: "Words, meanings, and pronunciations." },
    ],
  }),
  component: () => (
    <PageStub title="Vocabulary Dictionary" description="Words, meanings, and pronunciations." icon={Book} />
  ),
});
