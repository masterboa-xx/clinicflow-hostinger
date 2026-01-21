import { Suspense } from "react";
import { SupportClient } from "./SupportClient";
import { getClinicTickets } from "@/app/actions/support";

export default async function SupportPage() {
    const { tickets, error } = await getClinicTickets();

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Support & Suggestions</h1>
            <Suspense fallback={<div>Loading tickets...</div>}>
                <SupportClient initialTickets={tickets || []} />
            </Suspense>
        </div>
    );
}
