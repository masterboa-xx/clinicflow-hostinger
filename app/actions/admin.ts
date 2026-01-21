"use server";

import { prisma } from "@/lib/prisma"; // Assuming lib/prisma exists, or local import
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Ensure user is SuperAdmin
async function ensureSuperAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPERADMIN") {
        redirect("/login");
    }
}

export async function getAdminStats() {
    await ensureSuperAdmin();

    const [totalUsers, activeSubs, monthlyRevenue, trials] = await Promise.all([
        prisma.clinic.count(),
        prisma.subscription.count({ where: { status: "ACTIVE" } }),
        0, // Placeholder as we don't have payments model yet
        prisma.subscription.count({ where: { status: "TRIAL" } })
    ]);

    // Simple revenue estimation based on active plans (if we wanted to estimate)
    // const revenue = await prisma.subscription.findMany({ where: { status: "ACTIVE" } });
    // ... calculate

    return {
        totalUsers,
        activeSubs,
        monthlyRevenue,
        trials
    };
}

export async function getRecentActivity() {
    await ensureSuperAdmin();

    // Fetch recent clinics created
    const recentClinics = await prisma.clinic.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { subscription: true }
    });

    return recentClinics;
}

export async function getAdminUsers(query?: string, plan?: string, status?: string) {
    await ensureSuperAdmin();

    const where: Prisma.ClinicWhereInput = {};

    if (query) {
        where.OR = [
            { name: { contains: query } }, // Case sensitive in some DBs, handle carefully
            { email: { contains: query } }
        ];
    }

    if (plan && plan !== "All Plans") {
        where.subscription = {
            plan: plan as any // Cast to Enum
        };
    }

    // Status filtering is tricky because Clinic doesn't have status, Subscription does.
    if (status && status !== "All Status") {
        if (!where.subscription) where.subscription = {};
        where.subscription.status = status as any;
    }

    const users = await prisma.clinic.findMany({
        where,
        include: { subscription: true },
        orderBy: { createdAt: "desc" }
    });

    return users;
}

export async function getAdminSubscriptions() {
    await ensureSuperAdmin();

    const subs = await prisma.subscription.findMany({
        include: { clinic: true },
        orderBy: { createdAt: "desc" }
    });
    return subs;
}

export async function getAdminTrials() {
    await ensureSuperAdmin();

    const trials = await prisma.subscription.findMany({
        where: { status: "TRIAL" },
        include: { clinic: true },
        orderBy: { trialEndsAt: "asc" }
    });
    return trials;
}

export async function getAuditLogs() {
    await ensureSuperAdmin();

    // As per schema, we have AuditLog model
    const logs = await prisma.auditLog.findMany({
        include: { admin: true },
        orderBy: { createdAt: "desc" },
        take: 50
    });
    return logs;
}

export async function getClinicDetails(id: string) {
    await ensureSuperAdmin();
    const clinic = await prisma.clinic.findUnique({
        where: { id },
        include: { subscription: true }
    });
    return clinic;
}

export async function getClinicAuditLogs(clinicId: string) {
    await ensureSuperAdmin();
    // Assuming targetId is used for clinicId in audit logs
    const logs = await prisma.auditLog.findMany({
        where: { targetId: clinicId },
        include: { admin: true },
        orderBy: { createdAt: "desc" }
    });
    return logs;
}

