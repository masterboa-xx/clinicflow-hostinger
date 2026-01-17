
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Testing DB connection...");
        const dbUrl = process.env.DATABASE_URL;
        console.log("DB URL found:", !!dbUrl);

        // Masked URL for security in response
        const maskedUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ":***@") : "undefined";

        // Try a simple query
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: "success",
            message: "Database connection successful!",
            env_db_url: maskedUrl
        });
    } catch (error) {
        console.error("DB Connection Test Failed:", error);
        return NextResponse.json({
            status: "error",
            message: "Database connection failed.",
            error: (error as any).message,
            env_db_url: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@") : "undefined"
        }, { status: 500 });
    }
}
