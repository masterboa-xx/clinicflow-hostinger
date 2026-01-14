"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { callNextPatient, updateTurnStatus } from "@/app/actions/dashboard";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Turn, TurnStatus } from "@prisma/client";
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
    Zap
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/LanguageContext";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

type DashboardProps = {
    initialActive: Turn | null;
    initialQueue: Turn[];
    clinicName: string;
    logo?: string | null;
};

export default function DashboardClient({ initialActive, initialQueue, clinicName, logo }: DashboardProps) {
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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" dir={dir}>
            {/* OFFLINE BANNER */}
            {!isOnline && (
                <div className="bg-red-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2 animate-pulse">
                    <Settings className="w-4 h-4" />
                    {t("status.offline") || "Connection Lost - Reconnecting..."}
                </div>
            )}

            {/* --- TOP BAR --- */}
            <DashboardHeader clinicName={clinicName} logo={logo} />

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid lg:grid-cols-12 gap-8">

                {/* --- LEFT: WAITING QUEUE (4 cols) --- */}
                <section className="lg:col-span-4 flex flex-col h-[calc(100vh-8rem)]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-slate-500 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {t("queue.title")}
                        </h2>
                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {initialQueue.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {initialQueue.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
                                <Clock className="w-10 h-10 mb-3 opacity-20" />
                                <p className="text-sm font-medium">{t("queue.empty")}</p>
                            </div>
                        ) : (
                            initialQueue.map((turn) => (
                                <div key={turn.id} className={clsx(
                                    "p-4 rounded-xl border shadow-sm transition-all group relative overflow-hidden",
                                    turn.status === "URGENT"
                                        ? "bg-red-50/60 border-red-200 shadow-red-100 hover:shadow-red-200"
                                        : "bg-white border-slate-100 hover:shadow-md"
                                )}>
                                    {turn.status === "URGENT" && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-100 to-transparent pointer-events-none opacity-50" />
                                    )}
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div>
                                            <span className={clsx(
                                                "text-2xl font-bold block leading-none mb-1",
                                                turn.status === "URGENT" ? "text-red-700" : "text-slate-800"
                                            )}>
                                                {turn.ticketCode}
                                            </span>
                                            {turn.patientName && (
                                                <span className="text-sm text-slate-500 font-medium block truncate max-w-[120px]">
                                                    {turn.patientName}
                                                </span>
                                            )}
                                        </div>
                                        {turn.status === "URGENT" && (
                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1 shadow-sm border border-red-200">
                                                <Zap className="w-3 h-3 fill-red-600" />
                                                {t("action.urgent")}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions (Opacity 0 until hover for cleaner look, or always visible on mobile) */}
                                    <div className="flex gap-2 pt-2 border-t border-slate-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleStatus(turn.id, "URGENT")}
                                            className="flex-1 py-1.5 text-xs font-medium bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded transition-colors"
                                        >
                                            {t("action.urgent")}
                                        </button>
                                        <button
                                            onClick={() => handleStatus(turn.id, "DELAYED")}
                                            className="flex-1 py-1.5 text-xs font-medium bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded transition-colors"
                                        >
                                            {t("action.delay")}
                                        </button>
                                        <button
                                            onClick={() => handleStatus(turn.id, "CANCELLED")}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* --- RIGHT: CURRENT PATIENT (8 cols) --- */}
                <section className="lg:col-span-8 flex flex-col">
                    <h2 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {t("current.title")}
                    </h2>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-teal-400" />

                        {initialActive ? (
                            <div className="w-full max-w-lg animate-in fade-in zoom-in duration-300">
                                <div className="mb-8 relative">
                                    {/* URGENT BADGE FOR ACTIVE PATIENT */}
                                    {(() => {
                                        try {
                                            const answers = initialActive.answers ? (typeof initialActive.answers === 'string' ? JSON.parse(initialActive.answers) : initialActive.answers) : {};
                                            const cleanKey = (k: string) => k.trim().toLowerCase();
                                            const urgentEntry = Object.entries(answers).find(([k]) => cleanKey(k) === "urgent" || cleanKey(k).includes("urgence"));
                                            const isUrgent = initialActive.status === "URGENT" || (urgentEntry && (String(urgentEntry[1]).toLowerCase() === "yes" || String(urgentEntry[1]).toLowerCase() === "oui"));

                                            if (isUrgent) {
                                                return (
                                                    <div className="bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-red-200 flex items-center gap-2 animate-bounce mx-auto w-fit mb-4">
                                                        <Zap className="w-5 h-5 fill-white" />
                                                        URGENT
                                                    </div>
                                                );
                                            }
                                        } catch (e) { } return null;
                                    })()}

                                    <span className="text-[10rem] leading-none font-bold text-slate-800 tracking-tighter block mb-4">
                                        {initialActive.ticketCode}
                                    </span>
                                    {initialActive.patientName && (
                                        <div className="text-2xl text-slate-500 font-medium">
                                            {initialActive.patientName}
                                        </div>
                                    )}
                                </div>

                                {/* ANSWERS SECTION */}
                                {initialActive.answers && (
                                    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                                <ClipboardList className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                                {t("details.title") || "Patient Details"}
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {(() => {
                                                try {
                                                    const answers = typeof initialActive.answers === 'string'
                                                        ? JSON.parse(initialActive.answers)
                                                        : initialActive.answers;

                                                    // Extract special fields
                                                    const cleanKey = (k: string) => k.trim().toLowerCase();

                                                    const motifEntry = Object.entries(answers).find(([k]) => cleanKey(k).includes("motif") || cleanKey(k).includes("reason"));
                                                    const motif = motifEntry ? motifEntry[1] : null;

                                                    const urgentEntry = Object.entries(answers).find(([k]) => cleanKey(k) === "urgent" || cleanKey(k).includes("urgence"));
                                                    const isUrgent = urgentEntry && (String(urgentEntry[1]).toLowerCase() === "yes" || String(urgentEntry[1]).toLowerCase() === "oui");

                                                    const otherAnswers = Object.entries(answers).filter(([k]) => {
                                                        const key = cleanKey(k);
                                                        return !key.includes("motif") && !key.includes("reason") && key !== "urgent" && !key.includes("urgence");
                                                    });

                                                    return (
                                                        <>
                                                            {/* MOTIF HIGHLIGHT */}
                                                            {motif && (
                                                                <div className="px-6 py-5 bg-indigo-50/30">
                                                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                                                                        Motif de la visite
                                                                    </span>
                                                                    <span className="text-xl font-bold text-slate-800 block leading-snug">
                                                                        {String(motif)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* URGENT BADGE */}
                                                            {isUrgent && (
                                                                <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500 flex items-center gap-3">
                                                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                                                    <span className="font-bold text-red-700">Urgent Case</span>
                                                                </div>
                                                            )}

                                                            {/* OTHER DETAILS */}
                                                            {otherAnswers.map(([key, value]) => (
                                                                <div key={key} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                                                                        {key}
                                                                    </span>
                                                                    <span className="text-base font-medium text-slate-600 text-right">
                                                                        {String(value)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </>
                                                    );
                                                } catch (e) {
                                                    return <div className="p-4 text-red-500 text-sm">Error loading details</div>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {/* NEXT PATIENT INDICATOR */}
                                    <div className="col-span-2 bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Prochain patient
                                        </span>
                                        <div className="flex items-center gap-3">
                                            {nextPatient ? (
                                                <>
                                                    {isNextUrgent && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">
                                                            <Zap className="w-3 h-3 fill-red-600" />
                                                            Urgent
                                                        </span>
                                                    )}
                                                    <span className={clsx("text-lg font-bold", isNextUrgent ? "text-red-700" : "text-slate-700")}>
                                                        {nextPatient.ticketCode}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-400 italic">
                                                    - Aucun -
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        onClick={handleNext}
                                        className={clsx(
                                            "col-span-2 h-20 text-2xl rounded-2xl shadow-lg transition-transform hover:scale-[1.02]",
                                            isNextUrgent
                                                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                                                : "shadow-primary/20"
                                        )}
                                    >
                                        <Play className={clsx("w-8 h-8 mr-3 fill-current", isNextUrgent && "text-white")} />
                                        {t("action.next")}
                                        {isNextUrgent && <span className="text-sm ml-2 opacity-90 font-normal">(Urgent)</span>}
                                    </Button>

                                    <button
                                        onClick={() => handleStatus(initialActive.id, "DONE")} // "done" logic is handled by Call Next, but explicit Finish is good
                                        className="h-14 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                    >
                                        {t("action.finish")}
                                    </button>
                                    <button
                                        onClick={() => handleStatus(initialActive.id, "CANCELLED")}
                                        className="h-14 rounded-xl font-medium bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        {t("action.cancel")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-60">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <Play className="w-10 h-10 ml-1" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800 mb-2">{t("current.none")}</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">{t("current.helper")}</p>
                                <Button
                                    size="lg"
                                    onClick={handleNext}
                                    className={clsx(
                                        "rounded-xl px-12 transition-all",
                                        isNextUrgent ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200" : ""
                                    )}
                                >
                                    {t("current.start")}
                                    {isNextUrgent && <span className="ml-2 opacity-90 font-normal">(Urgent <Zap className="w-4 h-4 inline fill-current" />)</span>}
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
