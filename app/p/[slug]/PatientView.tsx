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

    // Notification Sound (Simple Chime)
    const playNotificationSound = () => {
        try {
            const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3"); // Simple pop sound
            audio.play().catch(e => console.error("Audio play failed", e));

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Request permissions on load
    useEffect(() => {
        if (typeof window !== 'undefined' && "Notification" in window && Notification.permission !== "granted") {
            try {
                Notification.requestPermission();
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

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
                        playNotificationSound();
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification("C'est votre tour!", {
                                body: "Veuillez vous rendre au guichet.",
                                icon: clinic.logo || undefined
                            });
                        }
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
    }, [ticket, clinic.slug, clinic.logo]); // Add clinic.logo dep

    const handleAnswer = (qid: string, value: any) => {
        setAnswers(prev => ({ ...prev, [qid]: value }));
    };

    const handleNextStep = () => {
        // Validation could go here
        setStep(2);
    };

    const handleTakeTicket = async () => {
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

            <main className="flex-1 flex flex-col justify-center">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">

                    {isReady && <div className="absolute top-0 left-0 w-full h-2 bg-green-500 animate-pulse" />}
                    {isCancelled && <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />}

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentTurn?.status || 'loading'}
                        className="py-6"
                    >
                        {/* STATUS ICON/TEXT */}
                        <div className="mb-6">
                            {isReady ? (
                                <span className="text-green-500 font-bold text-2xl animate-pulse">حان دورك!</span>
                            ) : isDone ? (
                                <span className="text-slate-400 font-medium">انتهت الزيارة</span>
                            ) : isCancelled ? (
                                <span className="text-red-400 font-medium">تم إلغاء التذكرة</span>
                            ) : (
                                <span className="text-slate-400 font-medium uppercase tracking-widest text-xs">الحالة الحالية</span>
                            )}
                        </div>

                        {/* TICKET NUMBER */}
                        <div className={clsx("text-6xl font-bold mb-2 tracking-tighter",
                            isReady ? "text-green-600" : isCancelled ? "text-slate-300 line-through" : "text-slate-800"
                        )}>
                            {ticket.ticketCode}
                        </div>

                        {/* META INFO */}
                        {!isReady && !isDone && !isCancelled && (
                            <div className="mt-8 flex justify-center gap-8 border-t border-dashed border-slate-100 pt-8">
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{peopleAhead}</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">أشخاص قبلك</div>
                                </div>
                                <div className="w-px bg-slate-100" />
                                <div>
                                    <div className="text-2xl font-bold text-primary">
                                        {peopleAhead === 0 ? "وشيك" : `~${estWait}د`}
                                    </div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">الوقت المقدر</div>
                                </div>
                            </div>
                        )}

                        {isReady && (
                            <p className="mt-4 text-green-700 bg-green-50 p-4 rounded-xl text-sm border border-green-100">
                                يرجى التوجه إلى الاستقبال أو مكتب الطبيب فوراً.
                            </p>
                        )}

                    </motion.div>
                </div>
            </main>

            <footer className="mt-8">
                {!isDone && !isCancelled && (
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={handleCancel}
                    >
                        إلغاء التذكرة
                    </Button>
                )}
                {(isDone || isCancelled) && (
                    <Button className="w-full" onClick={() => {
                        localStorage.removeItem(`turn_${clinic.slug}`);
                        setTicket(null);
                    }}>
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
