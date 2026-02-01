import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TVView } from "@/components/tv/TVView";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function TVPage({ params }: PageProps) {
    const { slug } = await params;

    const clinic = await prisma.clinic.findUnique({
        where: { slug },
        select: { name: true, logo: true, slug: true, ticketLanguage: true }
    });

    if (!clinic) {
        notFound();
    }

    return <TVView clinic={clinic} />;
}
