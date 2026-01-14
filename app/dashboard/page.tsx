import { auth } from "@/auth";
import { getQueueState } from "@/app/actions/dashboard";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    // Fetch Clinic Name separately if not in session? 
    // getQueueState does it but we want the name.
    // Ideally getQueueState returns clinic details or we fetch here.

    const clinic = await prisma.clinic.findUnique({
        where: { email: session.user.email },
        select: { name: true, logo: true }
    });

    const { activeTurn, waitingQueue } = await getQueueState();

    return <DashboardClient
        initialActive={activeTurn}
        initialQueue={waitingQueue}
        clinicName={clinic?.name || "ClinicFlow"}
        logo={clinic?.logo}
    />;
}
