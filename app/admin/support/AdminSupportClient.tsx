"use client";

import { useState, useRef, useEffect } from "react";
import { SupportTicket, TicketMessage } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Send, CheckCircle, XCircle, User, Clock, RefreshCw, Trash2, Zap } from "lucide-react";
import { clsx } from "clsx";
import { sendMessage, updateTicketStatus, getTicketDetails, getAllTickets, deleteTicket } from "@/app/actions/support";
import { activateClinic } from "@/app/actions/admin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// Extended Ticket type to include Clinic info
type TicketWithDetails = SupportTicket & {
    clinic: { name: string, logo?: string | null, email?: string | null }; // adjusted based on schema
    _count?: { messages: number };
    messages?: TicketMessage[];
};

export function AdminSupportClient({ initialTickets }: { initialTickets: TicketWithDetails[] }) {
    // Separate tickets by status
    const [tickets, setTickets] = useState<TicketWithDetails[]>(initialTickets);
    const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
    const [userToDeleteTicket, setUserToDeleteTicket] = useState<string | null>(null);

    // Chat
    const [chatMessages, setChatMessages] = useState<TicketMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const [isSending, setIsSending] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [activationModalOpen, setActivationModalOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSelectTicket = async (ticket: TicketWithDetails) => {
        setSelectedTicket(ticket);
        fetchMessages(ticket.id);
    };

    const fetchMessages = async (ticketId: string) => {
        const res = await getTicketDetails(ticketId);
        if (res.success && res.ticket) {
            // @ts-ignore
            setChatMessages(res.ticket.messages);
            // @ts-ignore
            setSelectedTicket(prev => ({ ...prev, ...res.ticket })); // Merge update
        }
    };

    const fetchAllTickets = async () => {
        const res = await getAllTickets();
        if (res.success && res.tickets) {
            // @ts-ignore
            setTickets(res.tickets);
        }
    };

    // Poll for messages
    useEffect(() => {
        if (!selectedTicket) return;
        const interval = setInterval(() => {
            fetchMessages(selectedTicket.id);
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedTicket]);

    // Poll for ticket list
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAllTickets();
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const tempContent = newMessage;
        setNewMessage("");
        setIsSending(true);

        const res = await sendMessage(selectedTicket.id, tempContent);
        setIsSending(false);

        if (res.success && res.message) {
            setChatMessages([...chatMessages, res.message]);
            setTimeout(scrollToBottom, 100);
        } else {
            setNewMessage(tempContent);
        }
    };

    const handleUpdateStatus = async (status: "IN_PROGRESS" | "CLOSED") => {
        if (!selectedTicket) return;
        const res = await updateTicketStatus(selectedTicket.id, status);
        if (res.success && res.ticket) {
            // Update local state
            const updatedTickets = tickets.map(t => t.id === selectedTicket.id ? { ...t, status } : t);
            setTickets(updatedTickets);
            setSelectedTicket({ ...selectedTicket, status });
        }
    };

    const handleActivateClick = () => {
        if (!selectedTicket) return;
        setActivationModalOpen(true);
    };

    const handleConfirmActivation = async () => {
        if (!selectedTicket) return;

        setIsActivating(true);
        const res = await activateClinic(selectedTicket.clinicId, selectedTicket.id);
        setIsActivating(false);

        if (res.success) {
            // Refresh list
            handleUpdateStatus("CLOSED");
            fetchAllTickets(); // Ensure full sync

            // Add system message local optimistic
            setChatMessages(prev => [...prev, {
                id: "temp-" + Date.now(),
                ticketId: selectedTicket.id,
                sender: "ADMIN",
                content: "Votre compte a été activé avec succès ! Vous allez être redirigé vers votre tableau de bord.",
                createdAt: new Date(),
                updatedAt: new Date()
            } as any]);
            setTimeout(scrollToBottom, 50);
        } else {
            alert("Erreur lors de l'activation");
        }
    };

    // Filter tickets
    const activeTickets = tickets.filter(t => t.status !== "CLOSED");
    const closedTickets = tickets.filter(t => t.status === "CLOSED");

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] items-start">
            {/* Left: Ticket List */}
            <div className={clsx(
                "w-full md:w-80 lg:w-96 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full overflow-hidden transition-all duration-300",
                selectedTicket ? "hidden md:flex" : "flex"
            )}>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                    <div>
                        <h2 className="font-bold text-xl text-slate-800 tracking-tight">Support</h2>
                        <div className="flex gap-2 text-xs text-slate-500 mt-1 font-medium">
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{activeTickets.length} actifs</span>
                            <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">{closedTickets.length} archivés</span>
                        </div>
                    </div>
                    <Button onClick={() => fetchAllTickets()} size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <RefreshCw size={18} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {/* Active Section */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 box-content ring-4 ring-emerald-50"></div>
                            En cours
                        </h3>
                        {activeTickets.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm font-medium">Tout est calme 🌵</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeTickets.map(ticket => (
                                    <TicketItem key={ticket.id} ticket={ticket} isSelected={selectedTicket?.id === ticket.id} onClick={() => handleSelectTicket(ticket)} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Closed Section */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3 pt-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            Historique
                        </h3>
                        {closedTickets.length === 0 ? (
                            <p className="text-xs text-slate-400 px-3 italic">Aucun ticket fermé.</p>
                        ) : (
                            <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                                {closedTickets.map(ticket => (
                                    <TicketItem key={ticket.id} ticket={ticket} isSelected={selectedTicket?.id === ticket.id} onClick={() => handleSelectTicket(ticket)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Chat / Details */}
            <div className={clsx(
                "flex-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-full overflow-hidden flex flex-col relative w-full transition-all duration-300",
                !selectedTicket ? "hidden md:flex" : "flex"
            )}>
                {/* Mobile Back Button */}
                {selectedTicket && (
                    <div className="md:hidden p-3 bg-white border-b border-slate-50 relative z-20">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)} className="gap-2 text-slate-600 font-medium">
                            {/* @ts-ignore */}
                            <XCircle size={18} /> Retour à la liste
                        </Button>
                    </div>
                )}

                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center shadow-sm/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-200">
                                    {selectedTicket.clinic.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-3">
                                        {selectedTicket.title}
                                        <Badge status={selectedTicket.status} />
                                    </h2>
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-0.5">
                                        <span className="flex items-center gap-1.5"><User size={14} className="text-indigo-400" /> {selectedTicket.clinic.name}</span>
                                        {selectedTicket.clinic.email && (
                                            <span className="hidden sm:inline text-slate-400">({selectedTicket.clinic.email})</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {selectedTicket.status === "OPEN" && (
                                    <Button onClick={() => handleUpdateStatus("IN_PROGRESS")} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 shadow-lg shadow-emerald-100 rounded-xl font-semibold px-4">
                                        <CheckCircle size={18} /> Accepter
                                    </Button>
                                )}
                                {selectedTicket.status !== "CLOSED" && (
                                    <Button onClick={() => handleUpdateStatus("CLOSED")} size="sm" variant="ghost" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl gap-2 font-medium">
                                        <XCircle size={18} /> Fermer
                                    </Button>
                                )}
                                {selectedTicket.status !== "CLOSED" && (
                                    <Button
                                        onClick={handleActivateClick}
                                        disabled={isActivating}
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200 rounded-xl font-bold px-4"
                                    >
                                        {isActivating ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                                        Activer Pro
                                    </Button>
                                )}
                                <Button
                                    onClick={() => setUserToDeleteTicket(selectedTicket.id)}
                                    size="icon"
                                    variant="ghost"
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Delete Confirmation Modal */}
                        <ConfirmModal
                            isOpen={!!userToDeleteTicket}
                            onClose={() => setUserToDeleteTicket(null)}
                            onConfirm={async () => {
                                if (userToDeleteTicket) {
                                    const res = await deleteTicket(userToDeleteTicket);
                                    if (res.success) {
                                        const updated = tickets.filter(t => t.id !== userToDeleteTicket);
                                        setTickets(updated);
                                        setSelectedTicket(null);
                                    }
                                }
                            }}
                            title="Supprimer le ticket ?"
                            description={
                                <span>
                                    Êtes-vous sûr de vouloir supprimer ce ticket définitivement ?
                                    <br /><span className="font-bold text-red-500">Cette action est irréversible.</span>
                                </span>
                            }
                            confirmText="Supprimer"
                            cancelText="Annuler"
                            variant="destructive"
                            icon={<Trash2 size={24} />}
                        />

                        {/* Activation Confirmation Modal */}
                        <ConfirmModal
                            isOpen={activationModalOpen}
                            onClose={() => setActivationModalOpen(false)}
                            onConfirm={handleConfirmActivation}
                            title="Confirmer l'activation ?"
                            description={
                                <span>
                                    Vous êtes sur le point d'activer le compte <strong>PRO</strong> pour cette clinique.
                                    <br />
                                    Le ticket sera automatiquement fermé et l'utilisateur redirigé.
                                </span>
                            }
                            confirmText="Confirmer Activation"
                            cancelText="Annuler"
                            variant="default"
                            icon={<Zap size={24} fill="currentColor" />}
                        />

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
                            {/* Date Separator (Mockup based on created at) */}
                            <div className="flex justify-center my-4">
                                <span className="bg-slate-200/60 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {format(new Date(selectedTicket.createdAt), "d MMMM yyyy", { locale: fr })}
                                </span>
                            </div>

                            {/* Initial Description */}
                            <div className="flex justify-start px-2">
                                <div className="group relative max-w-[85%]">
                                    <div className="bg-white p-5 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 text-slate-700 relative z-10">
                                        <p className="text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            {selectedTicket.clinic.name}
                                        </p>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-2 ml-2 block font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        {format(new Date(selectedTicket.createdAt), "HH:mm", { locale: fr })}
                                    </span>
                                </div>
                            </div>

                            {/* Chat logic: ADMIN is "ME" here */}
                            {chatMessages.map((msg) => {
                                const isMe = msg.sender === "ADMIN";
                                return (
                                    <div key={msg.id} className={clsx("flex px-2", isMe ? "justify-end" : "justify-start")}>
                                        <div className={clsx("group relative max-w-[85%]", isMe ? "items-end flex flex-col" : "")}>
                                            <div className={clsx(
                                                "p-4 rounded-3xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed transition-all",
                                                isMe
                                                    ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-200"
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-slate-100"
                                            )}>
                                                {!isMe && (
                                                    <p className="text-[10px] font-bold text-indigo-600 mb-1 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        {selectedTicket.clinic.name}
                                                    </p>
                                                )}
                                                {msg.content}
                                            </div>
                                            <span className={clsx(
                                                "text-[10px] text-slate-400 mt-1.5 mx-2 block font-medium opacity-0 group-hover:opacity-100 transition-opacity",
                                                isMe && "text-right"
                                            )}>
                                                {format(new Date(msg.createdAt), "HH:mm", { locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        {selectedTicket.status === "OPEN" ? (
                            <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-20 text-center">
                                <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-6 border border-dashed border-slate-300">
                                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-slate-600 mb-3">Le ticket est en attente.</p>
                                    <Button onClick={() => handleUpdateStatus("IN_PROGRESS")} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200">
                                        Commencer la discussion
                                    </Button>
                                    <p className="text-xs text-slate-400 mt-3">L'utilisateur sera notifié que vous avez pris en charge sa demande.</p>
                                </div>
                            </div>
                        ) : selectedTicket.status === "CLOSED" ? (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-2 text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <span className="text-sm font-medium">Ce ticket est fermé.</span>
                            </div>
                        ) : (
                            <div className="p-4 bg-white border-t border-slate-100 relative z-20">
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-end max-w-4xl mx-auto">
                                    <div className="flex-1 bg-slate-50 border-slate-200 border rounded-2xl focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner relative">
                                        <input
                                            className="w-full p-4 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                                            placeholder="Écrivez votre réponse..."
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            disabled={isSending}
                                            autoFocus
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isSending || !newMessage.trim()}
                                        className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 flex items-center justify-center transition-all disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95"
                                    >
                                        {isSending ? <RefreshCw className="animate-spin" size={20} /> : <Send size={22} />}
                                    </Button>
                                </form>
                            </div>
                        )}

                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-100 mb-6 text-indigo-200 animate-in zoom-in duration-500">
                            <MessageSquare size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Centre de Support</h3>
                        <p className="text-slate-500 max-w-sm leading-relaxed">
                            Sélectionnez un ticket dans la liste pour voir les détails et répondre à la clinique.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TicketItem({ ticket, isSelected, onClick }: { ticket: TicketWithDetails, isSelected: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "p-4 rounded-2xl cursor-pointer transition-all border relative group",
                isSelected
                    ? "bg-indigo-50/50 border-indigo-200 shadow-sm ring-1 ring-indigo-200"
                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm"
            )}
        >
            {/* Unread indicator mockup */}
            {ticket.status === "OPEN" && <span className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-200" />}

            <div className="flex items-center gap-2 mb-2">
                <span className={clsx(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase",
                    isSelected ? "bg-indigo-200 text-indigo-700" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"
                )}>
                    {ticket.clinic.name.charAt(0)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-indigo-500 transition-colors">{ticket.clinic.name}</span>
                <Badge status={ticket.status} />
            </div>
            <h3 className={clsx("font-bold text-sm line-clamp-1 mb-1 transition-colors", isSelected ? "text-indigo-900" : "text-slate-800 group-hover:text-indigo-700")}>
                {ticket.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{ticket.description}</p>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium border-t border-slate-50 pt-2 mt-2">
                <span className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                    <Clock size={10} />
                    {format(new Date(ticket.updatedAt), "d MMM, HH:mm", { locale: fr })}
                </span>
            </div>
        </div>
    )
}

function Badge({ status }: { status: string }) {
    const styles = {
        OPEN: "bg-blue-100 text-blue-700 border-blue-200",
        IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
        RESOLVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
        CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
    };
    const labels = {
        OPEN: "Nouveau",
        IN_PROGRESS: "En cours",
        RESOLVED: "Résolu",
        CLOSED: "Fermé",
    };
    // @ts-ignore
    return <span className={clsx("text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide border shadow-sm", styles[status] || styles.CLOSED)}>
        {/* @ts-ignore */}
        {labels[status] || status}
    </span>
}
