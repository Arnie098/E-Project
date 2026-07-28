import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/admin/learning-materials")({
  head: () => ({
    meta: [
      { title: "Learning Materials — EPANAW BAGOBO" },
      { name: "description", content: "Create and manage modules and quizzes." },
      { property: "og:title", content: "Learning Materials — EPANAW BAGOBO" },
      { property: "og:description", content: "Create and manage modules and quizzes." },
    ],
  }),
  component: () => (
    <PageStub title="Learning Materials" description="Create and manage modules and quizzes." icon={BookOpen} />
  ),
});
