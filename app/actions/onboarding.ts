"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function checkActivationStatus() {
    const session = await auth();
    if (!session?.user?.email) return null;

    const clinic = await prisma.clinic.findUnique({
        where: { email: session.user.email },
        include: { subscription: true }
    });

    if (!clinic || !clinic.subscription) return null;

    return {
        status: clinic.subscription.status,
        plan: clinic.subscription.plan
    };
}
