
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const slug = "dr-test";
        const clinic = await prisma.clinic.findUnique({ where: { slug } });

        const turns = await prisma.turn.findMany({
            where: { clinicId: clinic?.id, status: { not: "CANCELLED" } },
            select: { id: true, ticketCode: true, status: true, position: true }
        });

        return NextResponse.json({ turns });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
