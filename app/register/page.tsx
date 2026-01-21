"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerClinic } from "@/app/lib/actions";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterContent() {
    const [errorMessage, dispatch, isPending] = useActionState(registerClinic, undefined);
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'trial';

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <div className="flex justify-center mb-8">
                        <Logo variant="full" className="scale-110" />
                    </div>

                    <h1 className="text-xl font-bold text-slate-900 text-center mb-6">Créer un compte</h1>

                    <form action={dispatch} className="space-y-4">
                        <div>
                            <input type="hidden" name="plan" value={plan} />
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
                                Nom de la clinique
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Ma Clinique"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="contact@maclinique.com"
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
                            <RegisterButton />
                        </div>

                        {errorMessage && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                                {errorMessage}
                            </div>
                        )}

                        <div className="text-center mt-4">
                            <Link href="/login" className="text-sm text-primary hover:underline">
                                Déjà inscris ? Se connecter
                            </Link>
                        </div>
                    </form>
                </div>
                <p className="mt-8 text-slate-400 text-xs text-center">
                    &copy; 2026 ClinicFlow. Tous droits réservés.
                </p>
            </main>
            <Footer />
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Chargement...</div>}>
            <RegisterContent />
        </Suspense>
    );
}

function RegisterButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" size="lg" disabled={pending}>
            {pending ? "Inscription..." : "S'inscrire"}
        </Button>
    );
}
