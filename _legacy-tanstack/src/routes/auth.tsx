import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import heroImg from "@/assets/heritage-hero.jpg";

const search = z.object({ mode: z.enum(["login", "register"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Sign In — EPANAW BAGOBO" },
      { name: "description", content: "Log in or register to learn, contribute, and explore the Bagobo Tagabawa cultural heritage." },
      { property: "og:title", content: "Sign In — EPANAW BAGOBO" },
      { property: "og:description", content: "Access learning modules, cultural repository, and community tools." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState(mode === "register" ? "register" : "login");
  const [role, setRole] = useState<"user" | "admin" | "super">("user");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const to = role === "super" ? "/super" : role === "admin" ? "/admin" : "/user";
    navigate({ to });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/60 mix-blend-multiply" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <BrandLogo invert />
          <div>
            <h2 className="text-3xl font-bold">Preserve. Revitalize. Inspire.</h2>
            <p className="mt-3 max-w-md text-primary-foreground/80">
              Join the community keeping the Bagobo Tagabawa language and culture alive for the next generation.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-6 sm:p-10">
        <Link to="/" className="mb-8 inline-flex">
          <BrandLogo />
        </Link>
        <div className="mx-auto w-full max-w-md flex-1">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your journey.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required placeholder="••••••••" />
                </div>
                <RoleSwitcher role={role} setRole={setRole} />
                <Button type="submit" className="w-full">Sign In</Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Learn, contribute, and preserve.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="first">First name</Label>
                    <Input id="first" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last">Last name</Label>
                    <Input id="last" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remail">Email</Label>
                  <Input id="remail" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rpass">Password</Label>
                  <Input id="rpass" type="password" required />
                </div>
                <RoleSwitcher role={role} setRole={setRole} />
                <Button type="submit" className="w-full">Create account</Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo mode: pick a role above to preview each dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleSwitcher({
  role,
  setRole,
}: {
  role: "user" | "admin" | "super";
  setRole: (r: "user" | "admin" | "super") => void;
}) {
  const opts: Array<{ id: "user" | "admin" | "super"; label: string }> = [
    { id: "user", label: "Learner" },
    { id: "admin", label: "Admin" },
    { id: "super", label: "Super Admin" },
  ];
  return (
    <div className="space-y-2">
      <Label>Sign in as (demo)</Label>
      <div className="grid grid-cols-3 gap-2">
        {opts.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setRole(o.id)}
            className={
              "rounded-md border px-3 py-2 text-xs font-medium transition-colors " +
              (role === o.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
