"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createTurn, getMyTurnStatus, getClinicLanguage } from "@/app/actions/patient";
import { Button } from "@/components/ui/Button";
import { Turn } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, QrCode, Ticket, ArrowRight, User, RefreshCw } from "lucide-react";
import clsx from "clsx";

type PatientViewProps = {
    clinic: {
        name: string;
        slug: string;
        avgTime: number;
        questions?: any[];
        id: string;
        logo?: string | null;
        ticketLanguage?: string;
    };
};

type StoredTicket = {
    turnId: string;
    ticketCode: string;
    clinicSlug: string;
};

const DICTIONARY: any = {
    ar: {
        welcome: "أخبرنا المزيد",
        subtitle: "بعض الأسئلة لتحضير زيارتك.",
        placeholder: "إجابتك...",
        back: "عودة",
        confirm: "تأكيد",
        scan: "امسح رمز الاستجابة السريعة أو انقر أدناه للانضمام إلى قائمة الانتظار.",
        book: "احجز تذكرة",
        powered: "مشغل بواسطة ClinicFlow",
        yourTurn: "حان دورك!",
        pleaseGo: "يرجى التوجه إلى الاستقبال أو مكتب الطبيب فوراً.",
        finished: "انتهت الزيارة",
        cancelled: "تم إلغاء التذكرة",
        status: "الحالة الحالية",
        peopleAhead: "أشخاص قبلك",
        waitTime: "وقت الانتظار",
        impending: "وشيك",
        notifications: "تنبيهات",
        enabled: "مفعلة",
        blocked: "محظورة",
        disabled: "غير مفعلة",
        enable: "تفعيل",
        cancelTicket: "إلغاء التذكرة",
        close: "إغلاق",
        dir: "rtl"
    },
    fr: {
        welcome: "Dites-nous en plus",
        subtitle: "Quelques questions pour préparer votre visite.",
        placeholder: "Votre réponse...",
        back: "Retour",
        confirm: "Confirmer",
        scan: "Scannez le QR code ou cliquez ci-dessous pour rejoindre la file.",
        book: "Prendre un ticket",
        powered: "Propulsé par ClinicFlow",
        yourTurn: "C'est votre tour !",
        pleaseGo: "Veuillez vous rendre à l'accueil ou au cabinet.",
        finished: "Visite terminée",
        cancelled: "Ticket annulé",
        status: "Statut actuel",
        peopleAhead: "personnes devant",
        waitTime: "attente estimée",
        impending: "Imminent",
        notifications: "Notifications",
        enabled: "Activées",
        blocked: "Bloquées",
        disabled: "Désactivées",
        enable: "Activer",
        cancelTicket: "Annuler le ticket",
        close: "Fermer",
        dir: "ltr"
    },
    en: {
        welcome: "Tell us more",
        subtitle: "A few questions to prepare your visit.",
        placeholder: "Your answer...",
        back: "Back",
        confirm: "Confirm",
        scan: "Scan QR code or click below to join queue.",
        book: "Get Ticket",
        powered: "Powered by ClinicFlow",
        yourTurn: "It's your turn!",
        pleaseGo: "Please proceed to reception or doctor's office.",
        finished: "Visit Done",
        cancelled: "Ticket Cancelled",
        status: "Current Status",
        peopleAhead: "people ahead",
        waitTime: "wait time",
        impending: "Soon",
        notifications: "Notifications",
        enabled: "Enabled",
        blocked: "Blocked",
        disabled: "Disabled",
        enable: "Enable",
        cancelTicket: "Cancel Ticket",
        close: "Close",
        dir: "ltr"
    }
};

