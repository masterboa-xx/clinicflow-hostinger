import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PendingClientPage } from "@/components/onboarding/PendingClientPage";

async function getActivationTicket(clinicId: string) {
    // Find the latest open ticket, likely created during registration
    return await prisma.supportTicket.findFirst({
        where: { clinicId, status: { not: "CLOSED" } },
        include: { messages: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" }
    });
}

export default async function PendingPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const clinic = await prisma.clinic.findUnique({ where: { email: session.user.email } });
    if (!clinic) redirect("/login");

    const ticket = await getActivationTicket(clinic.id);

    return <PendingClientPage ticket={ticket} />;
}
