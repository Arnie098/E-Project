import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/settings")({
  head: () => ({
    meta: [
      { title: "Settings — EPANAW BAGOBO" },
      { name: "description", content: "Account and preferences." },
      { property: "og:title", content: "Settings — EPANAW BAGOBO" },
      { property: "og:description", content: "Account and preferences." },
    ],
  }),
  component: () => (
    <PageStub title="Settings" description="Account and preferences." icon={Settings} />
  ),
});
