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
        // 1. IP Rate Limit (1 min)
        const headerStore = await headers();
        const ip = headerStore.get("x-forwarded-for") || "unknown";

        if (ip !== "unknown") {
            const lastTime = rateLimitMap.get(ip);
            if (lastTime && Date.now() - lastTime < 60000) {
                return { success: false, error: "Too many requests. Please wait." };
            }
            rateLimitMap.set(ip, Date.now());
        }

        // 2. Cookie Check (Backup)
        const cookieStore = await cookies();
        const lastTicket = cookieStore.get("last_ticket_time");
        if (lastTicket) {
            const timeDiff = Date.now() - parseInt(lastTicket.value);
            if (timeDiff < 60000) { // 1 minute
                return { success: false, error: "Veuillez patienter avant de prendre un nouveau ticket." };
            }
        }

        const clinic = await prisma.clinic.findUnique({
            where: { slug: clinicSlug },
        });

        if (!clinic) throw new Error("Clinic not found");

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

            let newCount = freshClinic.dailyTicketCount;
            const isQueueEmpty = !lastTurn;
            const isNewDay = new Date(freshClinic.lastTicketDate) < startOfDay;

            // Check if we need to reset (Daily OR Empty Queue)
            if (isNewDay || isQueueEmpty) {
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
                    answers: answers ? JSON.stringify(answers) : undefined,
                },
            });

            return turn;
        });

        revalidatePath(`/p/${clinicSlug}`);
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
            include: { clinic: { select: { avgTime: true, slug: true, name: true } } },
        });

        if (!turn) return { success: false, error: "Turn not found" };

        // Calculate people ahead
        const peopleAhead = await prisma.turn.count({
            where: {
                clinicId: turn.clinicId,
                status: { in: ["WAITING", "URGENT", "ACTIVE"] },
                position: { lt: turn.position }, // Assumes strictly increasing position
            },
        });

        return {
            success: true,
            turn,
            peopleAhead,
            estimatedTime: peopleAhead * turn.clinic.avgTime
        };
    } catch (error) {
        return { success: false, error: "Failed to fetch status" };
    }
}

