
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const email = "tarikouahhaby@gmail.com";
        const email2 = "admin@clinicflow.com";
        const password = "85e04f37cd2";

        const hashedPassword = await hash(password, 10);

        // 1. Original Admin
        await prisma.superAdmin.upsert({
            where: { email },
            update: { password: hashedPassword },
            create: { email, password: hashedPassword },
        });

        // 2. New Admin (screenshot)
        await prisma.superAdmin.upsert({
            where: { email: email2 },
            update: { password: hashedPassword },
            create: { email: email2, password: hashedPassword },
        });

        return NextResponse.json({
            message: "SuperAdmins created/updated successfully.",
            emails: [email, email2],
            password_configured: true
        });

    } catch (error) {
        return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }
}
