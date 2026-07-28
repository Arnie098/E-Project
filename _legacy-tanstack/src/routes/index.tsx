import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  Calendar,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/heritage-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EPANAW BAGOBO — Preserve. Revitalize. Inspire." },
      {
        name: "description",
        content:
          "A digital platform dedicated to preserving, promoting, and revitalizing the Bagobo Tagabawa language, traditions, stories, and cultural practices.",
      },
      { property: "og:title", content: "EPANAW BAGOBO — Bagobo Tagabawa Heritage" },
      {
        property: "og:description",
        content:
          "AI-integrated website for preserving and revitalizing the Bagobo Tagabawa dialect and cultural heritage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const nav = [
  { label: "Home", to: "/" as const },
  { label: "About", to: "/" as const },
  { label: "Learn", to: "/user" as const },
  { label: "Repository", to: "/user/cultural-repository" as const },
  { label: "About Us", to: "/" as const },
  { label: "Contact", to: "/" as const },
];


const features = [
  { icon: BookOpen, title: "Dictionary", desc: "Learn Bagobo Tagabawa words and their meanings.", href: "/user/vocabulary-dictionary" },
  { icon: Sparkles, title: "Learn", desc: "Interactive lessons and quizzes for every learner.", href: "/user/learning-modules" },
  { icon: Building2, title: "Repository", desc: "Explore stories, documents, images, audio, and more.", href: "/user/cultural-repository" },
  { icon: Users, title: "Community", desc: "Share knowledge and preserve together.", href: "/user/community-contributions" },
  { icon: Calendar, title: "Events", desc: "Join cultural events and celebrations.", href: "/user/events" },
  { icon: MessageSquare, title: "AI Assistant", desc: "Ask and learn with our AI-powered assistant.", href: "/user/ai-chatbot" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <nav className="ml-6 hidden items-center gap-6 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground [&.active]:underline [&.active]:underline-offset-8"
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-lg">
              <Link to="/auth">Log In</Link>
            </Button>
            <Button asChild className="rounded-lg">
              <Link to="/auth" search={{ mode: "register" }}>Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="min-w-0">
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Welcome to<br />EPANAW BAGOBO
            </h1>
            <p className="mt-6 text-lg font-medium text-foreground/80 sm:text-xl">
              Preserving the Bagobo Tagabawa Dialect and Cultural Heritage
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A digital platform dedicated to preserving, promoting, and revitalizing the
              Bagobo Tagabawa language, traditions, stories, and cultural practices for
              future generations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-lg px-6">
                <Link to="/auth" search={{ mode: "register" }}>Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg px-6">
                <Link to="/user/cultural-repository">Explore Repository</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="Traditional Bagobo bahay kubo among palm trees"
              width={1024}
              height={1024}
              className="h-[280px] w-full rounded-2xl object-cover sm:h-[380px] lg:h-[460px]"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Explore Our Heritage</h2>
          <p className="mt-2 text-muted-foreground">
            Discover and learn about our language, traditions, and culture.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-6">
          {features.map((f) => (
            <Link
              key={f.title}
              to={f.href}
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium">
            Together, let's preserve our heritage and inspire future generations.
          </p>
          <p className="mt-2 text-xs text-primary-foreground/70">
            © 2026 EPANAW BAGOBO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

