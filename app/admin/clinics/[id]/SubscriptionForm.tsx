"use client";

import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { updateSubscription } from "@/app/actions/admin";

interface SubscriptionFormProps {
    clinicId: string;
    initialData: {
        plan: string;
        status: string;
        cycle: string;
        endDate: string | null;
    };
}

export function SubscriptionForm({ clinicId, initialData }: SubscriptionFormProps) {
    const [cycle, setCycle] = useState(initialData.cycle || "MONTHLY");
    const [endDate, setEndDate] = useState(initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "");

    // Function to calculate date based on cycle
    const calculateEndDate = (selectedCycle: string) => {
        const now = new Date();
        if (selectedCycle === "MONTHLY") {
            now.setDate(now.getDate() + 35);
        } else if (selectedCycle === "YEARLY") {
            now.setDate(now.getDate() + 365);
        }
        return now.toISOString().split('T')[0];
    };

    const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCycle = e.target.value;
        setCycle(newCycle);
        // Auto-update date when cycle changes
        setEndDate(calculateEndDate(newCycle));
    };

    return (
        <form
            action={async (formData) => {
                await updateSubscription(clinicId, {
                    plan: formData.get("plan"),
                    status: formData.get("status"),
                    cycle: cycle, // Use state value directly to ensure sync
                    endDate: endDate // Use state value directly
                });
            }}
            className="space-y-4"
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                    <select name="plan" defaultValue={initialData.plan || "STARTER"} className="w-full p-2 border rounded-md">
                        <option value="STARTER">Trial</option>
                        <option value="PRO">Pro</option>
                        <option value="CLINIC_PLUS">Premium</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Billing Cycle</label>
                    <select
                        name="cycle"
                        value={cycle}
                        onChange={handleCycleChange}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select name="status" defaultValue={initialData.status || "TRIAL"} className="w-full p-2 border rounded-md">
                        <option value="ACTIVE">Active</option>
                        <option value="TRIAL">Trial</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date (YYYY-MM-DD)</label>
                    <input
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <Button type="submit">
                    <Save size={16} className="mr-2" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
