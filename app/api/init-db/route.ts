import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Locate local prisma binary
        const prismaPath = path.join(process.cwd(), 'node_modules', '.bin', 'prisma');

        // Command to push db
        // We utilize the exact binary to avoid path issues
        const command = `"${prismaPath}" db push --accept-data-loss`;

        console.log(`Executing: ${command}`);

        const { stdout, stderr } = await execAsync(command);

        return NextResponse.json({
            success: true,
            message: "Database initialized successfully!",
            stdout,
            stderr
        });

    } catch (error: any) {
        console.error("DB Init Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error),
            stderr: error.stderr
        }, { status: 500 });
    }
}
