"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addQuestion(clinicSlug: string, text: string, type: "TEXT" | "CHOICE" = "TEXT", options: string[] = [], required: boolean = false) {
    try {
        const clinic = await prisma.clinic.findUnique({
            where: { slug: clinicSlug }
        });

        if (!clinic) throw new Error("Clinic not found");

        await prisma.question.create({
            data: {
                clinicId: clinic.id,
                text,
                type,
                options: type === "CHOICE" ? JSON.stringify(options) : (null as any),
                required,
                order: 0, // defaults, could be improved
            }
        });

        revalidatePath(`/dashboard/questions`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to add question" };
    }
}

export async function deleteQuestion(id: string) {
    try {
        await prisma.question.delete({
            where: { id }
        });
        revalidatePath(`/dashboard/questions`);
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to delete" };
    }
}

export async function updateTicketLanguage(clinicSlug: string, lang: string) {
    try {
        if (!["ar", "en", "fr"].includes(lang)) {
            throw new Error("Invalid language");
        }

        await prisma.$executeRaw`UPDATE Clinic SET ticketLanguage = ${lang} WHERE slug = ${clinicSlug}`;

        revalidatePath(`/dashboard/questions`);
        revalidatePath(`/p/${clinicSlug}`); // Refresh the public patient view
        return { success: true };
    } catch (e) {
        console.error("Update language error:", e);
        return { success: false, error: "Failed to update language" };
    }
}
