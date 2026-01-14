import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SettingsPage from "./settings-client";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const clinic = await prisma.clinic.findUnique({
        where: { email: session.user.email },
        select: { name: true, avgTime: true, slug: true, questions: { orderBy: { order: 'asc' } } },
    });

    if (!clinic) redirect("/login");

    return <SettingsPage clinic={clinic} />;
}
