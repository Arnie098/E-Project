import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  Book,
  MessageSquare,
  ArrowRight,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import { PanelCard, WelcomeHero } from "@/components/dashboard-layout";
import heroImg from "@/assets/heritage-hero.jpg";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/user/")({
  head: () => ({
    meta: [
      { title: "Dashboard — EPANAW BAGOBO Learner" },
      { name: "description", content: "Continue learning the Bagobo Tagabawa language and culture." },
      { property: "og:title", content: "EPANAW BAGOBO Learner Dashboard" },
      { property: "og:description", content: "Modules, repository, dictionary, and cultural events." },
    ],
  }),
  component: UserDashboard,
});

const quick = [
  { icon: BookOpen, title: "Learning Modules", cta: "Continue Learning", href: "/user/learning-modules" },
  { icon: Building2, title: "Cultural Repository", cta: "Explore Heritage", href: "/user/cultural-repository" },
  { icon: Book, title: "Vocabulary Dictionary", cta: "Expand Vocabulary", href: "/user/vocabulary-dictionary" },
  { icon: MessageSquare, title: "AI Chatbot", cta: "Ask Anything", href: "/user/ai-chatbot" },
];

const continueLearning = [
  { title: "Introduction to Bagobo Tagabawa Culture", progress: 75 },
  { title: "Basic Bagobo Tagabawa Vocabulary", progress: 60 },
  { title: "Traditional Practices and Beliefs", progress: 40 },
];

function UserDashboard() {
  return (
    <>
      <WelcomeHero
        greeting="Welcome back, Juan!"
        subtitle="Continue your journey in preserving and learning the Bagobo Tagabawa language and culture."
        image={heroImg}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <PanelCard title="Quick Access">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {quick.map((q) => (
                <Link
                  key={q.title}
                  to={q.href}
                  className="group rounded-xl border border-border p-4 transition-colors hover:bg-accent"
                >
                  <q.icon className="h-6 w-6 text-foreground" />
                  <div className="mt-4 text-sm font-semibold text-foreground">{q.title}</div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    {q.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </PanelCard>

          <PanelCard
            title="Continue Learning"
            action={<Link to="/user/learning-modules" className="text-xs font-semibold text-foreground hover:underline">View All</Link>}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {continueLearning.map((c) => (
                <div key={c.title} className="overflow-hidden rounded-xl border border-border">
                  <div className="h-32 w-full bg-muted">
                    <img src={heroImg} alt="" className="h-full w-full object-cover grayscale" />
                  </div>
                  <div className="p-3">
                    <div className="line-clamp-2 min-h-10 text-sm font-semibold text-foreground">{c.title}</div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <Progress value={c.progress} className="h-1.5 flex-1" />
                      <span className="ml-2 font-semibold text-foreground">{c.progress}%</span>
                    </div>
                    <Link to="/user/learning-modules" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline">
                      Continue Lesson <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard
            title="Recent Activity"
            action={<Link to="/user/progress" className="text-xs font-semibold text-foreground hover:underline">View All</Link>}
          >
            <ul className="space-y-3 text-sm">
              {[
                'You completed the lesson "Greetings and Common Phrases"',
                'New vocabulary added: "Kasili" — friend',
                'You earned the "Culture Explorer" badge',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-foreground">{t}</div>
                    <div className="text-xs text-muted-foreground">May 20, 2025 · 9:30 AM</div>
                  </div>
                </li>
              ))}
            </ul>
          </PanelCard>
        </div>

        <div className="space-y-6">
          <PanelCard title="Learning Progress" action={<Link to="/user/progress" className="text-xs font-semibold text-foreground hover:underline">View All</Link>}>
            <div className="flex items-center gap-6">
              <ProgressRing value={65} />
              <ul className="flex-1 space-y-3 text-sm">
                <li className="flex items-center justify-between"><span className="text-muted-foreground">Modules Completed</span><span className="font-semibold text-foreground">13 / 20</span></li>
                <li className="flex items-center justify-between"><span className="text-muted-foreground">Quizzes Taken</span><span className="font-semibold text-foreground">8 / 15</span></li>
                <li className="flex items-center justify-between"><span className="text-muted-foreground">Hours Spent</span><span className="font-semibold text-foreground">24h 30m</span></li>
              </ul>
            </div>
          </PanelCard>

          <PanelCard title="Upcoming Events" action={<Link to="/user/events" className="text-xs font-semibold text-foreground hover:underline">View All</Link>}>
            <ul className="space-y-3">
              {[
                { title: "Cultural Storytelling Session", when: "May 25, 2025 · 2:00 PM" },
                { title: "Language Workshop", when: "June 5, 2025 · 10:00 AM" },
              ].map((e) => (
                <li key={e.title} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.when}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </PanelCard>

          <PanelCard title="Latest Announcements" action={<span className="text-xs font-semibold text-foreground">View All</span>}>
            <div className="rounded-lg bg-secondary p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">Welcome to EPANAW BAGOBO!</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Explore, learn, and contribute to preserve our heritage.
                  </p>
                  <div className="mt-2 text-[11px] text-muted-foreground">May 18, 2025</div>
                </div>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} className="fill-none stroke-secondary" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          className="fill-none stroke-primary"
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{value}%</div>
          <div className="text-[10px] text-muted-foreground">Overall Progress</div>
        </div>
      </div>
    </div>
  );
}
