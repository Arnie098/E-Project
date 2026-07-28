import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, LoaderCircle, Mail, User, UserPlus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { PublicLayout } from '@/components/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import heroImg from '@/assets/heritage-hero.jpg';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <PublicLayout>
            <Head title="Register" />
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-2">
                    <BrandPanel />

                    {/* Right form */}
                    <div className="p-8 sm:p-10 lg:p-12">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an Account</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Join us in preserving and revitalizing our heritage.</p>
                        </div>

                        <form className="mt-8 space-y-5" onSubmit={submit}>
                            <Field label="Full Name" error={errors.name}>
                                <User className="field-icon" />
                                <Input
                                    id="name"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className="pl-10"
                                />
                            </Field>

                            <Field label="Email Address" error={errors.email}>
                                <Mail className="field-icon" />
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email address"
                                    className="pl-10"
                                />
                            </Field>

                            <Field label="Username" error={errors.username}>
                                <User className="field-icon" />
                                <Input
                                    id="username"
                                    autoComplete="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Choose a username"
                                    className="pl-10"
                                />
                            </Field>

                            <Field label="Password" error={errors.password}>
                                <Lock className="field-icon" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Create a password"
                                    className="pl-10 pr-10"
                                />
                                <PwToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                            </Field>

                            <Field label="Confirm Password" error={errors.password_confirmation}>
                                <Lock className="field-icon" />
                                <Input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm your password"
                                    className="pl-10 pr-10"
                                />
                                <PwToggle shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
                            </Field>

                            <Button type="submit" className="w-full" size="lg" disabled={processing}>
                                {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                Register
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href={route('login')} className="font-semibold text-foreground underline-offset-4 hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

/* -------------------------------------------------------------------------- */
/* Left brand panel — dreamcatcher emblem, serif wordmark, woven accents.     */
/* -------------------------------------------------------------------------- */

function BrandPanel() {
    return (
        <div className="relative hidden flex-col items-center border-r border-border bg-secondary/30 px-12 pt-14 text-center lg:flex">
            {/* Woven textile accents, top-left and bottom-right */}
            <WeaveCorner className="absolute left-0 top-0 h-28 w-28 text-foreground/10" />
            <WeaveCorner className="absolute bottom-0 right-0 h-32 w-32 rotate-180 text-foreground/10" />

            <Dreamcatcher className="relative z-10 h-52 w-40 text-foreground" />

            <div className="relative z-10 mt-2 font-serif text-3xl font-bold tracking-wide text-foreground">EPANAW BAGOBO</div>
            <p className="relative z-10 mt-3 max-w-[15rem] text-[15px] leading-relaxed text-foreground/70">
                Preserving the Bagobo Tagabawa Dialect and Cultural Heritage
            </p>

            {/* Divider with center diamond */}
            <div className="relative z-10 mt-5 flex items-center gap-3">
                <span className="h-px w-14 bg-border" />
                <span className="text-xs text-muted-foreground">◆</span>
                <span className="h-px w-14 bg-border" />
            </div>

            <p className="relative z-10 mt-5 max-w-xs font-serif text-lg italic leading-snug text-foreground/80">
                “Our language. Our culture.
                <br />
                Our heritage. Our future.”
            </p>

            {/* Landscape illustration, fading up into the panel */}
            <div className="pointer-events-none relative z-0 mt-auto -mx-12 w-[calc(100%+6rem)]">
                <img
                    src={heroImg}
                    alt="Bagobo village landscape"
                    className="h-56 w-full object-cover grayscale [mask-image:linear-gradient(to_bottom,transparent,black_45%)]"
                />
            </div>
        </div>
    );
}

function Dreamcatcher({ className }: { className?: string }) {
    // Feathers hang from three strands below the ring.
    const strands = [
        { x: 70, len: 62 },
        { x: 100, len: 82 },
        { x: 130, len: 62 },
    ];
    return (
        <svg viewBox="0 0 200 300" className={className} fill="none" stroke="currentColor" aria-hidden>
            {/* Outer rings */}
            <circle cx="100" cy="92" r="82" strokeWidth="2.5" />
            <circle cx="100" cy="92" r="73" strokeWidth="1" />

            {/* Beads around the ring */}
            {Array.from({ length: 24 }).map((_, i) => {
                const a = (i / 24) * Math.PI * 2;
                return <circle key={i} cx={100 + Math.cos(a) * 78} cy={92 + Math.sin(a) * 78} r="1.6" fill="currentColor" stroke="none" />;
            })}

            {/* Radiating spokes */}
            {Array.from({ length: 16 }).map((_, i) => {
                const a = (i / 16) * Math.PI * 2;
                return (
                    <line
                        key={i}
                        x1={100 + Math.cos(a) * 30}
                        y1={92 + Math.sin(a) * 30}
                        x2={100 + Math.cos(a) * 68}
                        y2={92 + Math.sin(a) * 68}
                        strokeWidth="0.9"
                    />
                );
            })}

            {/* Concentric diamond mandala */}
            {[62, 48, 34, 20].map((r, i) => (
                <rect
                    key={r}
                    x={100 - r / Math.SQRT2}
                    y={92 - r / Math.SQRT2}
                    width={(r / Math.SQRT2) * 2}
                    height={(r / Math.SQRT2) * 2}
                    transform={`rotate(45 100 92)`}
                    strokeWidth={i === 0 ? 2 : 1.2}
                    rx="2"
                />
            ))}
            <rect x="90" y="82" width="20" height="20" transform="rotate(45 100 92)" fill="currentColor" stroke="none" />

            {/* Hanging strands + feathers */}
            {strands.map((s) => (
                <g key={s.x}>
                    <line x1={s.x} y1="172" x2={s.x} y2={172 + s.len} strokeWidth="1" />
                    <circle cx={s.x} cy="172" r="2" fill="currentColor" stroke="none" />
                    <Feather cx={s.x} cy={172 + s.len} />
                </g>
            ))}
        </svg>
    );
}

function Feather({ cx, cy }: { cx: number; cy: number }) {
    return (
        <g transform={`translate(${cx} ${cy})`}>
            <path d="M0 0 C -9 10, -9 30, 0 44 C 9 30, 9 10, 0 0 Z" strokeWidth="1.2" />
            <line x1="0" y1="4" x2="0" y2="42" strokeWidth="0.9" />
            {[10, 18, 26, 34].map((y) => (
                <g key={y}>
                    <line x1="0" y1={y} x2={-5} y2={y - 4} strokeWidth="0.7" />
                    <line x1="0" y1={y} x2={5} y2={y - 4} strokeWidth="0.7" />
                </g>
            ))}
        </g>
    );
}

function WeaveCorner({ className }: { className?: string }) {
    // A small tiled diamond weave, evoking Bagobo textile patterns.
    return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 4 }).map((_, c) => {
                    const x = c * 24 + 12;
                    const y = r * 24 + 12;
                    return (
                        <g key={`${r}-${c}`}>
                            <path d={`M${x} ${y - 9} L${x + 9} ${y} L${x} ${y + 9} L${x - 9} ${y} Z`} />
                            <path d={`M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z`} fill="currentColor" stroke="none" />
                        </g>
                    );
                }),
            )}
        </svg>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="relative [&_.field-icon]:pointer-events-none [&_.field-icon]:absolute [&_.field-icon]:left-3 [&_.field-icon]:top-1/2 [&_.field-icon]:h-4 [&_.field-icon]:w-4 [&_.field-icon]:-translate-y-1/2 [&_.field-icon]:text-muted-foreground">
                {children}
            </div>
            <InputError message={error} />
        </div>
    );
}

function PwToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={shown ? 'Hide password' : 'Show password'}
        >
            {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
    );
}
