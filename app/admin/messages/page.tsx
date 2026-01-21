import { getContactSubmissions } from "@/app/actions/contact";
import { MessagesClient } from "./MessagesClient";

export default async function AdminMessagesPage() {
    const { success, data } = await getContactSubmissions();
    const submissions = success ? data : [];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Messages</h1>
                    <p className="text-slate-500 mt-2">Manage contact form and demo request submissions.</p>
                </div>
            </div>

            <MessagesClient initialSubmissions={submissions || []} />
        </div>
    );
}
