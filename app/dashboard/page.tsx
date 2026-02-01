import { auth } from "@/auth";
import { getQueueState } from "@/app/actions/dashboard";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    // Redirect SuperAdmin
    if ((session.user as any).role === "SUPERADMIN") {
        redirect("/admin/dashboard");
    }

    const clinic = await prisma.clinic.findUnique({
        where: { email: session.user.email },
        include: { subscription: true }
    });

    if (!clinic) {
        redirect("/login");
    }

    if (clinic.subscription?.status === 'PENDING') {
        redirect("/onboarding/pending");
    }

    const { activeTurn, waitingQueue } = await getQueueState();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const completedCount = await prisma.turn.count({
        where: {
            clinicId: clinic.id,
            status: "DONE",
            updatedAt: { gte: startOfDay }
        }
    });

    return <DashboardClient
        initialActive={activeTurn}
        initialQueue={waitingQueue}
        clinicName={clinic?.name || "ClinicFlow"}
        logo={clinic?.logo}
        dailyTicketCount={clinic.dailyTicketCount}
        avgTime={clinic.avgTime}
        slug={clinic.slug}
        completedCount={completedCount}
        subscription={clinic.subscription}
    />;
}
