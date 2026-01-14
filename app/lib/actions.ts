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
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return `Login Failed: ${error.message}`;
            }
        }
        throw error;
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

        await prisma.clinic.create({
            data: {
                name,
                email,
                password: hashedPassword,
                slug,
            },
        });

    } catch (error) {
        console.error("Registration Error:", error);
        return `Debug Error: ${(error as any).message}`;
    }

    redirect("/login?registered=true");
}
