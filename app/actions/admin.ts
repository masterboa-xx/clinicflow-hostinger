
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPERADMIN") {
        redirect("/login");
    }
}

export async function getAdminDashboardStats() {
    await requireSuperAdmin();

    const [
        totalClinics,
        activeSubscriptions,
        trialSubscriptions,
        openTickets
    ] = await Promise.all([
        prisma.clinic.count(),
        prisma.subscription.count({ where: { status: "ACTIVE" } }),
        prisma.subscription.count({ where: { status: "TRIAL" } }),
        prisma.supportTicket.count({ where: { status: "OPEN" } })
    ]);

    // Simple MRR calculation (Mock data for now mostly since we don't have real payments yet)
    // Starter: $29, Pro: $79, Clinic+: $149 (Example pricing)
    const subscriptions = await prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        select: { plan: true }
    });

});

return {
    totalClinics,
    activeSubscriptions,
    trialSubscriptions,
    openTickets,
    mrr
};
}

export async function getAllClinics(query: string = "") {
    await requireSuperAdmin();

    const clinics = await prisma.clinic.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { slug: { contains: query } }
            ]
        },
        include: {
            subscription: true,
            _count: {
                select: { turns: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return clinics;
}

export async function getClinicDetails(id: string) {
    await requireSuperAdmin();

    return await prisma.clinic.findUnique({
        where: { id },
        include: { subscription: true, auditLogs: { orderBy: { createdAt: 'desc' }, take: 10 } } // Note: auditLogs are on Admin, not Clinic directly usually, but we might want logs related to this clinic.
        // Actually AuditLog is on SuperAdmin. We need to fetch AuditLogs where targetId == clinic.id
    });
}

// Fixed AuditLog fetch for clinic details page context
export async function getClinicAuditLogs(clinicId: string) {
    await requireSuperAdmin();
    return await prisma.auditLog.findMany({
        where: { targetId: clinicId },
        include: { admin: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}

export async function updateSubscription(
    clinicId: string,
    data: {
        plan: "STARTER" | "PRO" | "CLINIC_PLUS",
        status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "CANCELLED",
        cycle: "MONTHLY" | "YEARLY",
        endDate: string | null
    }
) {
    await requireSuperAdmin();
    const session = await auth();

    // Upsert subscription
    const sub = await prisma.subscription.upsert({
        where: { clinicId },
        update: {
            plan: data.plan,
            status: data.status,
            cycle: data.cycle,
            endDate: data.endDate ? new Date(data.endDate) : null
        },
        create: {
            clinicId,
            plan: data.plan,
            status: data.status,
            cycle: data.cycle,
            endDate: data.endDate ? new Date(data.endDate) : null,
            startDate: new Date()
        }
    });

    // Create Audit Log
    await prisma.auditLog.create({
        data: {
            adminId: (session?.user as any).id,
            action: "UPDATE_SUBSCRIPTION",
            targetId: clinicId,
            details: data as any
        }
    });

    return { success: true };
}
