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

    return <PatientView clinic={clinic} />;
}
