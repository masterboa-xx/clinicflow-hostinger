"use client";

import { useState, useEffect, useRef } from "react";
import { createTurn, getMyTurnStatus } from "@/app/actions/patient";
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
    };
};

type StoredTicket = {
    turnId: string;
    ticketCode: string;
    clinicSlug: string;
};

export default function PatientView({ clinic }: PatientViewProps) {
    const [ticket, setTicket] = useState<StoredTicket | null>(null);
    const [statusData, setStatusData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<Record<string, any>>({});

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
            // Unlock audio
            const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3");
            audio.volume = 0;
            await audio.play();
        } catch (e) { console.error(e); }

        if ("Notification" in window) {
            try {
                const permission = await Notification.requestPermission();
                setPermissionStatus(permission);
                if (permission === 'granted') {
                    // Try SW notification first
                    if ('serviceWorker' in navigator) {
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
                    alert("Permissions refusées. Veuillez les activer dans les paramètres de votre navigateur.");
                }
            } catch (e) { console.error(e); }
        } else {
            alert("Votre navigateur ne supporte pas les notifications.");
        }
    };


    // Trigger Notification
    const triggerAlert = async () => {
        try {
            const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3");
            audio.volume = 1;
            audio.play().catch(e => console.error("Audio play failed", e));

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

    // Polling for status
    useEffect(() => {
        if (!ticket) return;

        const poll = async () => {
            try {
                const res = await getMyTurnStatus(ticket.turnId);
                if (res.success && res.turn) {
                    setStatusData(res);

                    // Check for status change to ACTIVE
                    if (res.turn.status === "ACTIVE" && prevStatusRef.current !== "ACTIVE" && prevStatusRef.current !== null) {
                        triggerAlert();
                    }
                    prevStatusRef.current = res.turn.status;

                } else if (res.error === "Turn not found") {
                    // Turn might be removed
                }
            } catch (e) {
                console.error(e);
            }
        };

        poll(); // Initial call
        const interval = setInterval(poll, 4000);
        return () => clearInterval(interval);
    }, [ticket, clinic.slug, clinic.logo]);

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
                <div dir="rtl" className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 p-8 text-right relative z-10">

                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 leading-tight">أخبرنا المزيد</h2>
                                <p className="text-xs text-slate-400">بعض الأسئلة لتحضير زيارتك.</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            {clinic.questions.map((q: any) => (
                                <div key={q.id} className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mr-1 group-focus-within:text-primary transition-colors">
                                        {q.text} {q.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {q.type === "TEXT" ? (
                                        <input
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300"
                                            placeholder={q.placeholder || "إجابتك..."}
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
                                عودة
                            </Button>
                            <Button
                                className="h-12 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                                onClick={handleTakeTicket}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد"}
                            </Button>
                        </div>
                    </div>
                    <p className="mt-8 text-slate-400 text-xs">مشغل بواسطة ClinicFlow</p>
                </div>
            );
        }

        // DEFAULT LANDING
        return (
            <div dir="rtl" className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">

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
                        امسح رمز الاستجابة السريعة أو انقر أدناه للانضمام إلى قائمة الانتظار.
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
                        احجز تذكرة
                    </Button>
                </div>
                <p className="mt-8 text-slate-400 text-xs">مشغل بواسطة ClinicFlow</p>
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
        <div dir="rtl" className="min-h-screen bg-slate-50 p-6 flex flex-col">
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
                                    حان دورك!
                                </span>
                            ) : isDone ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                    انتهت الزيارة
                                </span>
                            ) : isCancelled ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                    تم إلغاء التذكرة
                                </span>
                            ) : (
                                <span className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">الحالة الحالية</span>
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
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">أشخاص قبلك</div>
                                </div>
                                <div className="w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                                <div className="text-center group">
                                    <div className="text-3xl font-bold text-primary group-hover:text-indigo-600 transition-colors">
                                        {peopleAhead === 0 ? "وشيك" : `~${estWait}د`}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">وقت الانتظار</div>
                                </div>
                            </div>
                        )}

                        {isReady && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 text-green-700 bg-green-50/50 p-4 rounded-2xl text-sm font-medium border border-green-100/50"
                            >
                                يرجى التوجه إلى الاستقبال أو مكتب الطبيب فوراً.
                            </motion.p>
                        )}

                    </motion.div>
                </div>
            </main>

            <footer className="mt-auto pt-8 max-w-md mx-auto w-full space-y-4">
                {/* NOTIFICATION CONTROLS - REDESIGNED */}
                <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex items-center justify-between pl-4 pr-1.5">

                    <div className="flex items-center gap-3">
                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            permissionStatus === 'granted' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                        )}>
                            <div className={clsx("w-2 h-2 rounded-full", permissionStatus === 'granted' ? "bg-green-500 animate-pulse" : "bg-slate-400")} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Notifications</span>
                            {permissionStatus === 'granted' ? (
                                <span className="text-xs font-bold text-green-600">Activées et prêtes</span>
                            ) : permissionStatus === 'denied' ? (
                                <span className="text-xs font-bold text-red-500">Bloquées par le navigateur</span>
                            ) : (
                                <span className="text-xs font-medium text-slate-500">Non activées</span>
                            )}
                        </div>
                    </div>

                    {permissionStatus !== 'granted' && (
                        <Button
                            size="sm"
                            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200"
                            onClick={enableNotifications}
                        >
                            Activer
                        </Button>
                    )}
                </div>

                {!isDone && !isCancelled && (
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50 h-12 rounded-xl"
                        onClick={handleCancel}
                    >
                        إلغاء التذكرة
                    </Button>
                )}
                {(isDone || isCancelled) && (
                    <Button
                        className="w-full h-14 text-lg font-medium rounded-2xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-indigo-600"
                        onClick={() => {
                            localStorage.removeItem(`turn_${clinic.slug}`);
                            setTicket(null);
                        }}
                    >
                        إغلاق
                    </Button>
                )}
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
                                <h3 className="text-xl font-bold text-slate-900 mb-2">هل أنت متأكد؟</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                    هل تريد حقاً مغادرة قائمة الانتظار؟ ستفقد دورك ولن تتمكن من استعادته.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600"
                                        onClick={() => setShowCancelConfirm(false)}
                                    >
                                        تراجع
                                    </Button>
                                    <Button
                                        className="rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200"
                                        onClick={confirmCancel}
                                    >
                                        نعم، غادر
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
