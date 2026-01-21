"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/app/lib/actions";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    // Clean URL on mount to hide ugly callbackUrl
    useEffect(() => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            if (url.searchParams.has("callbackUrl")) {
                url.searchParams.delete("callbackUrl");
                window.history.replaceState({}, "", url.toString());
            }
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <div className="flex justify-center mb-8">
                        <Logo variant="full" className="scale-110" />
                    </div>

                    <form action={dispatch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="admin@clinicflow.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                                Mot de passe
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="pt-2">
                            <LoginButton />
                        </div>

                        {errorMessage && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                                {errorMessage}
                            </div>
                        )}

                        <div className="text-center mt-4">
                            <Link href="/register" className="text-sm text-primary hover:underline">
                                Créer un compte
                            </Link>
                        </div>
                    </form>
                </div>
                <p className="mt-8 text-slate-400 text-xs text-center">
                    &copy; 2026 ClinicFlow. Accès sécurisé uniquement.
                </p>
            </main>
            <Footer />
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" size="lg" disabled={pending}>
            {pending ? "Connexion..." : "Se connecter"}
        </Button>
    );
}
