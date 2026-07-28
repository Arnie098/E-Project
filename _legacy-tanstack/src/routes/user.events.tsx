import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/user/events")({
  head: () => ({
    meta: [
      { title: "Events — EPANAW BAGOBO" },
      { name: "description", content: "Upcoming cultural events and workshops." },
      { property: "og:title", content: "Events — EPANAW BAGOBO" },
      { property: "og:description", content: "Upcoming cultural events and workshops." },
    ],
  }),
  component: () => (
    <PageStub title="Events" description="Upcoming cultural events and workshops." icon={Calendar} />
  ),
});
