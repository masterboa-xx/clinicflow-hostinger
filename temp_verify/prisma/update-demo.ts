
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const slug = "demo-clinic";

    // First delete existing questions
    await prisma.question.deleteMany({
        where: { clinic: { slug } }
    });

    console.log("Deleted old questions.");

    // Create new default question
    await prisma.clinic.update({
        where: { slug },
        data: {
            logo: "https://placehold.co/400x400/indigo/white?text=Clinic",
            questions: {
                create: [
                    {
                        text: "Motif de la visite",
                        type: "TEXT",
                        required: true,
                        placeholder: "Ex: consultation, contrôle, douleur...",
                        order: 0
                    }
                ]
            }
        }
    });

    console.log("Updated demo clinic with new default questions.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
