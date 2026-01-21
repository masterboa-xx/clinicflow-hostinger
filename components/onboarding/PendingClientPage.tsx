"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { logout } from "@/app/actions/auth";
import { PendingChat } from "@/components/onboarding/PendingChat";
import { MessageSquare } from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkActivationStatus } from "@/app/actions/onboarding";

export function PendingClientPage({ ticket }: { ticket: any }) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            const result = await checkActivationStatus();
            if (result && (result.status === "ACTIVE" || result.status === "TRIAL")) {
                setIsRedirecting(true);
                router.push("/dashboard");
                router.refresh();
            }
        }, 2000); // Check every 2 seconds

        return () => clearInterval(interval);
    }, [router]);

    if (isRedirecting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4 animate-in fade-in duration-700">
                <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <h2 className="text-2xl font-bold text-emerald-800">Compte Activé !</h2>
                <p className="text-slate-500">Redirection vers votre tableau de bord...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 text-center max-w-3xl mb-12">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-amber-800 mb-4">
                            Compte en attente d'activation
                        </h1>
                        <p className="text-amber-700 text-lg mb-6">
                            Merci de votre inscription au plan Pro ! Nous avons bien reçu votre demande.
                            Un administrateur va vérifier vos informations et activer votre compte dans les plus brefs délais.
                        </p>
                        <p className="text-amber-600 mb-4">
                            Utilisez le chat ci-dessous pour discuter directement avec nous (paiement, activation, questions).
                        </p>
                        <form action={logout}>
                            <Button variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-100">
                                Se déconnecter
                            </Button>
                        </form>
                    </div>

                    {ticket ? (
                        <div className="text-left">
                            <PendingChat ticketId={ticket.id} initialTicket={ticket} />
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                            <MessageSquare size={48} className="mb-4 text-slate-300" />
                            <p>Aucun ticket de support actif.</p>
                            <p className="text-sm">Veuillez patienter qu'un administrateur vous contacte.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
