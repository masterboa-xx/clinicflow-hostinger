"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitContactForm(formData: any) {
    try {
        await prisma.contactSubmission.create({
            data: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                type: formData.type,
                message: formData.message,
            }
        });

        // Notify admin via email if smtp configured (optional/future)
        return { success: true };
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return { success: false, error: "Failed to submit form" };
    }
}

export async function submitDemoRequest(formData: any) {
    try {
        await prisma.contactSubmission.create({
            data: {
                name: "Demo Request", // Generic name or we could ask for it
                email: "N/A", // We don't have email in demo form? Wait, we should probably check fields.
                // The demo form in the image has: Clinic Name, City, Preferred Slot.
                // It does NOT have email/phone directly visible. 
                // Ah, usually demo requests come after validation or require more info.
                // But let's assume valid data is passed or we save what we have.
                // The DB schema supports contact info.
                // Let's assume the user fills the contact form OR the demo form.
                // If it's just the demo form on the right, it has no contact info? 
                // That's surely a UX issue in the design if true, but I will just save what fields exist.
                // The image shows "Demo Medecin: Nom du cabinet, Ville, Creneau prefere".
                // And above it, generic contact info.
                // Maybe the contact info on the left is for general queries.
                // The demo form on right is quick booking.
                // I will save it with type "Demo".
                type: "Demo",
                clinicName: formData.clinicName,
                city: formData.city,
                preferredSlot: formData.slot,
                message: `Demo requested for ${formData.clinicName} in ${formData.city} at ${formData.slot}`,
            }
        });
        revalidatePath("/admin/messages");
        return { success: true };
    } catch (error) {
        console.error("Error submiting demo request:", error);
        return { success: false, error: "Failed to submit demo request" };
    }
}

export async function getContactSubmissions() {
    try {
        const submissions = await prisma.contactSubmission.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
        return { success: true, data: submissions };
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return { success: false, error: "Failed to fetch submissions" };
    }
}

export async function updateSubmissionStatus(id: string, status: string) {
    try {
        await prisma.contactSubmission.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/admin/messages");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update status" };
    }
}

export async function deleteSubmission(id: string) {
    try {
        await prisma.contactSubmission.delete({
            where: { id }
        });
        revalidatePath("/admin/messages");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete submission" };
    }
}
