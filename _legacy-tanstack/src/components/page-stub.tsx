import { PanelCard } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

export interface PageStubProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: { label: string; primary?: boolean }[];
  sections?: { title: string; body: string }[];
}

export function PageStub({
  title,
  description,
  icon: Icon = Sparkles,
  actions = [{ label: "New", primary: true }, { label: "Export" }],
  sections = [],
}: PageStubProps) {
  return (
    <>
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
            <p className="truncate text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {actions.map((a) => (
            <Button key={a.label} variant={a.primary ? "default" : "outline"} size="sm">
              {a.label}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PanelCard title="Overview" className="lg:col-span-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This module is part of the EPANAW BAGOBO framework for preserving and revitalizing the
            Bagobo Tagabawa dialect and cultural heritage. Use this space to manage {title.toLowerCase()}
            {" "}with the same look and feel as the rest of the dashboard.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {["Total", "This Month", "This Week"].map((s, i) => (
              <div key={s} className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground">{s}</div>
                <div className="mt-1 text-2xl font-bold text-foreground">{[128, 24, 6][i]}</div>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Quick Info">
          <ul className="space-y-3 text-sm">
            {[
              "Role-based access control",
              "Culturally respectful moderation",
              "Audit-logged actions",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </PanelCard>

        {sections.map((s) => (
          <PanelCard key={s.title} title={s.title} className="lg:col-span-3">
            <p className="text-sm text-muted-foreground">{s.body}</p>
          </PanelCard>
        ))}

        <PanelCard title="Recent Items" className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">Category</th>
                  <th className="py-2 font-medium">Updated</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Sample entry A", cat: "General", when: "2h ago", status: "Active" },
                  { name: "Sample entry B", cat: "Cultural", when: "Yesterday", status: "Pending" },
                  { name: "Sample entry C", cat: "Language", when: "3d ago", status: "Active" },
                ].map((r) => (
                  <tr key={r.name} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{r.name}</td>
                    <td className="py-3 text-muted-foreground">{r.cat}</td>
                    <td className="py-3 text-muted-foreground">{r.when}</td>
                    <td className="py-3">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold " +
                          (r.status === "Active" ? "bg-tile-green" : "bg-tile-amber")
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm">Open</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>
    </>
  );
}
