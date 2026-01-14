"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, Bell, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface Patient {
    id: string;
    name: string;
    time: string;
    status: 'waiting' | 'active' | 'completed';
    img?: string;
}

const mockPatients: Patient[] = [
    { id: '1', name: "Amine Benali", time: "10:15", status: 'active' },
    { id: '2', name: "Sarah Kabbaj", time: "10:30", status: 'waiting' },
    { id: '3', name: "Youssef Idrissi", time: "10:45", status: 'waiting' },
    { id: '4', name: "Leila Alami", time: "11:00", status: 'waiting' },
];

export const DashboardPreview = () => {
    const { t, dir } = useLanguage();
    const [patients, setPatients] = useState<Patient[]>(mockPatients);
    const [nextPatientId, setNextPatientId] = useState<string>('5');

    const handleNext = () => {
        setPatients((prev) => {
            const [active, ...rest] = prev;
            // Simulate moving active to history and bringing next
            const newPatient: Patient = {
                id: nextPatientId,
                name: `Patient ${nextPatientId}`,
                time: "11:15",
                status: 'waiting'
            };
            setNextPatientId((parseInt(nextPatientId) + 1).toString());

            return [
                ...rest.map((p, i) => i === 0 ? { ...p, status: 'active' as const } : p),
                newPatient
            ];
        });
    };

    const activePatient = patients[0];

    return (
        <section className="py-24 bg-surface relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                {/* Text Content */}
                <div className={clsx(dir === 'rtl' ? "lg:order-2 lg:text-right" : "lg:text-left", "text-center")}>
                    <h2 className="text-3xl md:text-4xl font-bold text-ink mb-6 leading-tight">
                        Un tableau de bord intuitif.
                        <br />
                        <span className="text-primary">Zéro formation requise.</span>
                    </h2>
                    <p className="text-lg text-ink-light mb-8 max-w-lg mx-auto lg:mx-0">
                        Gérez votre file d'attente d'un simple clic. Informez vos patients en temps réel et réduisez les rendez-vous manqués.
                    </p>
                    <ul className={clsx("space-y-4 mb-8", dir === 'rtl' ? "pr-0" : "pl-0")}>
                        <li className="flex items-center gap-3 text-ink">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <RefreshCw size={18} />
                            </div>
                            <span className="font-medium">Mise à jour en temps réel</span>
                        </li>
                        <li className="flex items-center gap-3 text-ink">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Bell size={18} />
                            </div>
                            <span className="font-medium">Notifications automatiques</span>
                        </li>
                    </ul>
                </div>

                <div className={clsx("relative perspective-1000", dir === 'rtl' ? "lg:order-1" : "")}>
                    <motion.div
                        initial={{ opacity: 0, rotateX: 5, y: 30 }}
                        whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                        transition={{ duration: 1 }}
                        className="bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[8px] border-white ring-1 ring-slate-100 overflow-hidden relative max-w-sm mx-auto"
                    >
                        {/* Status Bar */}
                        <div className="h-10 bg-slate-50 flex items-center justify-between px-6 border-b border-slate-100 text-[10px] font-bold text-slate-900">
                            <span>9:41</span>
                            <div className="flex gap-1.5">
                                <div className="w-4 h-2.5 bg-slate-800 rounded-[1px]" />
                                <div className="w-0.5 h-1 bg-slate-800" />
                            </div>
                        </div>

                        {/* App Header */}
                        <div className="p-5 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                            <div className="font-bold text-xl text-slate-800">ClinicFlow</div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <User size={16} className="text-slate-600" />
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-ink">File d'attente</h3>
                                <span className="text-sm text-ink-light bg-slate-100 px-3 py-1 rounded-full">
                                    {patients.length} patients
                                </span>
                            </div>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {patients.slice(0, 4).map((patient, index) => (
                                        <motion.div
                                            layout
                                            key={patient.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0, scale: index === 0 ? 1 : 0.98 }}
                                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className={clsx(
                                                "relative p-4 rounded-xl flex items-center justify-between border transition-all",
                                                index === 0
                                                    ? "bg-primary/5 border-primary/20 shadow-sm"
                                                    : "bg-white border-slate-100 opacity-60"
                                            )}
                                        >
                                            {index === 0 && (
                                                <motion.div
                                                    layoutId="active-indicator"
                                                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"
                                                />
                                            )}

                                            <div className="flex items-center gap-4">
                                                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", index === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-ink">{patient.name}</div>
                                                    <div className="text-xs text-ink-light flex items-center gap-1">
                                                        <Clock size={12} /> {patient.time}
                                                    </div>
                                                </div>
                                            </div>

                                            {index === 0 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-primary px-2 py-1 bg-white rounded-md border border-primary/10">
                                                        En cours
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Controls */}
                            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 pb-8">
                                <button
                                    onClick={handleNext}
                                    className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-emerald-400 to-teal-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
                                >
                                    <span className="text-sm">Suivant</span>
                                    <ChevronRight size={16} className="opacity-80" />
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex flex-col items-center justify-center gap-1 bg-orange-50 text-orange-600 border border-orange-100 py-3 rounded-2xl font-bold hover:bg-orange-100 transition-colors">
                                        <span className="text-[10px]">Retarder</span>
                                        <Clock size={14} />
                                    </button>
                                    <button className="flex flex-col items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-100 py-3 rounded-2xl font-bold hover:bg-red-100 transition-colors">
                                        <span className="text-[10px]">Urgence</span>
                                        <AlertCircle size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Decorative blurred feedback */}
                    <motion.div
                        key={activePatient.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden md:block" // Hidden on small mobile to avoid cover
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Bell size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Notification envoyée à</div>
                                <div className="font-bold text-sm text-ink">{activePatient.name}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
