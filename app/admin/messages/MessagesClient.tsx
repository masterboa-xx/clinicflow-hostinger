"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Search, Inbox, Trash2, Eye, CheckCircle2,
    MoreHorizontal, Calendar, MapPin, User, Mail, Phone,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { updateSubmissionStatus, deleteSubmission } from "@/app/actions/contact";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { toast } from "sonner";

interface Submission {
    id: string;
    createdAt: Date;
    type: string;
    name: string;
    email: string;
    phone?: string | null;
    status: string;
    message?: string | null;
    clinicName?: string | null;
    city?: string | null;
    preferredSlot?: string | null;
}

export function MessagesClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [filter, setFilter] = useState("ALL"); // ALL, UNREAD, READ
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const filtered = submissions.filter(s => {
        const matchesSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            s.type.toLowerCase().includes(search.toLowerCase());

        if (filter === "ALL") return matchesSearch;
        return matchesSearch && s.status === filter;
    });

    const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        const res = await deleteSubmission(deleteId);
        if (res.success) {
            setSubmissions(prev => prev.filter(s => s.id !== deleteId));
            if (selectedId === deleteId) setSelectedId(null);
            toast.success("Message supprimé");
        } else {
            toast.error("Erreur lors de la suppression");
        }
        setIsDeleteModalOpen(false);
        setDeleteId(null);
    };

    const handleStatus = async (id: string, newStatus: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const res = await updateSubmissionStatus(id, newStatus);
        if (res.success) {
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            if (newStatus === 'READ' && selectedId === id) {
                // Update locally selected item status too if needed
            }
        }
    };

    const selectedSubmission = submissions.find(s => s.id === selectedId);

    return (
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Supprimer le message"
                description="Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
                variant="destructive"
            />

            {/* List */}
            <div className={clsx(
                "lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden",
                selectedId ? "hidden lg:flex" : "flex h-full"
            )}>
                {/* Search & Filter */}
                <div className="p-4 border-b border-slate-100 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Rechercher..."
                            className="w-full pl-10 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'UNREAD', 'READ'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                    filter === f
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                            >
                                {f === 'ALL' ? 'TOUS' : f === 'UNREAD' ? 'NON LUS' : 'LUS'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Inbox size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                            <span className="text-sm">Aucun message trouvé</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filtered.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => {
                                        setSelectedId(s.id);
                                        if (s.status === 'UNREAD') handleStatus(s.id, 'READ');
                                    }}
                                    className={clsx(
                                        "p-4 cursor-pointer hover:bg-slate-50 transition-colors relative group",
                                        selectedId === s.id && "bg-slate-50",
                                        s.status === 'UNREAD' ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-transparent"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-800 text-sm truncate pr-2">{s.name}</span>
                                        <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                                            {format(new Date(s.createdAt), "dd MMM", { locale: fr })}
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-2">
                                        <span className={clsx(
                                            "capitalize px-1.5 py-0.5 rounded text-[10px]",
                                            s.type === 'Demo' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {s.type}
                                        </span>
                                        {s.city && <span>• {s.city}</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2">
                                        {s.message || "Aucun contenu..."}
                                    </p>

                                    <button
                                        onClick={(e) => handleDeleteClick(s.id, e)}
                                        className="absolute right-2 bottom-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className={clsx(
                "lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col p-6 h-full",
                !selectedId && "hidden lg:flex items-center justify-center text-slate-400 bg-slate-50/50",
                selectedId ? "flex fixed inset-0 z-50 lg:static" : "hidden"
            )}>
                {!selectedSubmission ? (
                    <div className="text-center">
                        <Mail size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
                        <p>Sélectionnez un message pour voir les détails</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedSubmission.name}</h2>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} />
                                        <span>{selectedSubmission.email}</span>
                                    </div>
                                    {selectedSubmission.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} />
                                            <span>{selectedSubmission.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="lg:hidden" onClick={() => setSelectedId(null)}>
                                    Retour
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={(e: any) => handleDeleteClick(selectedSubmission.id, e)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6">
                            {/* Meta Card */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Type</span>
                                    <p className="font-medium text-slate-800">{selectedSubmission.type}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                                    <p className="font-medium text-slate-800">
                                        {format(new Date(selectedSubmission.createdAt), "PPP p", { locale: fr })}
                                    </p>
                                </div>
                                {selectedSubmission.type === 'Demo' && (
                                    <>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase">Clinique</span>
                                            <p className="font-medium text-slate-800">{selectedSubmission.clinicName}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase">Créneau</span>
                                            <p className="font-medium text-slate-800">{selectedSubmission.preferredSlot}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Message</span>
                                <div className="bg-white p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedSubmission.message}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
