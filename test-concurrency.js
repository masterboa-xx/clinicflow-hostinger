
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulate() {
    const clinicSlug = "dr-test";
    const clinic = await prisma.clinic.findUnique({ where: { slug: clinicSlug } });

    if (!clinic) {
        console.error("Clinic not found");
        return;
    }

    console.log("Starting Locked simulation...");

    // RESET COUNTERS FOR TEST
    await prisma.clinic.update({
        where: { id: clinic.id },
        data: { dailyTicketCount: 0, lastTicketDate: new Date() }
    });

    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(
            prisma.$transaction(async (tx) => {
                // Lock
                await tx.$executeRaw`SELECT * FROM Clinic WHERE id = ${clinic.id} FOR UPDATE`;

                const freshClinic = await tx.clinic.findUnique({ where: { id: clinic.id } });
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                let newCount = freshClinic.dailyTicketCount;
                if (new Date(freshClinic.lastTicketDate) < startOfDay) {
                    newCount = 1;
                } else {
                    newCount++;
                }

                await tx.clinic.update({
                    where: { id: clinic.id },
                    data: { dailyTicketCount: newCount, lastTicketDate: new Date() }
                });

                // Use sequential code from counter
                const ticketCode = `TEST-ATOMIC-${newCount}`;

                const lastTurn = await tx.turn.findFirst({
                    where: { clinicId: clinic.id, status: { in: ["WAITING", "URGENT", "DELAYED", "ACTIVE"] } },
                    orderBy: { position: "desc" },
                });
                const position = lastTurn ? lastTurn.position + 1 : 1;

                return await tx.turn.create({
                    data: {
                        clinicId: clinic.id,
                        ticketCode,
                        position,
                        status: "WAITING",
                        patientName: `Atomic ${i}`,
                    },
                });
            })
        );
    }

    const results = await Promise.all(promises);
    const codes = results.map(r => r.ticketCode);
    console.log("Created: ", codes);

    const positions = results.map(r => r.position);
    if (new Set(positions).size !== positions.length) {
        console.error("FAIL: Doubles detected!", positions);
    } else {
        console.log("SUCCESS: All atomic! No doubles.");
    }
}

simulate()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
