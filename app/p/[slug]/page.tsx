import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PatientView from "./PatientView";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;

    const clinic = await prisma.clinic.findUnique({
        where: { slug },
        include: { questions: { orderBy: { order: 'asc' } } },
    });

    if (!clinic) {
        notFound();
    }

    // Hotfix: Fetch language manually since Prisma Client is stale
    const langRes = await prisma.$queryRaw`SELECT ticketLanguage FROM Clinic WHERE slug = ${slug}`;
    const lang = Array.isArray(langRes) && langRes[0] ? (langRes[0] as any).ticketLanguage : "ar";

    return <PatientView clinic={{ ...clinic, ticketLanguage: lang }} />;
}
