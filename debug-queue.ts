
import { PrismaClient } from "@prisma/client";

// Use local connection string directly to avoid .env issues for this script
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "mysql://root:@localhost:3306/clinicflow_local" // Fallback or use env if needed
        }
    }
});
// Actually, let's just try to rely on the environment being loaded by tsx if possible, but the previous error suggested it used the prod URL from .env.
// The user has .env content: DATABASE_URL="mysql://u119997627_clinic_admin:WapimClinic2026@localhost:3306/u119997627_clinic_db?connection_limit=2"
// I suspect the user is running XAMPP locally and might have a different local DB setup or is trying to connect to the remote DB from local but 'localhost' in the URL is wrong for remote logic.
// However, the user provided .env shows localhost. This implies they are running the prod DB locally? Or they are on the server?
// The user OS is Windows. They are likely developing locally.
// If they are local, they probably use root/empty for XAMPP.
// Let's try to use the probable local credentials if the first one failed.

async function main() {
    try {
        console.log("Checking queue state...");
        const clinic = await prisma.clinic.findFirst();

        if (!clinic) {
            console.log("No clinic found in DB.");
            return;
        }

        console.log(`Clinic: ${clinic.name} (ID: ${clinic.id})`);
        console.log(`Daily Ticket Count (DB Attribute): ${clinic.dailyTicketCount}`);

        const activeTurns = await prisma.turn.findMany({
            where: {
                clinicId: clinic.id,
                status: { in: ["WAITING", "URGENT", "DELAYED", "ACTIVE"] }
            },
            orderBy: { position: "asc" }
        });

        console.log(`Found ${activeTurns.length} active/waiting tickets:`);
        if (activeTurns.length === 0) {
            console.log("-> Queue is effectively empty.");
        } else {
            activeTurns.forEach(t => {
                console.log(`- ${t.ticketCode} (${t.status}) Pos: ${t.position} ID: ${t.id}`);
            });
        }

        // Check for any "zombie" tickets that might be confusing the logic
        const lastTurnAny = await prisma.turn.findFirst({
            where: { clinicId: clinic.id },
            orderBy: { position: "desc" }
        });

        if (lastTurnAny) {
            console.log(`Highest Position Ticket (Any Status): ${lastTurnAny.ticketCode} (${lastTurnAny.status}) Pos: ${lastTurnAny.position}`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
