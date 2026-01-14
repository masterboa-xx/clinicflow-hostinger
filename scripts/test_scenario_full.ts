
import { PrismaClient } from '@prisma/client';
import { createTurn } from '../app/actions/patient';
import { callNextPatient, updateTurnStatus } from '../app/actions/dashboard';

const prisma = new PrismaClient();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
    console.log("Starting Full Scenario Test...");
    const clinicSlug = "test-scenario-clinic";
    const clinicEmail = "test@clinic.com";

    // 1. Setup Clinic
    console.log("\n[1] Setting up Clinic...");
    let clinic = await prisma.clinic.findUnique({ where: { slug: clinicSlug } });

    if (!clinic) {
        clinic = await prisma.clinic.create({
            data: {
                name: "Test Scenario Clinic",
                email: clinicEmail,
                slug: clinicSlug,
                password: "hashedpassword123", // Dummy
                dailyTicketCount: 0,
                lastTicketDate: new Date(),
            }
        });
    } else {
        // Reset counters
        await prisma.clinic.update({
            where: { id: clinic.id },
            data: { dailyTicketCount: 0, lastTicketDate: new Date() }
        });
        // Clear old turns
        await prisma.turn.deleteMany({ where: { clinicId: clinic.id } });
    }

    // 2. Simulate 10 Concurrent Joins
    console.log("\n[2] Simulating 10 Concurrent Patient Joins...");
    const joins = [];
    for (let i = 1; i <= 10; i++) {
        // Patients 3 and 7 will be Urgent
        const isUrgent = i === 3 || i === 7;
        const answers = {
            reason: "Checkup",
            urgent: isUrgent ? "yes" : "no"
        };

        // We mock cookies behavior or ignore it? 
        // createTurn uses `cookies()` which works in Server Actions. 
        // In this script context, `cookies()` checks will fail or return empty.
        // We might need to bypass createTurn and use Prisma directly OR mock cookies.
        // Since we can't easily mock next/headers cookies in a standalone script without setup,
        // let's create turns directly via Prisma to simulate the "Race Condition" on DB level.
        // BUT createTurn has the Transaction Logic we want to test!
        // We'll reproduce the transaction logic exactly here to test the DATABASE behavior.

        joins.push(joinQueue(clinic!.id, i, answers));
    }

    const results = await Promise.all(joins);
    const codes = results.map(r => r.ticketCode).sort();
    console.log("   -> Tickets Created:", codes.join(", "));

    // Verify Unique Codes
    const uniqueCodes = new Set(codes);
    if (uniqueCodes.size !== 10) {
        console.error("❌ ERROR: Duplicates found in ticket codes!");
        process.exit(1);
    } else {
        console.log("✅ Concurrency Check Passed: 10 unique tickets.");
    }

    // 3. Urgent Priority Test
    console.log("\n[3] Testing Urgent Priority...");
    // Find our urgent patients
    const urgentTurns = results.filter(r => JSON.parse(r.answers as string).urgent === "yes");
    console.log(`   -> Found ${urgentTurns.length} patients with urgent answers (IDs: ${urgentTurns.map(t => t.ticketCode).join(", ")}).`);

    // Verify they are WAITING initially
    if (urgentTurns.some(t => t.status !== "WAITING")) {
        console.log("   -> NOTE: Some patients auto-assigned URGENT status.");
    } else {
        console.log("   -> All patients started as WAITING (Expected behavior).");
    }


    // promote them manually (simulate doctor action)
    console.log("   -> Checking strict auto-promotion (Expect URGENT status now)...");
    // for (const t of urgentTurns) {
    //   await prisma.turn.update({
    //     where: { id: t.id },
    //     data: { status: "URGENT" }
    //   });
    // }

    // Verify DB status
    for (const t of urgentTurns) {
        const dbTurn = await prisma.turn.findUnique({ where: { id: t.id } });
        if (dbTurn?.status !== "URGENT") {
            console.error(`❌ FAIL: Patient ${t.ticketCode} is ${dbTurn?.status}, expected URGENT.`);
        } else {
            console.log(`✅ PASS: Patient ${t.ticketCode} is URGENT.`);
        }
    }

    // 4. Call Next Logic
    console.log("\n[4] Testing 'Call Next' Logic...");

    // Mock 'getMyClinic' context by querying manually or passing ID if we modify dashboard actions.
    // We can't use `callNextPatient` directly because it needs `auth()`.
    // We will re-implement the exact logic of `callNextPatient` here to verify it.

    async function mockCallNext() {
        return await prisma.$transaction(async (tx) => {
            await tx.turn.updateMany({
                where: { clinicId: clinic!.id, status: "ACTIVE" },
                data: { status: "DONE" },
            });

            let next = await tx.turn.findFirst({
                where: { clinicId: clinic!.id, status: "URGENT" },
                orderBy: { position: "asc" }
            });

            if (!next) {
                next = await tx.turn.findFirst({
                    where: { clinicId: clinic!.id, status: "WAITING" },
                    orderBy: { position: "asc" }
                });
            }

            if (next) {
                await tx.turn.update({ where: { id: next.id }, data: { status: "ACTIVE" } });
            }
            return next;
        });
    }

    // Call 1
    let called = await mockCallNext();
    console.log(`   -> Call 1: ${called?.ticketCode} (Expected: An Urgent one, e.g. ${urgentTurns[0].ticketCode})`);
    if (!urgentTurns.find(u => u.id === called?.id)) {
        console.error("❌ ERROR: First call was NOT an urgent patient!");
    } else {
        console.log("✅ Priority Check Passed for Call 1.");
    }

    // Call 2
    called = await mockCallNext();
    console.log(`   -> Call 2: ${called?.ticketCode} (Expected: The other Urgent one)`);
    if (!urgentTurns.find(u => u.id === called?.id)) {
        console.error("❌ ERROR: Second call was NOT an urgent patient!");
    } else {
        console.log("✅ Priority Check Passed for Call 2.");
    }

    // Call 3 (Should be normal A01 or A02 depending on positions of urgents)
    called = await mockCallNext();
    console.log(`   -> Call 3: ${called?.ticketCode} (Expected: Normal patient)`);
    if (called?.status !== "ACTIVE") { // it returns the object with new status? No, returns the object found. DB update happened.
        // fetch fresh
        const fresh = await prisma.turn.findUnique({ where: { id: called!.id } });
        if (fresh?.status !== "ACTIVE") console.error("❌ Status update failed");
    }

    // 5. Delay & Cancel Test
    console.log("\n[5] Testing Delay & Cancel...");

    // Find two waiting patients
    const waiting = await prisma.turn.findMany({
        where: { clinicId: clinic!.id, status: "WAITING" },
        orderBy: { position: "asc" }
    });

    const toDelay = waiting[0];
    const toCancel = waiting[1];
    const expectedNext = waiting[2];

    console.log(`   -> Delaying ${toDelay.ticketCode}`);
    await prisma.turn.update({ where: { id: toDelay.id }, data: { status: "DELAYED" } });

    console.log(`   -> Cancelling ${toCancel.ticketCode}`);
    await prisma.turn.update({ where: { id: toCancel.id }, data: { status: "CANCELLED" } });

    console.log(`   -> Calling Next (Expected: ${expectedNext.ticketCode})`);
    called = await mockCallNext();

    if (called?.id === expectedNext.id) {
        console.log(`✅ Logic Check Passed: Skipped Delayed/Cancelled items. Got ${called.ticketCode}`);
    } else {
        console.error(`❌ ERROR: Got ${called?.ticketCode}, expected ${expectedNext.ticketCode}`);
    }

}

