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
                <div className={clsx(dir === 'rtl' ? "lg:order-2 lg:text-right" : "lg:text-left", "text-center lg:text-left")}>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                        Un tableau de bord intuitif.
                        <br />
                        <span className="inline-block bg-emerald-100 text-emerald-800 px-2 mt-2">Aucune formation nécessaire.</span>
                    </h2>
                    <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                        Gérez votre file d'attente en quelques clics. Informez vos patients en temps réel et réduisez significativement les rendez-vous manqués, sans complexité.
                    </p>
                    <ul className={clsx("space-y-6 mb-8", dir === 'rtl' ? "pr-0" : "pl-0")}>
                        <li className="flex items-start gap-4 text-slate-700">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Mise à jour en temps réel</h4>
                                <p className="text-slate-500 text-sm">Les patients savent exactement quand se présenter.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4 text-slate-700">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Notifications automatiques</h4>
                                <p className="text-slate-500 text-sm">Moins d'attente et moins d'absences.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Desktop Dashboard Mockup */}
                <div className={clsx("relative perspective-1000", dir === 'rtl' ? "lg:order-1" : "")}>
                    {/* Background Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-50 rounded-full blur-3xl -z-10 opacity-70" />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden relative w-full aspect-[16/10] flex flex-col"
                    >
                        {/* Status Bar / Window Header */}
                        <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>

                        {/* App Body */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-16 md:w-48 bg-slate-50 border-r border-slate-100 flex flex-col p-4 gap-4 hidden md:flex">
                                <div className="font-bold text-emerald-600 flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 bg-emerald-600 rounded-md"></div>
                                    <span className="hidden md:block">ClinicFlow</span>
                                </div>
                                {['Tableau de bord', 'File d\'attente', 'Rendez-vous', 'Notifications', 'Paramètres'].map((item, i) => (
                                    <div key={i} className={clsx("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium", i === 0 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}>
                                        <div className="w-4 h-4 bg-current opacity-20 rounded-sm" />
                                        <span className="hidden md:block">{item}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 bg-slate-50/30 p-4 md:p-6 overflow-hidden flex flex-col gap-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800">Tableau de bord</h3>
                                        <p className="text-xs text-slate-400">Temps réel</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200" />
                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs">Dr</div>
                                    </div>
                                </div>

                                <div className="flex gap-4 h-full">
                                    {/* Left Panel: Queue */}
                                    <div className="flex-[2] bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-sm text-slate-700">File d'attente active</h4>
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">En direct</span>
                                        </div>
                                        {[
                                            { name: "Youssef I.", time: "10:15", status: "En cours", color: "bg-emerald-100 text-emerald-700" },
                                            { name: "Sarah K.", time: "10:30", status: "Patient", color: "bg-slate-100 text-slate-600" },
                                            { name: "Ahmed B.", time: "10:45", status: "Patient", color: "bg-slate-100 text-slate-600" },
                                            { name: "Leila A.", time: "11:00", status: "Patient", color: "bg-slate-100 text-slate-600" },
                                        ].map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{p.name[0]}</div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-700">{p.name}</div>
                                                        <div className="text-[10px] text-slate-400">{p.time}</div>
                                                    </div>
                                                </div>
                                                <span className={clsx("text-[10px] font-bold px-2 py-1 rounded-md", p.color)}>{p.status}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Panel: Analytics/Notifications */}
                                    <div className="flex-1 flex flex-col gap-4 hidden lg:flex">
                                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex-1">
                                            <h4 className="font-bold text-xs text-slate-700 mb-3">Notifications envoyées</h4>
                                            <div className="space-y-2">
                                                {[1, 2].map((_, i) => (
                                                    <div key={i} className="bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                                                        <div className="flex gap-2 items-start">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                                                            <div className="space-y-1">
                                                                <div className="h-1.5 w-16 bg-blue-200 rounded-full" />
                                                                <div className="h-1.5 w-24 bg-blue-100 rounded-full" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex-1">
                                            <h4 className="font-bold text-xs text-slate-700 mb-3">Analytique</h4>
                                            <div className="flex items-end gap-2 h-16 mt-2 ml-1">
                                                {[40, 70, 45, 90, 60].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-emerald-100 rounded-t-sm relative group">
                                                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-400 rounded-t-sm transition-all group-hover:bg-emerald-500" style={{ height: `${h}%` }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
