"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { callNextPatient, updateTurnStatus, resetDailyCounter } from "@/app/actions/dashboard";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Turn, TurnStatus, Subscription } from "@prisma/client";
import {
    Clock,
    Play,
    XCircle,
    AlertCircle,
    PauseCircle,
    Settings,
    LogOut,
    Activity,
    Users,
    FileText,
    ClipboardList,
    Zap,
    ChevronRight,
    Ticket,
    Power,
    Menu,
    X,
    Monitor
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import clsx from "clsx";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/LanguageContext";
import Link from "next/link";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { QRCodeModal } from "@/components/dashboard/QRCodeModal";
import { StatsCards } from "@/components/dashboard/StatsCards";

type DashboardProps = {
    initialActive: Turn | null;
    initialQueue: Turn[];
    clinicName: string;
    logo?: string | null;
    dailyTicketCount: number;
    avgTime: number;
    slug: string;
    completedCount: number;
    subscription: Subscription | null;
};

// --- Sub-Component: Visit Timer ---
function VisitTimer({ startDate }: { startDate: Date }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = new Date(startDate).getTime();
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startDate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="font-mono text-xl font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            {formatTime(elapsed)}
        </div>
    );
}

export default function DashboardClient({ initialActive, initialQueue, clinicName, logo, dailyTicketCount, avgTime, slug, completedCount, subscription }: DashboardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { t, language, setLanguage, dir } = useLanguage();
    const isOnline = useOnlineStatus();

    // Identify next patient
    const nextPatient = initialQueue.length > 0 ? initialQueue[0] : null;
    const isNextUrgent = nextPatient?.status === "URGENT";

    // Polling
    useEffect(() => {
        const interval = setInterval(() => {
            startTransition(() => {
                router.refresh();
            });
        }, 8000);
        return () => clearInterval(interval);
    }, [router]);

    const handleNext = async () => {
        if (isPending) return;
        try {
            const result = await callNextPatient();
            if (result.success) {
                if (result.nextTurn) {
                    toast.success(`${t("action.next")}: ${result.nextTurn.ticketCode}`);
                } else {
                    toast.info(t("queue.empty"));
                }
                router.refresh();
            }
        } catch (e) {
            console.error(e);
            toast.error("Error");
        }
    };

    const handleStatus = async (id: string, status: TurnStatus) => {
        try {
            await updateTurnStatus(id, status);
            toast.success("Updated");
            router.refresh();
        } catch (e) {
            toast.error("Error");
        }
    };

    const [isServiceActive, setIsServiceActive] = useState(true);
    const [isCloseServiceModalOpen, setIsCloseServiceModalOpen] = useState(false);

    // Initialize state from LocalStorage on mount to persist Status
    useEffect(() => {
        const stored = localStorage.getItem("service_active");
        if (stored !== null) {
            setIsServiceActive(stored === "true");
        }
    }, []);

    const handleToggleService = () => {
        if (isServiceActive) {
            // OPEN MODAL
            setIsCloseServiceModalOpen(true);
        } else {
            // WE ARE OPENING
            setIsServiceActive(true);
            localStorage.setItem("service_active", "true"); // Persist
            toast.success("Service démarré. Les nouveaux tickets commenceront à A01.");
        }
    };

    const confirmCloseService = async () => {
        try {
            await resetDailyCounter();
            setIsServiceActive(false);
            localStorage.setItem("service_active", "false"); // Persist
            toast.success("Service clôturé. Compteur réinitialisé.");
            router.refresh();
        } catch (e) {
            toast.error("Erreur lors de la clôture.");
        }
    };

    const [isResetDayModalOpen, setIsResetDayModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    const handleReset = () => {
        // OPEN MODAL
        setIsResetDayModalOpen(true);
    };

    const confirmResetDay = async () => {
        try {
            await resetDailyCounter();
            toast.success("Journée clôturée avec succès. Le compteur est remis à A01.");
            router.refresh();
        } catch (e) {
            toast.error("Erreur lors de la réinitialisation");
        }
    };

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isTrial = subscription?.status === "TRIAL";
    const trialDaysLeft = subscription?.trialEndsAt ? Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;


    return (
        <>
            {/* --- MAIN CONTENT WRAPPER --- */}
            <div className="flex-1 flex flex-col min-h-screen">

                {/* --- HEADER --- */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <Activity className="text-emerald-500" size={24} />
                        <h1 className="font-bold text-xl text-slate-800 hidden lg:block">ClinicFlow</h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* TV MODE BUTTON */}
                        <Link
                            href={`/p/${slug}/tv`}
                            target="_blank"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-[10px] md:text-xs transition-all shadow-sm border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        >
                             <Monitor size={14} />
                             TV Mode
                        </Link>

                        {/* SERVICE STATUS TOGGLE */}
                        <button
                            onClick={handleToggleService}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-[10px] md:text-xs transition-all shadow-sm border",
                                isServiceActive
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 ring-2 ring-emerald-500/20"
                                    : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                            )}
                        >
                            <div className={clsx("w-2 h-2 rounded-full", isServiceActive ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                            <span className="hidden sm:inline">{isServiceActive ? "Service Ouvert" : "Fermé"}</span>
                            <span className="sm:hidden">{isServiceActive ? "Actif" : "Arrêt"}</span>
                            {/* <Power size={14} className="ml-1 opacity-50" /> */}
                        </button>

                        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs md:text-sm border border-indigo-100">
                            Dr
                        </div>
                        <span className="font-bold text-slate-700 hidden lg:block text-sm">{clinicName}</span>
                    </div>
                </header>

                {/* MOBILE SIDEBAR */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden font-sans">
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                        <div className="fixed top-0 left-0 bottom-0 w-[280px] animate-in slide-in-from-left duration-300 shadow-2xl">
                            <Sidebar className="w-full h-full" />
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/10 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                    {/* TRIAL BANNER */}
                    {isTrial && (
                        <div className="mb-6 bg-indigo-600 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg shadow-indigo-200 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg"><Zap size={20} fill="currentColor"/></div>
                                <div>
                                    <h3 className="font-bold text-sm">Mode Essai</h3>
                                    <p className="text-xs text-indigo-200">Il vous reste {trialDaysLeft} jours. Passez au plan Pro pour débloquer toutes les fonctionnalités.</p>
                                </div>
                            </div>
                            <Link href="/pricing" className="w-full sm:w-auto text-center px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
                                Passer Pro
                            </Link>
                        </div>
                    )}

                    <StatsCards
                        dailyTotal={dailyTicketCount}
                        waitingCount={initialQueue.length}
                        completedCount={completedCount}
                        avgTime={avgTime}
                    />

                    <div className="grid lg:grid-cols-12 gap-8">

                    {/* --- LEFT: QUEUE LIST (4 cols) --- */}
                    <section className="lg:col-span-4 flex flex-col min-h-[600px] h-[calc(100vh-16rem)]">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 font-display">File d'attente</h2>

                        <div className="bg-white rounded-3xl border border-slate-200 h-full shadow-sm p-6 overflow-hidden flex flex-col relative">
                            {initialQueue.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-32 h-32 relative mb-6">
                                        <div className="absolute inset-0 bg-emerald-50 rounded-full blur-2xl opacity-50" />
                                        <img src="/assets/queue-empty-state.png" alt="Queue Empty" className="w-full h-full object-contain relative z-10 opacity-60 grayscale" />
                                    </div>
                                    <p className="text-slate-400 font-medium max-w-[200px]">
                                        {t("queue.empty")}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    {initialQueue.map((turn) => (
                                        <div key={turn.id} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 font-bold flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                    {turn.ticketCode}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700">{turn.patientName || "Patient"}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock size={10} /> En attente
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Actions in List */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <button onClick={() => handleStatus(turn.id, "URGENT")} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg" title="Urgent">
                                                    <Zap size={14} />
                                                </button>
                                                <button onClick={() => handleStatus(turn.id, "CANCELLED")} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-lg" title="Annuler">
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* --- RIGHT: CURRENT PATIENT / EMPTY STATE (8 cols) --- */}
                    <section className="lg:col-span-8 flex flex-col min-h-[500px] md:min-h-[600px]">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 md:mb-6 font-display flex items-center gap-4">
                            Patient actuel
                            {initialActive && <VisitTimer startDate={initialActive.updatedAt} />}
                        </h2>

                        <div className="bg-white rounded-3xl border border-slate-200 h-full shadow-sm p-4 md:p-8 relative flex flex-col items-center justify-center text-center">
                            {/* Top Decor */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20" />

                            {initialActive ? (
                                <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-200/50">
                                        <Activity size={40} />
                                    </div>
                                    <h2 className="text-5xl font-bold text-slate-800 mb-2 tracking-tight">{initialActive.ticketCode}</h2>
                                    <p className="text-xl text-slate-500 mb-8 font-medium">{initialActive.patientName}</p>

                                    {/* Answers Display */}
                                    {(() => {
                                        let displayAnswers: Record<string, any> | null = null;
                                        try {
                                            if (initialActive.answers) {
                                                if (typeof initialActive.answers === 'string') {
                                                    displayAnswers = JSON.parse(initialActive.answers);
                                                } else {
                                                    displayAnswers = initialActive.answers as Record<string, any>;
                                                }
                                            }
                                        } catch (e) {
                                            displayAnswers = null;
                                        }

                                        if (!displayAnswers || Object.keys(displayAnswers).length === 0) return null;

                                        return (
                                            <div className="bg-slate-50 rounded-2xl p-4 w-full max-w-lg mb-8 text-left border border-slate-100">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informations Patient</h3>
                                                <div className="space-y-3">
                                                    {Object.entries(displayAnswers).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between items-start text-sm">
                                                            <span className="font-medium text-slate-600">{key}:</span>
                                                            <span className="text-slate-900 font-bold text-right ml-4 break-words max-w-[200px]">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-lg">
                                        <Button
                                            onClick={handleNext}
                                            className="col-span-2 h-20 md:h-24 text-lg md:text-2xl rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-200 font-bold flex flex-col items-center justify-center gap-1"
                                        >
                                            <span className="flex items-center gap-2">Appeler le suivant <ChevronRight className="w-5 h-5 md:w-6 md:h-6" /></span>
                                            <span className="text-[10px] md:text-xs font-normal opacity-80 uppercase tracking-wide">Marquer comme terminé & Suivant</span>
                                        </Button>

                                        <button
                                            onClick={() => handleStatus(initialActive.id, "DONE")}
                                            className="h-14 md:h-16 rounded-2xl font-bold text-sm md:text-base text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-200 rounded-full flex items-center justify-center"><Clock size={10} className="md:w-3 md:h-3" /></div>
                                            <span className="hidden sm:inline">Terminer sans suivant</span>
                                            <span className="sm:hidden">Terminer</span>
                                        </button>

                                        <button
                                            onClick={() => handleStatus(initialActive.id, "CANCELLED")}
                                            className="h-14 md:h-16 rounded-2xl font-bold text-sm md:text-base text-slate-500 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-100 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <div className="w-5 h-5 md:w-6 md:h-6 bg-slate-200 rounded-full flex items-center justify-center"><XCircle size={10} className="md:w-3 md:h-3" /></div>
                                            Absent
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-lg mx-auto">
                                    <div className="w-56 h-56 mx-auto mb-6 relative">
                                        <div className="absolute inset-0 bg-blue-50/50 rounded-full blur-3xl opacity-60" />
                                        <img src="/assets/doctor-empty-state.png" alt="Doctor Ready" className="w-full h-full object-contain relative z-10" />
                                    </div>

                                    <h3 className="text-3xl font-bold text-slate-700 mb-2 font-display">Aucun patient pour le moment</h3>
                                    <p className="text-slate-500 mb-6">Lancez la file d'attente pour commencer à appeler les patients.</p>

                                    <ul className="text-left space-y-4 mb-8 text-slate-600 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 inline-block w-full">
                                        <li className="flex items-center gap-3">
                                            <Ticket className="text-blue-400" size={20} />
                                            <span className="font-medium">Les patients prennent un ticket</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Users className="text-blue-400" size={20} />
                                            <span className="font-medium">Vous appelez le patient</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <ChevronRight className="text-blue-400" size={20} />
                                            <span className="font-medium">La file avance automatiquement</span>
                                        </li>
                                    </ul>

                                    <Button onClick={handleNext} className="w-full py-6 text-lg rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 font-bold transition-transform hover:scale-[1.02]">
                                        Démarrer la file
                                    </Button>
                                    <div
                                        className="mt-4 text-xs text-slate-400 font-medium cursor-pointer hover:text-emerald-500 transition-colors"
                                        onClick={() => setIsQRModalOpen(true)}
                                    >
                                        Voir le QR code patient
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    </div>
                </main>
            </div >

            <QRCodeModal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                slug={slug}
                clinicName={clinicName}
            />

            <ConfirmModal
                isOpen={isCloseServiceModalOpen}
                onClose={() => setIsCloseServiceModalOpen(false)}
                onConfirm={confirmCloseService}
                title="Clôturer le service ?"
                description={
                    <div className="space-y-2">
                        <p>Cette action va entraîner :</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>L'annulation de tous les tickets en attente.</li>
                            <li>La remise à zéro du compteur pour le prochain service.</li>
                            <li>Le passage du statut en <span className="text-red-500 font-bold">'Fermé'</span>.</li>
                        </ul>
                    </div>
                }
                confirmText="Oui, clôturer"
                cancelText="Annuler"
                variant="destructive"
            />

            <ConfirmModal
                isOpen={isResetDayModalOpen}
                onClose={() => setIsResetDayModalOpen(false)}
                onConfirm={confirmResetDay}
                title="Clôturer la journée ?"
                description={
                    <div className="space-y-2">
                        <p>Cette action est irréversible :</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Annulation de tous les tickets en attente.</li>
                            <li>Remise à zéro du compteur (A01).</li>
                        </ul>
                        <p className="text-sm text-slate-500 mt-2">À utiliser uniquement à la fin de votre service.</p>
                    </div>
                }
                confirmText="Oui, réinitialiser"
                cancelText="Annuler"
                variant="destructive"
            />
        </>
    );
}