export async function updateSubscription(clinicId: string, data: { plan: any, status: any, cycle: any, endDate: string | null }) {
    await ensureSuperAdmin();

    // Auto-calculate End Date if not provided
    let calculatedEndDate: Date | null = data.endDate ? new Date(data.endDate) : null;

    if (!calculatedEndDate && (data.status === "ACTIVE" || data.status === "TRIAL")) {
        const now = new Date();
        if (data.cycle === "MONTHLY") {
            // 35 days for monthly as requested
            now.setDate(now.getDate() + 35);
            calculatedEndDate = now;
        } else if (data.cycle === "YEARLY") {
            now.setDate(now.getDate() + 365);
            calculatedEndDate = now;
        }
    }

    // Update or create subscription
    const sub = await prisma.subscription.upsert({
        where: { clinicId },
        create: {
            clinicId,
            plan: data.plan,
            status: data.status,
            cycle: data.cycle as any,
            endDate: calculatedEndDate
        },
        update: {
            plan: data.plan,
            status: data.status,
            cycle: data.cycle as any,
            endDate: calculatedEndDate
        }
    });

    // Create Audit Log
    const session = await auth();
    // We need the admin ID. ensureSuperAdmin checks role but doesn't return ID directly in a clean way for logging if not in session.
    // However, ensureSuperAdmin redirects if not admin.
    // Let's get the admin record.
    const admin = await prisma.superAdmin.findUnique({ where: { email: session?.user?.email || "" } });

    if (admin) {
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action: "UPDATE_SUBSCRIPTION",
                targetId: clinicId,
                details: data as any // Cast to json for simplified details
            }
        });
    }

    revalidatePath(`/admin/clinics/${clinicId}`);
    revalidatePath("/admin/clinics");
    return { success: true, sub };
}

export async function activateClinic(clinicId: string, ticketId: string) {
    await ensureSuperAdmin();

    try {
        // 1. Update Subscription to ACTIVE
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 35); // 1 Month + Buffer

        await prisma.subscription.update({
            where: { clinicId },
            data: {
                status: "ACTIVE",
                plan: "PRO", // Ensure it's PRO
                startDate: now,
                endDate: endDate
            }
        });

        // 2. Close the Ticket
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: "CLOSED" }
        });

        // 3. Send a system message (optional but good UX)
        await prisma.ticketMessage.create({
            data: {
                ticketId,
                sender: "ADMIN",
                content: "Votre compte a été activé avec succès ! Vous allez être redirigé vers votre tableau de bord."
            }
        });

        revalidatePath("/admin/support");
        revalidatePath(`/admin/clinics/${clinicId}`);

        return { success: true, message: "Activated successfully" };
    } catch (error) {
        console.error("Activation Error:", error);
        return { success: false, message: "Failed to activate" };
    }
}

import { hash } from "bcryptjs";

// Utility to create a slug from a name (duplicated to avoid import issues if not exported)
function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

export async function createClinic(data: { name: string, email: string, password: string, plan: string }) {
    await ensureSuperAdmin();

    const { name, email, password, plan } = data;

    if (!name || !email || !password || !plan) {
        return { success: false, message: "Missing required fields" };
    }

    // Check email
    const existing = await prisma.clinic.findUnique({ where: { email } });
    if (existing) {
        return { success: false, message: "Email already in use" };
    }

    // Slug
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.clinic.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${count}`;
        count++;
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create Clinic
    const newClinic = await prisma.clinic.create({
        data: {
            name,
            email,
            password: hashedPassword,
            slug
        }
    });

    // Create Subscription
    // Logic:
    // STARTER (Trial) -> Status TRIAL, Cycle MONTHLY
    // PRO / CLINIC_PLUS -> Status ACTIVE, Cycle MONTHLY
    const status = plan === "STARTER" ? "TRIAL" : "ACTIVE";
    const cycle = "MONTHLY";

    // Calculate End Date
    const endDate = new Date();
    if (plan === "STARTER") {
        endDate.setDate(endDate.getDate() + 14); // 14 days trial
    } else {
        endDate.setDate(endDate.getDate() + 35); // 1 month + 5 days buffer
    }

    await prisma.subscription.create({
        data: {
            clinicId: newClinic.id,
            plan: plan as any,
            status: status as any,
            cycle: cycle as any,
            endDate
        }
    });

    // Audit Log
    const session = await auth();
    const admin = await prisma.superAdmin.findUnique({ where: { email: session?.user?.email || "" } });
    if (admin) {
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action: "CREATE_CLINIC",
                targetId: newClinic.id,
                details: { name, email, plan } as any
            }
        });
    }

    revalidatePath("/admin/clinics");
    return { success: true, message: "Clinic created successfully" };
}
