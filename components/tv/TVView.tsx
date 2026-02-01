"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { getQueueStateForPatient } from "@/app/actions/patient";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users } from "lucide-react";
import clsx from "clsx";

type TVViewProps = {
    clinic: {
        name: string;
        slug: string;
        logo?: string | null;
        ticketLanguage: string;
    };
};

export function TVView({ clinic }: TVViewProps) {
    const [data, setData] = useState<any>(null);
    const [time, setTime] = useState(new Date());

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Polling
    useEffect(() => {
        const fetchState = async () => {
            try {
                const res = await getQueueStateForPatient(clinic.slug);
                if (res.success) {
                    setData(res);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchState();
        const interval = setInterval(fetchState, 5000);
        return () => clearInterval(interval);
    }, [clinic.slug]);

    const activeTurn = data?.activeTurn;
    const queue = data?.queue || [];
    const nextInLine = queue.slice(0, 3);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/p/${clinic.slug}` : "";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
            {/* HEADER */}
            <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 shadow-sm z-10">
                <div className="flex items-center gap-6">
                    {clinic.logo ? (
                        <img src={clinic.logo} alt={clinic.name} className="h-16 w-auto object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                            {clinic.name.charAt(0)}
                        </div>
                    )}
                    <h1 className="text-4xl font-bold text-slate-800">{clinic.name}</h1>
                </div>
                <div className="text-3xl font-mono font-medium text-slate-500 bg-slate-100 px-6 py-3 rounded-xl">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            <main className="flex-1 grid grid-cols-12 gap-8 p-12">
                {/* LEFT: ACTIVE NUMBER */}
                <div className="col-span-8 flex flex-col">
                    <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-white relative overflow-hidden flex flex-col items-center justify-center text-center p-12 ring-1 ring-slate-200">
                        {/* Background Decor */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />

                        <h2 className="text-4xl font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Numéro Actuel</h2>

                        <AnimatePresence mode="wait">
                            {activeTurn ? (
                                <motion.div
                                    key={activeTurn.ticketCode}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="relative z-10"
                                >
                                    <div className="text-[18rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-600 leading-none filter drop-shadow-xl tracking-tighter">
                                        {activeTurn.ticketCode}
                                    </div>
                                    <div className="text-5xl font-medium text-slate-600 mt-8 animate-pulse">
                                        Guichet 1
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-6xl text-slate-300 font-bold"
                                >
                                    --
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT: NEXT LIST & QR */}
                <div className="col-span-4 flex flex-col gap-8">
                    {/* NEXT IN LINE */}
                    <div className="flex-1 bg-white/80 backdrop-blur rounded-[2.5rem] p-8 border border-slate-200 shadow-xl flex flex-col">
                        <h3 className="text-2xl font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Users size={32} /> Suivants
                        </h3>

                        <div className="flex-1 flex flex-col gap-4">
                            {nextInLine.length > 0 ? (
                                nextInLine.map((turn: any, index: number) => (
                                    <div key={turn.id} className="bg-slate-50 rounded-2xl p-6 flex items-center justify-between border border-slate-100">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-full bg-white text-2xl font-bold text-slate-400 flex items-center justify-center shadow-sm border border-slate-100">
                                                {index + 1}
                                            </div>
                                            <span className="text-5xl font-bold text-slate-700">{turn.ticketCode}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-400 italic text-xl">
                                    Aucun patient en attente
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QR CODE */}
                    <div className="h-80 bg-indigo-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden shadow-2xl">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30" />

                        <div className="bg-white p-3 rounded-2xl shadow-lg mb-4">
                             <div style={{ height: "auto", margin: "0 auto", maxWidth: 140, width: "100%" }}>
                                <QRCode
                                    size={256}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={url}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">Scannez pour prendre un ticket</h3>
                    </div>
                </div>
            </main>
        </div>
    );
}