export default function PatientView({ clinic }: PatientViewProps) {
    const [activeLang, setActiveLang] = useState(clinic.ticketLanguage || "ar");
    const t = DICTIONARY[activeLang] || DICTIONARY.ar;
    const isRTL = t.dir === "rtl";

    const [ticket, setTicket] = useState<StoredTicket | null>(null);
    const [statusData, setStatusData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [lastError, setLastError] = useState<string | null>(null);

    // Track previous status to trigger alert only on change
    const prevStatusRef = useRef<string | null>(null);

    // Load ticket from LS
    useEffect(() => {
        const stored = localStorage.getItem(`turn_${clinic.slug}`);
        if (stored) {
            try {
                setTicket(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse ticket", e);
                localStorage.removeItem(`turn_${clinic.slug}`);
            }
        }
        setLoading(false);
    }, [clinic.slug]);

    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");

    // Check permission on mount & Register SW
    useEffect(() => {
        if (typeof window !== 'undefined' && "Notification" in window) {
            setPermissionStatus(Notification.permission);
        }
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW Registered', reg))
                .catch(err => console.error('SW Register failed', err));
        }
    }, []);

    // Audio Unlock & Permission
    const enableNotifications = async () => {
        try {
            // Unlock audio - We use Web Audio API directly now, so just resuming context if needed
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                await ctx.resume();
            }
        } catch (e) {
            // Ignore audio errors
        }

        if ("Notification" in window) {
            try {
                const permission = await Notification.requestPermission();
                setPermissionStatus(permission);
                if (permission === 'granted') {
                    // Try SW notification first
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        const reg = await navigator.serviceWorker.ready;
                        reg.showNotification("Notifications activées ✅", {
                            body: "C'est bon! Vous serez averti.",
                            icon: clinic.logo || "/web-app-manifest-192x192.png",
                            vibrate: [200, 100, 200]
                        });
                    } else {
                        new Notification("Notifications activées ✅", { body: "C'est bon! Vous serez averti." });
                    }
                } else {
                    toast.error("Permissions refusées", {
                        description: "Veuillez activer les notifications dans les paramètres de votre navigateur pour être averti.",
                        duration: 5000,
                    });
                }
            } catch (e) { console.error(e); }
        } else {
            toast.error("Non supporté", {
                description: "Votre navigateur ne supporte pas les notifications.",
            });
        }
    };


    // Trigger Notification
    const triggerAlert = async () => {
        try {
            // Use Web Audio API for reliable sound generation without external files
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                // Pleasant "Ding-Dong" effect
                const now = ctx.currentTime;

                // First note (Ding)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

                // Volume envelope
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

                osc.start(now);
                osc.stop(now + 1.2);
            }

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }

            if ("Notification" in window && Notification.permission === "granted") {
                if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.ready;
                    reg.showNotification("C'est votre tour! 🎉", {
                        body: "Veuillez vous rendre au guichet.",
                        icon: clinic.logo || "/web-app-manifest-192x192.png",
                        vibrate: [200, 100, 200],
                        requireInteraction: true,
                        tag: 'turn-alert'
                    });
                } else {
                    new Notification("C'est votre tour!", {
                        body: "Veuillez vous rendre au guichet.",
                        icon: clinic.logo || undefined,
                        requireInteraction: true // Keep it open
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Polling for status (Active Ticket)
    useEffect(() => {
        if (!ticket) return;

        const poll = async () => {
            try {
                const res = await getMyTurnStatus(ticket.turnId);
                if (res.success && res.turn) {
                    setStatusData(res);
                    setLastError(null);

                    // Check for language change (Hot Swap)
                    if (res.ticketLanguage && res.ticketLanguage !== activeLang) {
                        setActiveLang(res.ticketLanguage);
                    }

                    // Check for status change to ACTIVE
                    if (res.turn.status === "ACTIVE" && prevStatusRef.current !== "ACTIVE" && prevStatusRef.current !== null) {
                        triggerAlert();
                    }
                    prevStatusRef.current = res.turn.status;

                } else if (res.error === "Turn not found") {
                    // Turn might be removed
                } else {
                    setLastError(res.error || "Unknown error");
                }
            } catch (e: any) {
                console.error(e);
                setLastError(e.message);
            }
        };

        poll(); // Initial call
        const interval = setInterval(poll, 4000);
        return () => clearInterval(interval);
    }, [ticket, clinic.slug, clinic.logo, activeLang]);

    // Polling for Language ONLY (Landing Page - No Ticket)
    useEffect(() => {
        if (ticket) return; // handled above

        const pollLang = async () => {
            const res = await getClinicLanguage(clinic.slug);
            console.log("Polling Language:", res);
            if (res.success && res.language && res.language !== activeLang) {
                setActiveLang(res.language);
            }
        }

        const interval = setInterval(pollLang, 4000);
        return () => clearInterval(interval);
    }, [ticket, clinic.slug, activeLang]);

    const handleAnswer = (qid: string, value: any) => {
        setAnswers(prev => ({ ...prev, [qid]: value }));
    };

    const handleNextStep = () => {
        // Validation could go here
        setStep(2);
    };

    const handleTakeTicket = async () => {
        // Attempt to enable notifications on click
        enableNotifications();

        if (clinic.questions && clinic.questions.length > 0 && step === 1) {
            setStep(2); // Show questions
            return;
        }

        // VALIDATION
        if (clinic.questions && clinic.questions.length > 0) {
            const missing = clinic.questions.filter((q: any) => q.required && !answers[q.id]);
            if (missing.length > 0) {
                alert(`Veuillez répondre aux questions obligatoires : ${missing.map((q: any) => q.text).join(", ")}`);
                return;
            }
        }

        setActionLoading(true);
        try {
            // Transform answers to readable format if needed, or just send raw
            // Mapping ID to Question Text for easier display? Or saving as { question: answer }
            const formattedAnswers = clinic.questions?.reduce((acc: any, q: any) => {
                acc[q.text] = answers[q.id];
                return acc;
            }, {});

            const res = await createTurn(clinic.slug, undefined, formattedAnswers);
            if (res.success && res.turn) {
                // ... (set ticket code)
                const newTicket = {
                    turnId: res.turn.id,
                    ticketCode: res.turn.ticketCode,
                    clinicSlug: clinic.slug,
                };
                localStorage.setItem(`turn_${clinic.slug}`, JSON.stringify(newTicket));
                setTicket(newTicket);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleCancel = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        localStorage.removeItem(`turn_${clinic.slug}`);
        setTicket(null);
        setStatusData(null);
        setShowCancelConfirm(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    // --- WELCOME STATE ---
    if (!ticket) {
        // QUESTIONNAIRE STEP
        if (clinic.questions && clinic.questions.length > 0 && step === 2) {


            return (
                <div dir={t.dir} className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 p-8 relative z-10">

                        <div className="flex items-center gap-3 mb-8 text-start">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 leading-tight">{t.welcome}</h2>
                                <p className="text-xs text-slate-400">{t.subtitle}</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8 text-start">
                            {clinic.questions.map((q: any) => (
                                <div key={q.id} className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mr-1 group-focus-within:text-primary transition-colors">
                                        {q.text} {q.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {q.type === "TEXT" ? (
                                        <input
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300"
                                            placeholder={q.placeholder || t.placeholder}
                                            value={answers[q.id] || ""}
                                            onChange={(e) => handleAnswer(q.id, e.target.value)}
                                            autoFocus={true}
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {JSON.parse(q.options || "[]").map((opt: string) => (
                                                <button
                                                    key={opt}
                                                    className={clsx(
                                                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200",
                                                        answers[q.id] === opt
                                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105"
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                    onClick={() => handleAnswer(q.id, opt)}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium text-slate-500"
                                onClick={() => setStep(1)}
                            >
                                {t.back}
                            </Button>
                            <Button
                                className="h-12 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                                onClick={handleTakeTicket}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.confirm}
                            </Button>
                        </div>
                    </div>
                    <p className="mt-8 text-slate-400 text-xs">{t.powered}</p>
                </div>
            );
        }

        // DEFAULT LANDING
        return (
            <div dir={t.dir} className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">

                <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500 p-8 text-center relative z-10 border border-slate-100">

                    {/* LOGO */}
                    {clinic.logo ? (
                        <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 border border-slate-100">
                                <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-contain" />
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <span className="text-3xl font-bold text-primary">
                                    {clinic.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}

                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {clinic.name}
                    </h1>
                    <p className="text-slate-500 text-sm mb-8 px-4 leading-relaxed">
                        {t.scan}
                    </p>

                    <Button
                        size="lg"
                        className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        onClick={() => {
                            if (clinic.questions && clinic.questions.length > 0) {
                                setStep(2);
                            } else {
                                handleTakeTicket();
                            }
                        }}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <Loader2 className="animate-spin ml-2" /> : <Ticket className="ml-2 w-5 h-5" />}
                        {t.book}
                    </Button>
                </div>
                <p className="mt-8 text-slate-400 text-xs">{t.powered}</p>
            </div>
        );
    }

    // --- WAITING / STATUS STATE ---
    const currentTurn = statusData?.turn;
    const peopleAhead = statusData?.peopleAhead || 0;
    const estWait = statusData?.estimatedTime || 0;

    const isReady = currentTurn?.status === 'ACTIVE';
    const isDone = currentTurn?.status === 'DONE';
    const isCancelled = currentTurn?.status === 'CANCELLED';

    return (
        <div dir={t.dir} className="min-h-screen bg-slate-50 p-6 flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <span className="font-bold text-slate-700">{clinic.name}</span>
                <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-mono text-slate-500">
                    #{ticket.ticketCode}
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl shadow-indigo-100/50 border border-white text-center relative overflow-hidden ring-1 ring-slate-100">

                    {/* DECORATIVE ELEMENTS */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                    {isReady && <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500 animate-pulse z-20" />}
                    {isCancelled && <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 z-20" />}

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentTurn?.status || 'loading'}
                        className="py-8 relative z-10"
                    >
                        {/* STATUS ICON/TEXT */}
                        <div className="mb-8">
                            {isReady ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-bold animate-pulse">
                                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                                    {t.yourTurn}
                                </span>
                            ) : isDone ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {t.finished}
                                </span>
                            ) : isCancelled ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {t.cancelled}
                                </span>
                            ) : (
                                <span className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">{t.status}</span>
                            )}
                        </div>

                        {/* TICKET NUMBER */}
                        <div className={clsx("text-8xl font-black mb-4 tracking-tighter tabular-nums",
                            isReady ? "text-transparent bg-clip-text bg-gradient-to-br from-green-500 to-emerald-700 filter drop-shadow-sm" :
                                isCancelled ? "text-slate-300 line-through" :
                                    "text-slate-800"
                        )}>
                            {ticket.ticketCode}
                        </div>

                        {/* META INFO */}
                        {!isReady && !isDone && !isCancelled && (
                            <div className="mt-10 flex justify-center gap-10 border-t border-slate-100 pt-8">
                                <div className="text-center group">
                                    <div className="text-3xl font-bold text-slate-700 group-hover:text-primary transition-colors">{peopleAhead}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t.peopleAhead}</div>
                                </div>
                                <div className="w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                                <div className="text-center group">
                                    <div className="text-3xl font-bold text-primary group-hover:text-indigo-600 transition-colors">
                                        {peopleAhead === 0 ? t.impending : `~${estWait}min`}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t.waitTime}</div>
                                </div>
                            </div>
                        )}

                        {isReady && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 text-green-700 bg-green-50/50 p-4 rounded-2xl text-sm font-medium border border-green-100/50"
                            >
                                {t.pleaseGo}
                            </motion.p>
                        )}

                    </motion.div>
                </div>
            </main>

            <footer className="mt-auto pt-8 max-w-md mx-auto w-full space-y-4">
                <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex items-center justify-between pl-4 pr-1.5">
                    <div className="flex items-center gap-3">
                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            permissionStatus === 'granted' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                        )}>
                            <div className={clsx("w-2 h-2 rounded-full", permissionStatus === 'granted' ? "bg-green-500 animate-pulse" : "bg-slate-400")} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t.notifications}</span>
                            {permissionStatus === 'granted' ? (
                                <span className="text-xs font-bold text-green-600">{t.enabled}</span>
                            ) : permissionStatus === 'denied' ? (
                                <span className="text-xs font-bold text-red-500">{t.blocked}</span>
                            ) : (
                                <span className="text-xs font-medium text-slate-500">{t.disabled}</span>
                            )}
                        </div>
                    </div>
                    {permissionStatus !== 'granted' && (
                        <Button
                            size="sm"
                            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200"
                            onClick={enableNotifications}
                        >
                            {t.enable}
                        </Button>
                    )}
                </div>

                {!isDone && !isCancelled && (
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50 h-12 rounded-xl"
                        onClick={handleCancel}
                    >
                        {t.cancelTicket}
                    </Button>
                )}
                {(isDone || isCancelled) && (
                    <Button
                        className="w-full h-14 text-lg font-medium rounded-2xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-indigo-600"
                        onClick={() => {
                            setTicket(null);
                        }}
                    >
                        {t.close}
                    </Button>
                )}

                <p className="mt-8 text-slate-400 text-xs">{t.powered}</p>

            </footer>

            {/* CANCEL CONFIRMATION MODAL */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCancelConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Ticket className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.cancelTicket} ?</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                    {isRTL ? "هل تريد حقاً مغادرة قائمة الانتظار؟ ستفقد دورك ولن تتمكن من استعادته." : "Are you sure you want to leave the queue? You will lose your spot."}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600"
                                        onClick={() => setShowCancelConfirm(false)}
                                    >
                                        {t.back}
                                    </Button>
                                    <Button
                                        className="rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200"
                                        onClick={confirmCancel}
                                    >
                                        {t.confirm}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div >
    );
}
