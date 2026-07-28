import { createFileRoute } from "@tanstack/react-router";
import { HardDriveDownload } from "lucide-react";
import { PageStub } from "@/components/page-stub";

export const Route = createFileRoute("/super/backup")({
  head: () => ({
    meta: [
      { title: "Backup & Restore — EPANAW BAGOBO" },
      { name: "description", content: "Snapshots and recovery." },
      { property: "og:title", content: "Backup & Restore — EPANAW BAGOBO" },
      { property: "og:description", content: "Snapshots and recovery." },
    ],
  }),
  component: () => (
    <PageStub title="Backup & Restore" description="Snapshots and recovery." icon={HardDriveDownload} />
  ),
});
