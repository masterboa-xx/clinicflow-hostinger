"use server";

import { prisma } from "@/lib/prisma";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- Clinic Actions ---

export async function createTicket(title: string, description: string, priority: TicketPriority = "MEDIUM") {
    try {
        const session = await auth();
        if (!session?.user?.email || session.user.role !== "CLINIC") {
            return { error: "Unauthorized" };
        }

        // Get Clinic ID from session (assuming session.user.id is the clinic ID for Clinics)
        // If not, we fetch by email
        const clinic = await prisma.clinic.findUnique({ where: { email: session.user.email } });
        if (!clinic) return { error: "Clinic not found" };

        const ticket = await prisma.supportTicket.create({
            data: {
                clinicId: clinic.id,
                title,
                description,
                priority,
                status: "OPEN",
            }
        });

        revalidatePath("/dashboard/support");
        revalidatePath("/admin/support");
        return { success: true, ticket };
    } catch (error) {
        console.error("Error creating ticket:", error);
        return { error: "Failed to create ticket" };
    }
}

export async function getClinicTickets() {
    try {
        const session = await auth();
        if (!session?.user?.email || session.user.role !== "CLINIC") {
            return { error: "Unauthorized" };
        }

        const clinic = await prisma.clinic.findUnique({ where: { email: session.user.email } });
        if (!clinic) return { error: "Clinic not found" };

        const tickets = await prisma.supportTicket.findMany({
            where: { clinicId: clinic.id },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { messages: true } }
            }
        });

        return { success: true, tickets };
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return { error: "Failed to fetch tickets" };
    }
}

// --- Shared Actions (Clinic & Admin) ---

export async function getTicketDetails(ticketId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Unauthorized" };

        // Authorization check logic could be tighter here, but for now:
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: ticketId },
            include: {
                clinic: { select: { name: true, logo: true, email: true } },
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) return { error: "Ticket not found" };

        // Security check: If sender is clinic, ensure it's their ticket
        if (session.user.role === "CLINIC") {
            const clinic = await prisma.clinic.findUnique({ where: { email: session.user.email || "" } });
            if (ticket.clinicId !== clinic?.id) return { error: "Unauthorized access to ticket" };
        }

        return { success: true, ticket };
    } catch (error) {
        console.error("Error fetching ticket details:", error);
        return { error: "Failed to fetch ticket" };
    }
}

export async function sendMessage(ticketId: string, content: string) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Unauthorized" };

        const senderRole = session.user.role === "SUPERADMIN" ? "ADMIN" : "CLINIC";

        const message = await prisma.ticketMessage.create({
            data: {
                ticketId,
                content,
                sender: senderRole
            }
        });

        // Update ticket `updatedAt` to bump it in the list
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        });

        revalidatePath(`/dashboard/support`);
        revalidatePath(`/admin/support`);

        return { success: true, message };
    } catch (error) {
        console.error("Error sending message:", error);
        return { error: "Failed to send message" };
    }
}

// --- Admin Actions ---

export async function getAllTickets() {
    try {
        const session = await auth();
        // Strict role check. If session or role is missing, return error immediately.
        if (!session?.user || (session.user as any).role !== "SUPERADMIN") {
            // Fallback: Check specific email if role isn't populated for some reason (rare)
            const adminEmail = process.env.ADMIN_EMAIL; // Or hardcoded authorized emails
            if (!session?.user?.email) return { error: "Unauthorized" };

            // Double check against DB if role is missing in JWT
            const admin = await prisma.superAdmin.findUnique({ where: { email: session.user.email } });
            if (!admin) return { error: "Unauthorized" };
        }

        const tickets = await prisma.supportTicket.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                clinic: { select: { name: true, logo: true, email: true } }, // Added email for UI
                _count: { select: { messages: true } }
            }
        });

        // Ensure serializable just in case (Dates are handled by Next.js actions usually, but good to be safe)
        return { success: true, tickets };
    } catch (error) {
        console.error("Error fetching all tickets:", error);
        return { error: "Failed to fetch tickets" };
    }
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
    try {
        const session = await auth();
        // Admin check
        if (session?.user?.role !== "SUPERADMIN") {
            const admin = await prisma.superAdmin.findUnique({ where: { email: session?.user?.email || "" } });
            if (!admin) return { error: "Unauthorized Admin" };
        }

        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status }
        });

        revalidatePath("/dashboard/support");
        revalidatePath("/admin/support");
        return { success: true, ticket };
    } catch (error) {
        console.error("Error updating ticket status:", error);
        return { error: "Failed to update status" };
    }
}

export async function deleteTicket(ticketId: string) {
    try {
        const session = await auth();
        // Admin check
        if (session?.user?.role !== "SUPERADMIN") {
            const admin = await prisma.superAdmin.findUnique({ where: { email: session?.user?.email || "" } });
            if (!admin) return { error: "Unauthorized Admin" };
        }

        // Delete related messages first (Prisma might handle this with Cascade, but safe to be explicit if not)
        await prisma.ticketMessage.deleteMany({
            where: { ticketId }
        });

        // Delete ticket
        const ticket = await prisma.supportTicket.delete({
            where: { id: ticketId }
        });

        revalidatePath("/dashboard/support");
        revalidatePath("/admin/support");
        return { success: true };
    } catch (error) {
        console.error("Error deleting ticket:", error);
        return { error: "Failed to delete ticket" };
    }
}

export async function getUnreadCounts() {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, count: 0, error: "Unauthorized" };

        const role = session.user.role === "SUPERADMIN" ? "SUPERADMIN" : "CLINIC";
        let count = 0;

        if (role === "CLINIC") {
            const clinic = await prisma.clinic.findUnique({ where: { email: session.user.email || "" } });
            if (!clinic) return { count: 0 };

            // Fetch active tickets with their last message
            const tickets = await prisma.supportTicket.findMany({
                where: {
                    clinicId: clinic.id,
                    status: { not: "CLOSED" }
                },
                include: {
                    messages: {
                        take: 1,
                        orderBy: { createdAt: "desc" }
                    }
                }
            });

            // Count tickets where last message is from ADMIN
            count = tickets.filter(t => t.messages.length > 0 && t.messages[0].sender === "ADMIN").length;
        } else {
            // SUPERADMIN Logic
            // 1. OPEN tickets (always unread/actionable)
            const openCount = await prisma.supportTicket.count({ where: { status: "OPEN" } });

            // 2. IN_PROGRESS tickets where last message is from CLINIC
            const inProgressTickets = await prisma.supportTicket.findMany({
                where: { status: "IN_PROGRESS" },
                include: {
                    messages: {
                        take: 1,
                        orderBy: { createdAt: "desc" }
                    }
                }
            });

            const replyCount = inProgressTickets.filter(t => t.messages.length > 0 && t.messages[0].sender === "CLINIC").length;

            count = openCount + replyCount;
        }

        return { success: true, count };
    } catch (error) {
        console.error("Error fetching unread counts:", error);
        return { success: false, count: 0, error: "Failed to fetch" };
    }
}
