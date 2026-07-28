import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, LoaderCircle, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { PublicLayout } from '@/components/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <PublicLayout>
            <Head title="Log in" />
            <div className="relative mx-auto flex max-w-7xl justify-center px-4 py-14 sm:px-6 lg:px-8">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-border">
                            <Lock className="h-7 w-7 text-foreground" />
                        </div>
                        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">Welcome Back!</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Log in to your account to continue.</p>
                    </div>

                    {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}

                    <form className="mt-8 space-y-5" onSubmit={submit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email"
                                    className="pl-10"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {canResetPassword && (
                            <div className="text-right">
                                <Link href={route('password.request')} className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        <Button type="submit" className="w-full" size="lg" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Log In
                        </Button>
                    </form>

                    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="h-px flex-1 bg-border" />
                        or
                        <span className="h-px flex-1 bg-border" />
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href={route('register')} className="font-semibold text-foreground underline-offset-4 hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
