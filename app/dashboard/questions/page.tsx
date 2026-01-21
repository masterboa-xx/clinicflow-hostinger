import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuestionsClient from "@/components/dashboard/QuestionsClient";


export default async function QuestionsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const clinic = await prisma.clinic.findUnique({
        where: { email: session.user.email },
        include: { questions: { orderBy: { order: 'asc' } } }
    });

    if (!clinic) {
        return <div>Erreur: Aucune clinique trouvée.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <main className="flex-1 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 font-display">Questions & Langue</h1>
                    <p className="text-slate-500">Personnalisez l'expérience patient.</p>
                </header>

                <div className="max-w-3xl">
                    <QuestionsClient
                        clinicSlug={clinic.slug}
                        initialQuestions={clinic.questions}
                        currentLanguage={await (async () => {
                            const res = await prisma.$queryRaw`SELECT ticketLanguage FROM Clinic WHERE id = ${clinic.id}`;
                            return Array.isArray(res) && res[0] ? (res[0] as any).ticketLanguage : "ar";
                        })()}
                    />
                </div>
            </main>
        </div>
    );
}
