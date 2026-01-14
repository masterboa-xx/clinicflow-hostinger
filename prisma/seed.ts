import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "admin@clinicflow.com";
    const password = await bcrypt.hash("password123", 10);
    const name = "Dr. Tarik";

    const existing = await prisma.clinic.findUnique({
        where: { email },
    });

    if (!existing) {
        await prisma.clinic.create({
            data: {
                email,
                password,
                name,
                logo: "https://placehold.co/400x400/indigo/white?text=Clinic", // Default sample logo
                slug: "demo-clinic",
                questions: {
                    create: [
                        {
                            id: "q_default_motif",
                            text: "Motif de la visite",
                            type: "TEXT",
                            required: true,
                            options: [],
                            placeholder: "Ex: consultation, contrôle, douleur..."
                        }
                    ]
                }
            },
        });
        console.log(`Created user: ${email}`);
    } else {
        console.log(`User already exists: ${email}`);
    }
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
