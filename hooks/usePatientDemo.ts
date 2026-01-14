"use client";

import { useState, useEffect } from "react";

export type TicketStatus = "idle" | "waiting" | "ready";

export interface PatientTicket {
    number: string;
    position: number;
    status: TicketStatus;
    joinedAt: number;
}

export const usePatientDemo = () => {
    const [ticket, setTicket] = useState<PatientTicket | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("clinicflow_demo_ticket");
        if (stored) {
            try {
                setTicket(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse ticket", e);
            }
        }
        setIsLoading(false);
    }, []);

    // Save to localStorage whenever ticket changes
    useEffect(() => {
        if (ticket) {
            localStorage.setItem("clinicflow_demo_ticket", JSON.stringify(ticket));
        } else {
            localStorage.removeItem("clinicflow_demo_ticket");
        }
    }, [ticket]);

    const takeTurn = () => {
        // Simulate API call
        const newTicket: PatientTicket = {
            number: "A" + Math.floor(Math.random() * (99 - 10 + 1) + 10), // A10-A99 or keep consistent if requested
            position: 3, // Start at 3
            status: "waiting",
            joinedAt: Date.now()
        };
        setTicket(newTicket);
        return newTicket;
    };

    const refreshStatus = () => {
        if (!ticket) return;

        setTicket(prev => {
            if (!prev) return null;
            if (prev.position <= 0) return prev;

            const newPos = prev.position - 1;
            return {
                ...prev,
                position: newPos,
                status: newPos === 0 ? "ready" : "waiting"
            };
        });
    };

    const cancelTurn = () => {
        setTicket(null);
    };

    return {
        ticket,
        isLoading,
        takeTurn,
        refreshStatus,
        cancelTurn
    };
};
