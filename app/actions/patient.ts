"use server";

import { prisma } from "@/lib/prisma";
import { TurnStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

// Simple In-Memory Rate Limit (Per Server Instance)
// Key: IP, Value: Timestamp of last request
const rateLimitMap = new Map<string, number>();

// Public Action: Join the queue
export async function createTurn(clinicSlug: string, patientName?: string, answers?: any) {
    try {
        // 1. IP Rate Limit
        // Disabled to allow multiple patients on the same Clinic Wi-Fi


        // 2. Cookie Check (Backup)
        // Disabled for testing by user request
        const cookieStore = await cookies();


        const clinic = await prisma.clinic.findUnique({
            where: { slug: clinicSlug },
            include: { subscription: true }
        });

        if (!clinic) throw new Error("Clinic not found");

        // Subscription Validation
        const sub = clinic.subscription;
        const now = new Date();
        const isActive = sub && (sub.status === "ACTIVE" || sub.status === "TRIAL");
        // If endDate is null, we assume lifetime/indefinite access. If set, check expiry.
        const isNotExpired = !sub?.endDate || new Date(sub.endDate) > now;

        if (!isActive || !isNotExpired) {
            return { success: false, error: "Le service de cette clinique est actuellement suspendu. Veuillez contacter l'administration." };
        }

        const result = await prisma.$transaction(async (tx) => {
            // LOCK the clinic row to prevent race conditions
            await tx.$executeRaw`SELECT * FROM Clinic WHERE id = ${clinic.id} FOR UPDATE`;

            const freshClinic = await tx.clinic.findUnique({ where: { id: clinic.id } });
            if (!freshClinic) throw new Error("Clinic lost");

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            // Get last position to append (Moved up to check for emptiness)
            const lastTurn = await tx.turn.findFirst({
                where: { clinicId: clinic.id, status: { in: ["WAITING", "URGENT", "DELAYED", "ACTIVE"] } },
                orderBy: { position: "desc" },
            });

            console.log(`[DEBUG] Last Turn Found: ${lastTurn ? lastTurn.ticketCode : "None"}`);
            console.log(`[DEBUG] Current Daily Count (DB): ${freshClinic.dailyTicketCount}`);

            let newCount = freshClinic.dailyTicketCount;
            const isNewDay = new Date(freshClinic.lastTicketDate) < startOfDay;

            console.log(`[DEBUG] Reset Conditions - NewDay: ${isNewDay}`);

            // ONLY Reset on New Day. Never reset just because queue is empty.
            if (isNewDay) {
                console.log("[DEBUG] New Day detected. Resetting ticket count to 1");
                newCount = 1;
            } else {
                newCount++;
            }

            // Update Clinic Counter
            await tx.clinic.update({
                where: { id: clinic.id },
                data: {
                    dailyTicketCount: newCount,
                    lastTicketDate: new Date(),
                }
            });

            const ticketCode = `A${newCount.toString().padStart(2, "0")}`;

            const position = lastTurn ? lastTurn.position + 1 : 1;


            // Check for urgency in answers
            let initialStatus: "WAITING" | "URGENT" = "WAITING";
            if (answers) {
                try {
                    const ansObj = typeof answers === 'string' ? JSON.parse(answers) : answers;
                    const cleanKey = (k: string) => k.trim().toLowerCase();
                    const urgentEntry = Object.entries(ansObj).find(([k]) =>
                        cleanKey(k) === "urgent" || cleanKey(k).includes("urgence")
                    );

                    if (urgentEntry && (String(urgentEntry[1]).toLowerCase() === "yes" || String(urgentEntry[1]).toLowerCase() === "oui")) {
                        initialStatus = "URGENT";
                    }
                } catch (e) {
                    // Swallow parse error safely
                }
            }

            const turn = await tx.turn.create({
                data: {
                    clinicId: clinic.id,
                    ticketCode,
                    position,
                    status: initialStatus,
                    patientName,
                    answers: answers ?? undefined,
                },
            });

            return turn;
        });

        revalidatePath(`/p/${clinicSlug}`);
        revalidatePath("/dashboard");
        cookieStore.set("last_ticket_time", Date.now().toString(), { secure: true, httpOnly: true });

        return { success: true, turn: result };
    } catch (error) {
        console.error("CreateTurn Error:", error); // Log internal error
        return { success: false, error: "An error occurred while creating your ticket." }; // Generic message
    }
}

// Public Action: Poll status
export async function getMyTurnStatus(turnId: string) {
    try {
        const turn = await prisma.turn.findUnique({
            where: { id: turnId },
            include: { clinic: { select: { avgTime: true, slug: true, name: true, ticketLanguage: true } } } as any,
        });

        if (!turn) return { success: false, error: "Turn not found" };

        // Fetch fresh status via raw query
        const statusResult = await prisma.$queryRaw`SELECT status FROM Turn WHERE id = ${turnId}`;
        const freshStatus = Array.isArray(statusResult) && statusResult[0] ? statusResult[0].status : turn.status;

        // Calculate people ahead
        const peopleAhead = await prisma.turn.count({
            where: {
                clinicId: turn.clinicId,
                status: { in: ["WAITING", "URGENT", "ACTIVE"] },
                position: { lt: turn.position }, // Assumes strictly increasing position
            },
        });

        // Patch the turn object with fresh status
        const displayTurn = { ...turn, status: freshStatus };

        return {
            success: true,
            turn: displayTurn,
            peopleAhead,
            estimatedTime: peopleAhead * (turn as any).clinic.avgTime,
            ticketLanguage: (turn as any).clinic.ticketLanguage || "ar"
        };
    } catch (error: any) {
        console.error("getMyTurnStatus Error:", error);
        return { success: false, error: error.message || "Failed to fetch status" };
    }
}

// Public Action: Get just the language (for polling landing page)
export async function getClinicLanguage(slug: string) {
    try {
        const result = await prisma.$queryRaw`SELECT ticketLanguage FROM Clinic WHERE slug = ${slug}`;
        const clinic = Array.isArray(result) ? result[0] : null;

        return { success: true, language: (clinic as any)?.ticketLanguage || "ar" };
    } catch (e) {
        console.error("Poll language error:", e);
        return { success: false };
    }
}

// Public Action: Get full queue state for TV/Public Display
export async function getQueueStateForPatient(slug: string) {
    try {
        const clinic = await prisma.clinic.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!clinic) return { success: false, error: "Clinic not found" };

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const activeTurn = await prisma.turn.findFirst({
            where: {
                clinicId: clinic.id,
                status: "ACTIVE",
                updatedAt: { gte: startOfDay }
            },
            select: { id: true, ticketCode: true, status: true, patientName: true }
        });

        const queue = await prisma.turn.findMany({
            where: {
                clinicId: clinic.id,
                status: { in: ["WAITING", "URGENT"] },
                updatedAt: { gte: startOfDay }
            },
            orderBy: [
                { status: "desc" }, // URGENT first
                { position: "asc" }
            ],
            take: 10,
            select: { id: true, ticketCode: true }
        });

        return { success: true, activeTurn, queue };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Error fetching state" };
    }
}
