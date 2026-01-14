"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SettingsSchema = z.object({
    name: z.string().min(1, "Clinic name is required"),
    avgTime: z.coerce.number().min(1, "Average time must be at least 1 minute"),
});

export async function updateSettings(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Unauthorized" };

    const parsed = SettingsSchema.safeParse({
        name: formData.get("name"),
        avgTime: formData.get("avgTime"),
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    try {
        await prisma.clinic.update({
            where: { email: session.user.email },
            data: {
                name: parsed.data.name,
                avgTime: parsed.data.avgTime,
            },
        });

        revalidatePath("/dashboard");
        // We don't have the slug here easily unless we fetch it, but usually settings page needs refresh
        return { success: "Settings updated successfully" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update settings" };
    }
}
// ... (existing code)

const QuestionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1),
    type: z.enum(["TEXT", "CHOICE"]),
    options: z.array(z.string()).optional(),
    required: z.boolean(),
});

const QuestionsSchema = z.array(QuestionSchema);

export async function saveQuestions(questions: any[]) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Unauthorized" };

    const parsed = QuestionsSchema.safeParse(questions);
    if (!parsed.success) return { error: "Invalid data" };

    try {
        const clinic = await prisma.clinic.findUnique({ where: { email: session.user.email } });
        if (!clinic) return { error: "Clinic not found" };

        // Transaction: Delete all existing and re-create (simplest for ordering/sync)
        // Note: In a real app we might want to soft-delete or update to preserve IDs.
        // For this MVP, we will rely on fetching fresh questions.

        await prisma.$transaction(async (tx) => {
            await tx.question.deleteMany({ where: { clinicId: clinic.id } });

            for (const [index, q] of parsed.data.entries()) {
                await tx.question.create({
                    data: {
                        clinicId: clinic.id,
                        text: q.text,
                        type: q.type,
                        required: q.required,
                        order: index,
                        options: q.options ? JSON.stringify(q.options) : undefined,
                    }
                });
            }
        });

        revalidatePath("/dashboard/settings");
        revalidatePath("/p/[slug]"); // Revalidate patient page
        return { success: "Questions updated" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to save questions" };
    }
}
