import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  BookOpen,
  Building2,
  MessageCircle,
  ShieldCheck,
  Activity,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import { SummaryTiles, WelcomeHero, PanelCard, type SummaryTile } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/heritage-hero.jpg";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — EPANAW BAGOBO" },
      { name: "description", content: "Manage learning materials, repository, users, and community contributions." },
      { property: "og:title", content: "EPANAW BAGOBO Admin Dashboard" },
      { property: "og:description", content: "Oversee content moderation, users, and analytics." },
    ],
  }),
  component: AdminDashboard,
});

const tiles: SummaryTile[] = [
  { label: "Active Learners", value: "1,160", cta: "Manage Users", tone: "blue", icon: Users, href: "/admin/users" },
  { label: "Learning Materials", value: "325", cta: "Manage Materials", tone: "green", icon: BookOpen, href: "/admin/learning-materials" },
  { label: "Repository Items", value: "892", cta: "Manage Repository", tone: "purple", icon: Building2, href: "/admin/cultural-repository" },
  { label: "Pending Reviews", value: "42", cta: "Review Now", tone: "amber", icon: ShieldCheck, href: "/admin/contributions" },
  { label: "Feedback", value: "128", cta: "View Feedback", tone: "rose", icon: MessageCircle, href: "/admin/feedback" },
];

const contributions = [
  { user: "Ana Reyes", item: "Bagobo weaving story", type: "Story", status: "Pending" },
  { user: "Mark Lim", item: "Pronunciation audio: 'Salamat'", type: "Audio", status: "Pending" },
  { user: "Liza Cruz", item: "Traditional attire photo", type: "Image", status: "Approved" },
  { user: "Jose P.", item: "Folk tale transcript", type: "Text", status: "Pending" },
];

function AdminDashboard() {
  return (
    <>
      <WelcomeHero
        greeting="Welcome back, Maria!"
        subtitle="Curate learning materials, moderate contributions, and support the community."
        image={heroImg}
      />
      <SummaryTiles tiles={tiles} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PanelCard
          title="Pending Contributions"
          className="xl:col-span-2"
          action={<Link to="/admin/contributions" className="text-xs font-semibold text-foreground hover:underline">View All</Link>}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 font-medium">Contributor</th>
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{c.user}</td>
                    <td className="py-3 text-muted-foreground">{c.item}</td>
                    <td className="py-3 text-muted-foreground">{c.type}</td>
                    <td className="py-3">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold " +
                          (c.status === "Approved"
                            ? "bg-tile-green text-foreground"
                            : "bg-tile-amber text-foreground")
                        }
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm">Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard title="Recent Activity">
            <ul className="space-y-3 text-sm">
              {[
                "New learning material published: 'Bagobo Traditions'",
                "5 new registrations today",
                "Weekly report generated",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-foreground">{t}</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                </li>
              ))}
            </ul>
          </PanelCard>

          <PanelCard title="Upcoming Events" action={<Link to="/admin/events" className="text-xs font-semibold text-foreground hover:underline">Manage</Link>}>
            <ul className="space-y-3">
              {[
                { title: "Cultural Storytelling Session", when: "May 25, 2025" },
                { title: "Language Workshop", when: "June 5, 2025" },
              ].map((e) => (
                <li key={e.title} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.when}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </PanelCard>
        </div>
      </div>
    </>
  );
}
