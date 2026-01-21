"use client";

import { useState, useEffect, useRef } from "react";
import { SupportTicket, TicketMessage } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Send, RefreshCw, MessageSquare } from "lucide-react";
import { sendMessage, getTicketDetails } from "@/app/actions/support";
import { clsx } from "clsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type TicketWithDetails = SupportTicket & {
    messages: TicketMessage[];
};

export function PendingChat({ ticketId, initialTicket }: { ticketId: string, initialTicket: TicketWithDetails }) {
    const [messages, setMessages] = useState<TicketMessage[]>(initialTicket.messages || []);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        const res = await getTicketDetails(ticketId);
        if (res.success && res.ticket) {
            setMessages(res.ticket.messages);
        }
    };

    // Poll for messages
    useEffect(() => {
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [ticketId]);

    // Initial scroll
    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempContent = newMessage;
        setNewMessage(""); // Optimistic clear
        setIsSending(true);

        const res = await sendMessage(ticketId, tempContent);
        setIsSending(false);

        if (res.success && res.message) {
            setMessages(prev => [...prev, res.message]);
        } else {
            setNewMessage(tempContent);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        {initialTicket.title}
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Support
                        </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Ticket #{ticketId.slice(-6)}</p>
                </div>
                <Button onClick={fetchMessages} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                    <RefreshCw size={16} />
                </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {/* Initial Description */}
                <div className="flex justify-start">
                    <div className="bg-white text-slate-600 border border-slate-100 p-4 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm text-center italic text-sm">
                        <MessageSquare className="w-4 h-4 mx-auto mb-2 text-slate-400" />
                        Ce canal est dédié à l'activation de votre compte. Un administrateur vous répondra bientôt.
                    </div>
                </div>

                {messages.map((msg) => {
                    const isMe = msg.sender === "CLINIC";
                    return (
                        <div key={msg.id} className={clsx("flex", isMe ? "justify-end" : "justify-start")}>
                            <div className={clsx(
                                "max-w-[85%] p-3 md:p-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap",
                                isMe
                                    ? "bg-emerald-500 text-white rounded-tr-sm"
                                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"
                            )}>
                                {msg.content}
                                <p className={clsx("text-[10px] mt-1 text-right", isMe ? "text-emerald-100" : "text-slate-400")}>
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
            </div>
        </div>
    );
}
