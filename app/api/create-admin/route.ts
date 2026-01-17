
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const email = "superadmin@clinicflow.com";
        const password = "WapimClinic2026SecureKey!"; // Using the secure key as initial password

        const existing = await prisma.superAdmin.findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json({ message: "SuperAdmin already exists." });
        }

        const hashedPassword = await hash(password, 10);

        await prisma.superAdmin.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            message: "SuperAdmin created successfully.",
            email,
            temp_password: password
        });

    } catch (error) {
        return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }
}
