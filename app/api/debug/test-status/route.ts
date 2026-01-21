
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const turnId = "cmkk5mbxn001k8d18cj3p00zc"; // From previous debug output

        const turn = await prisma.turn.findUnique({
            where: { id: turnId },
            include: { clinic: { select: { avgTime: true, slug: true, name: true } } },
        });

        if (!turn) return NextResponse.json({ error: "Turn not found in findUnique" });

        const statusResult = await prisma.$queryRaw`SELECT status FROM Turn WHERE id = ${turnId}`;
        const freshStatus = Array.isArray(statusResult) && statusResult[0] ? (statusResult[0] as any).status : "UNKNOWN";

        return NextResponse.json({
            standardStatus: turn.status,
            rawStatus: freshStatus,
            rawResult: statusResult // Inspect the object structure
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
