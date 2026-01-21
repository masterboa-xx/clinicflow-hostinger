"use client";

import { useState, useRef, useEffect } from "react";
import { SupportTicket, TicketMessage } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Plus, MessageSquare, Send, X, AlertCircle, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { createTicket, sendMessage, getTicketDetails } from "@/app/actions/support";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type TicketWithCounts = SupportTicket & {
    _count?: { messages: number };
    messages?: TicketMessage[];
};

export function SupportClient({ initialTickets }: { initialTickets: TicketWithCounts[] }) {
    const [tickets, setTickets] = useState<TicketWithCounts[]>(initialTickets);
    const [selectedTicket, setSelectedTicket] = useState<TicketWithCounts | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // New Ticket Form
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chat
    const [chatMessages, setChatMessages] = useState<TicketMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newDesc.trim()) return;

        setIsSubmitting(true);
        const res = await createTicket(newTitle, newDesc);
        setIsSubmitting(false);

        if (res.success && res.ticket) {
            setTickets([res.ticket, ...tickets]);
            setIsCreating(false);
            setNewTitle("");
            setNewDesc("");
            // Auto open the new ticket
            handleSelectTicket(res.ticket);
        }
    };

    const handleSelectTicket = async (ticket: TicketWithCounts) => {
        setSelectedTicket(ticket);
        fetchMessages(ticket.id);
    };

    const fetchMessages = async (ticketId: string) => {
        const res = await getTicketDetails(ticketId);
        if (res.success && res.ticket) {
            setChatMessages(res.ticket.messages);
            // Only scroll if we are not reading history? For now, stick to simple scroll
            // setTimeout(scrollToBottom, 100); 
        }
    };

    // Poll for messages when a ticket is selected
    useEffect(() => {
        if (!selectedTicket) return;
        const interval = setInterval(() => {
            fetchMessages(selectedTicket.id);
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedTicket]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const tempContent = newMessage;
        setNewMessage(""); // Optimistic clear
        setIsSending(true);

        const res = await sendMessage(selectedTicket.id, tempContent);
        setIsSending(false);

        if (res.success && res.message) {
            setChatMessages([...chatMessages, res.message]);
            setTimeout(scrollToBottom, 100);
        } else {
            setNewMessage(tempContent); // Restore on error
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full items-start">
            {/* Left: Ticket List */}
            <div className={clsx(
                "w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden",
                selectedTicket ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-slate-700">Mes Tickets</h2>
                    <div className="flex gap-2">
                        <Button onClick={() => window.location.reload()} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                            <RefreshCw size={16} />
                        </Button>
                        <Button onClick={() => setIsCreating(true)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                            <Plus size={16} /> Nouveau
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {tickets.length === 0 ? (
                        <div className="text-center p-8 text-slate-400 text-sm">
                            Aucun ticket pour le moment.
                        </div>
                    ) : (
                        tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => handleSelectTicket(ticket)}
                                className={clsx(
                                    "p-4 rounded-xl cursor-pointer transition-all border",
                                    selectedTicket?.id === ticket.id
                                        ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={clsx("font-bold text-sm line-clamp-1", selectedTicket?.id === ticket.id ? "text-emerald-900" : "text-slate-800")}>
                                        {ticket.title}
                                    </h3>
                                    <Badge status={ticket.status} />
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{ticket.description}</p>
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                                    <span>{format(new Date(ticket.updatedAt), "d MMM, HH:mm", { locale: fr })}</span>
                                    {ticket._count?.messages ? (
                                        <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                            <MessageSquare size={10} /> {ticket._count.messages}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Chat / Creation Area */}
            <div className={clsx(
                "flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col relative w-full",
                !selectedTicket && !isCreating ? "hidden md:flex" : "flex"
            )}>
                {/* Mobile Back Button */}
                {(selectedTicket || isCreating) && (
                    <div className="md:hidden p-2 bg-slate-50 border-b border-slate-100">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedTicket(null); setIsCreating(false); }} className="gap-2 text-slate-500">
                            <X size={16} /> Retour
                        </Button>
                    </div>
                )}

                {isCreating ? (
                    <div className="p-8 max-w-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Nouveau Ticket</h2>
                            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}><X size={20} /></Button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Sujet</label>
                                <input
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Ex: Problème avec la file d'attente..."
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description détaillée</label>
                                <textarea
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-40 resize-none"
                                    placeholder="Décrivez votre problème ou suggestion..."
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Annuler</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
                                    {isSubmitting ? "Envoi..." : "Créer le ticket"}
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : selectedTicket ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center z-10">
                            <div>
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    {selectedTicket.title}
                                    <Badge status={selectedTicket.status} />
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">Ticket #{selectedTicket.id.slice(-6)}</p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                            {/* Initial Description as first message */}
                            <div className="flex justify-end">
                                <div className="bg-emerald-100 text-emerald-900 p-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                                    <p className="text-[10px] text-emerald-700/60 mt-2 text-right">
                                        {format(new Date(selectedTicket.createdAt), "HH:mm", { locale: fr })}
                                    </p>
                                </div>
                            </div>

                            {chatMessages.map((msg) => {
                                const isMe = msg.sender === "CLINIC"; // I am the clinic
                                return (
                                    <div key={msg.id} className={clsx("flex", isMe ? "justify-end" : "justify-start")}>
                                        <div className={clsx(
                                            "max-w-[80%] p-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap",
                                            isMe
                                                ? "bg-emerald-100 text-emerald-900 rounded-tr-sm"
                                                : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"
                                        )}>
                                            {msg.content}
                                            <p className={clsx("text-[10px] mt-2 text-right", isMe ? "text-emerald-700/60" : "text-slate-400")}>
                                                {format(new Date(msg.createdAt), "HH:mm", { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            {selectedTicket.status === "CLOSED" ? (
                                <div className="flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-xl text-slate-500 text-sm font-medium">
                                    <AlertCircle size={16} /> Ce ticket est fermé.
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                                    <input
                                        className="flex-1 p-3 pl-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all pr-12"
                                        placeholder="Écrivez votre message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        disabled={isSending}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isSending || !newMessage.trim()}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 w-10 h-10 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95"
                                    >
                                        <Send size={18} />
                                    </Button>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <MessageSquare size={64} strokeWidth={1} className="mb-4" />
                        <p className="text-lg font-medium">Sélectionnez un ticket pour voir la discussion</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Badge({ status }: { status: string }) {
    const styles = {
        OPEN: "bg-blue-100 text-blue-700",
        IN_PROGRESS: "bg-amber-100 text-amber-700",
        RESOLVED: "bg-emerald-100 text-emerald-700",
        CLOSED: "bg-slate-100 text-slate-500",
    };
    const labels = {
        OPEN: "Ouvert",
        IN_PROGRESS: "En cours",
        RESOLVED: "Résolu",
        CLOSED: "Fermé",
    };
    // @ts-ignore
    return <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", styles[status] || styles.CLOSED)}>
        {/* @ts-ignore */}
        {labels[status] || status}
    </span>
}
