
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const email = "tarikouahhaby@gmail.com";
        const password = "85e04f37cd2";

        const hashedPassword = await hash(password, 10);

        const admin = await prisma.superAdmin.upsert({
            where: { email },
            update: { password: hashedPassword },
            create: {
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            message: "SuperAdmin created/updated successfully.",
            email,
            password_configured: true
        });

    } catch (error) {
        return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }
}
