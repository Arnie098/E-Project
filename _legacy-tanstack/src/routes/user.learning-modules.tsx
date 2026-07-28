import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/learning-modules")({
  head: () => ({
    meta: [
      { title: "Learning Modules — EPANAW BAGOBO" },
      { name: "description", content: "Interactive lessons and quizzes." },
      { property: "og:title", content: "Learning Modules — EPANAW BAGOBO" },
      { property: "og:description", content: "Interactive lessons and quizzes." },
    ],
  }),
  component: () => (
    <PageStub title="Learning Modules" description="Interactive lessons and quizzes." icon={BookOpen} />
  ),
});
