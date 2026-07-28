import { Head, Link, usePage } from '@inertiajs/react';
import { Book, Building2, Calendar, MessageSquare, Sparkles, Users } from 'lucide-react';
import { PublicLayout } from '@/components/public-layout';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import heroImg from '@/assets/heritage-hero.jpg';

const features = [
    { icon: Book, title: 'Dictionary', desc: 'Learn Bagobo Tagabawa words and their meanings.', href: '/login' },
    { icon: Sparkles, title: 'Learn', desc: 'Interactive lessons and quizzes for every learner.', href: '/login' },
    { icon: Building2, title: 'Repository', desc: 'Explore stories, documents, images, audio, and more.', href: '/login' },
    { icon: Users, title: 'Community', desc: 'Share knowledge and preserve together.', href: '/login' },
    { icon: Calendar, title: 'Events', desc: 'Join cultural events and celebrations.', href: '/login' },
    { icon: MessageSquare, title: 'AI Assistant', desc: 'Ask and learn with our AI-powered assistant.', href: '/login' },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const startHref = auth?.user ? '/user' : '/register';

    return (
        <PublicLayout>
            <Head title="EPANAW BAGOBO — Preserve. Revitalize. Inspire.">
                <meta
                    name="description"
                    content="A digital platform dedicated to preserving, promoting, and revitalizing the Bagobo Tagabawa language, traditions, stories, and cultural practices."
                />
            </Head>

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-border">
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
                    <div className="min-w-0">
                        <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Welcome to
                            <br />
                            EPANAW BAGOBO
                        </h1>
                        <p className="mt-6 text-lg font-medium text-foreground/80 sm:text-xl">
                            Preserving the Bagobo Tagabawa Dialect and Cultural Heritage
                        </p>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            A digital platform dedicated to preserving, promoting, and revitalizing the Bagobo Tagabawa language, traditions,
                            stories, and cultural practices for future generations.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild size="lg" className="rounded-lg px-6">
                                <Link href={startHref}>Get Started</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-lg px-6">
                                <Link href="/login">Explore Repository</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src={heroImg}
                            alt="Traditional Bagobo bahay kubo among palm trees"
                            className="h-[280px] w-full rounded-2xl object-cover sm:h-[380px] lg:h-[460px]"
                        />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Explore Our Heritage</h2>
                    <p className="mt-2 text-muted-foreground">Discover and learn about our language, traditions, and culture.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-6">
                    {features.map((f) => (
                        <Link
                            key={f.title}
                            href={f.href}
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
        </PublicLayout>
    );
}
