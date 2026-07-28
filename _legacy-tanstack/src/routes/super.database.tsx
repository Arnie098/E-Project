import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/database")({
  head: () => ({
    meta: [
      { title: "Database Management — EPANAW BAGOBO" },
      { name: "description", content: "Schema, tables, and integrity checks." },
      { property: "og:title", content: "Database Management — EPANAW BAGOBO" },
      { property: "og:description", content: "Schema, tables, and integrity checks." },
    ],
  }),
  component: () => (
    <PageStub title="Database Management" description="Schema, tables, and integrity checks." icon={Database} />
  ),
});