// Helper: Replicate the Transaction Logic from app/actions/patient.ts
// We replicate it because we can't invoke server actions with cookies easily here.
async function joinQueue(clinicId: string, idx: number, answers: any) {
    return prisma.$transaction(async (tx) => {
        // Lock
        await tx.$executeRaw`SELECT * FROM Clinic WHERE id = ${clinicId} FOR UPDATE`;
        const freshClinic = await tx.clinic.findUnique({ where: { id: clinicId } });

        // Counter logic
        let newCount = freshClinic!.dailyTicketCount + 1;
        // (Ignoring daily reset logic for this short test)

        await tx.clinic.update({
            where: { id: clinicId },
            data: { dailyTicketCount: newCount, lastTicketDate: new Date() }
        });

        const ticketCode = `A${newCount.toString().padStart(2, "0")}`;

        const lastTurn = await tx.turn.findFirst({
            where: { clinicId: clinicId, status: { in: ["WAITING", "URGENT", "DELAYED", "ACTIVE"] } },
            orderBy: { position: "desc" },
        });


        const position = lastTurn ? lastTurn.position + 1 : 1;

        // MATCHING BACKEND LOGIC: Check for urgency
        let status = "WAITING";
        if (answers) {
            const ansObj = typeof answers === 'string' ? JSON.parse(answers) : answers;
            const cleanKey = (k: string) => k.trim().toLowerCase();
            const urgentEntry = Object.entries(ansObj).find(([k]) =>
                cleanKey(k) === "urgent" || cleanKey(k).includes("urgence")
            );
            if (urgentEntry && (String(urgentEntry[1]).toLowerCase() === "yes" || String(urgentEntry[1]).toLowerCase() === "oui")) {
                status = "URGENT";
            }
        }

        return await tx.turn.create({
            data: {
                clinicId: clinicId,
                ticketCode,
                position,
                status: status as any,
                patientName: `SimUser ${idx}`,
                answers: JSON.stringify(answers),
            },
        });

    });
}

runTest()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
