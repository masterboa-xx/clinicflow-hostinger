import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getUser(email: string) {
    try {
        const user = await prisma.clinic.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("Authorize called with:", credentials?.email);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    // 1. Check SuperAdmin
                    try {
                        const admin = await prisma.superAdmin.findUnique({ where: { email } });
                        if (admin) {
                            const passwordsMatch = await bcrypt.compare(password, admin.password);
                            if (passwordsMatch) {
                                console.log("SuperAdmin Login Successful");
                                return { ...admin, role: "SUPERADMIN" };
                            }
                        }
                    } catch (e) { console.log("Admin check failed", e); }

                    // 2. Check Clinic
                    try {
                        const user = await getUser(email);
                        if (!user) {
                            console.log("User not found in DB.");
                            return null;
                        }

                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        if (passwordsMatch) {
                            console.log("Clinic Password matched!");
                            return { ...user, role: "CLINIC" };
                        } else {
                            console.log("Password mismatch.");
                        }
                    } catch (e) {
                        console.error("Clinic check failed:", e);
                    }
                } else {
                    console.log("Zod validation failed");
                }

                return null;
            },
        }),
    ],
});
