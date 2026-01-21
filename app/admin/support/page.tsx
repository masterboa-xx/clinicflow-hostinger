import { Suspense } from "react";
import { AdminSupportClient } from "./AdminSupportClient";
import { getAllTickets } from "@/app/actions/support";

export default async function AdminSupportPage() {
    // Fetch all tickets for admin
    const { tickets, error } = await getAllTickets();

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Gestion du Support</h1>
            <Suspense fallback={<div>Chargement des tickets...</div>}>
                {/* @ts-ignore - DB types vs component types matching */}
                <AdminSupportClient initialTickets={tickets || []} />
            </Suspense>
        </div>
    );
}
