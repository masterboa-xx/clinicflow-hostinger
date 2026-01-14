"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TurnStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper to get authenticated clinic
async function getMyClinic() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const clinic = await prisma.clinic.findUnique({
        where: { email: session.user.email },
    });

    if (!clinic) throw new Error("Clinic not found");
    return clinic;
}

// Get the full queue state
export async function getQueueState() {
    const clinic = await getMyClinic();

    const activeTurn = await prisma.turn.findFirst({
        where: { clinicId: clinic.id, status: "ACTIVE" },
    });

    const waitingQueue = await prisma.turn.findMany({
        where: {
            clinicId: clinic.id,
            status: { in: ["WAITING", "URGENT", "DELAYED"] }
        },
        orderBy: [
            { status: "desc" }, // URGENT first (if U > W alphabetically? No. Need custom sort logic or rely on position updates)
            // Actually URGENT comes after WAITING alphabetically. 
            // Ideally we reorder position when status becomes Urgent.
            { position: "asc" }
        ],
    });

    // Simple sorting fix: URGENT > OTHERS
    waitingQueue.sort((a, b) => {
        if (a.status === "URGENT" && b.status !== "URGENT") return -1;
        if (a.status !== "URGENT" && b.status === "URGENT") return 1;
        return a.position - b.position;
    });

    return { activeTurn, waitingQueue };
}

// Call next patient
// Call next patient atomically
export async function callNextPatient() {
    const clinic = await getMyClinic();

    const nextTurn = await prisma.$transaction(async (tx) => {
        // 1. Mark current active as DONE
        await tx.turn.updateMany({
            where: { clinicId: clinic.id, status: "ACTIVE" },
            data: { status: "DONE" },
        });

        // 2. Find next in line
        // Priority: URGENT (asc position) > WAITING (asc position)
        // We ignore DELAYED until manually changed.

        // Check for Urgent first
        let next = await tx.turn.findFirst({
            where: {
                clinicId: clinic.id,
                status: "URGENT"
            },
            orderBy: { position: "asc" }
        });

        // If no Urgent, check Waiting
        if (!next) {
            next = await tx.turn.findFirst({
                where: {
                    clinicId: clinic.id,
                    status: "WAITING"
                },
                orderBy: { position: "asc" }
            });
        }

        // 3. If candidate found, set to ACTIVE
        if (next) {
            await tx.turn.update({
                where: { id: next.id },
                data: { status: "ACTIVE" },
            });
        }

        return next;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/p/${clinic.slug}`); // Update patient screens
    return { success: true, nextTurn };
}

// Update status (Cancel, Delay, Urgent)
export async function updateTurnStatus(turnId: string, newStatus: TurnStatus) {
    const clinic = await getMyClinic();

    await prisma.turn.update({
        where: { id: turnId, clinicId: clinic.id },
        data: { status: newStatus }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/p/${clinic.slug}`);
    return { success: true };
}
