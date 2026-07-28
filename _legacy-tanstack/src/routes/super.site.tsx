import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/site")({
  head: () => ({
    meta: [
      { title: "Site Configuration — EPANAW BAGOBO" },
      { name: "description", content: "Domain, branding, and public site." },
      { property: "og:title", content: "Site Configuration — EPANAW BAGOBO" },
      { property: "og:description", content: "Domain, branding, and public site." },
    ],
  }),
  component: () => (
    <PageStub title="Site Configuration" description="Domain, branding, and public site." icon={Globe} />
  ),
});
