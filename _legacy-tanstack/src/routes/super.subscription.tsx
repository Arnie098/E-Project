import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription Management — EPANAW BAGOBO" },
      { name: "description", content: "Plans and billing." },
      { property: "og:title", content: "Subscription Management — EPANAW BAGOBO" },
      { property: "og:description", content: "Plans and billing." },
    ],
  }),
  component: () => (
    <PageStub title="Subscription Management" description="Plans and billing." icon={CreditCard} />
  ),
});
