"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    console.log("Attempting login...");
    try {
        await signIn("credentials", {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: "/dashboard",
        });
        console.log("Login successful (redirecting...)");
    } catch (error) {
        console.error("Login Error:", error);

        // Success! Re-throw the redirect signal so Next.js handles it
        const msg = (error as any).message;
        const digest = (error as any).digest;
        if (
            msg === 'NEXT_REDIRECT' ||
            (typeof msg === 'string' && msg.includes('NEXT_REDIRECT')) ||
            (typeof digest === 'string' && digest.includes('NEXT_REDIRECT'))
        ) {
            throw error;
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return `Login Failed: ${error.message}`;
            }
        }
        // Return the actual error message for debugging instead of crashing
        return `System Error: ${(error as any).message}`;
    }
}


import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Utility to create a slug from a name
function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

export async function registerClinic(
    prevState: string | undefined,
    formData: FormData,
) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return "Tous les champs sont requis.";
    }

    try {
        // Check if email already exists
        const existingUser = await prisma.clinic.findUnique({
            where: { email },
        });

        if (existingUser) {
            return "Cet email est déjà utilisé.";
        }

        // Generate slug
        const baseSlug = slugify(name);
        let slug = baseSlug;
        let count = 1;

        while (await prisma.clinic.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        const hashedPassword = await hash(password, 10);

        const newClinic = await prisma.clinic.create({
            data: {
                name,
                email,
                password: hashedPassword,
                slug,
            },
        });

        // Create Subscription based on selected plan
        const plan = formData.get('plan') as string || 'trial';
        const isTrial = plan.toLowerCase() === 'trial';

        // PRO/PAID plans start as PENDING, Trial starts as TRIAL
        const status = isTrial ? 'TRIAL' : 'PENDING';

        // Subscription dates
        const startDate = new Date();
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        await prisma.subscription.create({
            data: {
                clinicId: newClinic.id,
                plan: isTrial ? "STARTER" : "PRO", // Map 'pro' to PRO plan enum if needed
                status: status as any,
                cycle: "MONTHLY", // Default
                startDate: startDate,
                endDate: isTrial ? trialEndsAt : null,
                trialEndsAt: isTrial ? trialEndsAt : null
            }
        });

        // If PENDING (Pro plan), create an automatic support ticket for activation
        if (status === 'PENDING') {
            const ticket = await prisma.supportTicket.create({
                data: {
                    clinicId: newClinic.id,
                    title: "Activation de compte Pro",
                    description: "Demande d'activation pour le plan Pro.",
                    priority: "HIGH",
                    status: "OPEN"
                }
            });

            await prisma.ticketMessage.create({
                data: {
                    ticketId: ticket.id,
                    sender: "CLINIC",
                    content: "Bonjour, je viens de m'inscrire au plan Pro. J'aimerais procéder à l'activation de mon compte."
                }
            });
        }

    } catch (error) {
        console.error("Registration Error:", error);
        console.error("DB URL (Masked):", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@"));
        return `Debug Error: ${(error as any).message}`;
    }

    redirect("/login?registered=true");
}
