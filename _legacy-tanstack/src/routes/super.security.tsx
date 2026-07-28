import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/security")({
  head: () => ({
    meta: [
      { title: "Security Management — EPANAW BAGOBO" },
      { name: "description", content: "Threats, scans, and access reviews." },
      { property: "og:title", content: "Security Management — EPANAW BAGOBO" },
      { property: "og:description", content: "Threats, scans, and access reviews." },
    ],
  }),
  component: () => (
    <PageStub title="Security Management" description="Threats, scans, and access reviews." icon={ShieldCheck} />
  ),
});
