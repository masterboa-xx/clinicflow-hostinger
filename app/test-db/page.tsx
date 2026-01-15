import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function TestDBPage() {
    let message = "Testing connection...";
    let status = "pending";
    let count = -1;
    let detailedError = "";
    let sysInfo = "";

    // Helper to get sys info safely
    try {
        const os = require('os');
        sysInfo = `System Info:
Platform: ${process.platform}
Arch: ${process.arch}
Release: ${os.release()}
Node: ${process.version}
CPUs: ${os.cpus()[0]?.model || 'Unknown'}
`;
    } catch (e) {
        sysInfo = "Could not fetch system info";
    }


    try {
        // Attempt connection safely to avoid 503 crash
        // Note: Creating a new client here for testing connection specifically
        const client = new PrismaClient({ log: ["query", "info", "warn", "error"] });

        // Use $queryRaw for a lightweight check
        await client.$queryRaw`SELECT 1`;

        status = 'success';
        message = 'Successfully connected to the database!';

        await client.$disconnect();
    } catch (error: any) {
        console.error("DB ERROR captured:", error);
        status = 'error';
        message = 'Connection Failed (Captured)';
        // Serialize the error safely
        sysInfo += `\n\n--- ERROR DETAILS ---\nName: ${error.name}\nMessage: ${error.message}\nCode: ${error.code || 'N/A'}\nMeta: ${JSON.stringify(error.meta || {}, null, 2)}`;

        detailedError = JSON.stringify({
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        }, null, 2);
    }

    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    // Extract password roughly to check for special chars (debugging only)
    const passwordMatch = dbUrl.match(/:([^:@]+)@/);
    const passwordDebug = passwordMatch ?
        `First char: ${passwordMatch[1].substring(0, 1)}, Last char: ${passwordMatch[1].slice(-1)}, Length: ${passwordMatch[1].length}`
        : 'No password found';

    return (
        <div className="p-6 font-sans">
            <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>

            <div className="bg-gray-100 p-4 rounded mb-6 font-mono text-sm whitespace-pre-wrap">
                <p><strong>DB URL (Masked):</strong> {maskedUrl}</p>
                <p><strong>Password Debug:</strong> {passwordDebug}</p>
                <p><strong>System Info:</strong></p>
                <pre className="bg-slate-100 p-2 text-xs mb-4 border rounded">
                    {sysInfo}
                </pre>
            </div>

            <div className={`p-4 rounded-lg border ${status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <p className="text-xl font-semibold">{message}</p>

                {status === 'success' && (
                    <p className="mt-2">Clinics found: <strong>{count}</strong></p>
                )}
            </div>

            {detailedError && (
                <div className="mt-6">
                    <h3 className="font-bold text-red-700 mb-2">Error Details:</h3>
                    <pre className="bg-slate-900 text-slate-50 p-4 rounded overflow-auto text-xs whitespace-pre-wrap">
                        {detailedError}
                    </pre>
                    <p className="mt-4 text-sm text-slate-500">
                        Please take a screenshot of this error.
                    </p>
                </div>
            )}

            <div className="mt-8 pt-8 border-t">
                <h2 className="text-lg font-bold mb-2">Environment Debug</h2>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                    <li>NODE_ENV: {process.env.NODE_ENV}</li>
                    <li>Has DATABASE_URL: {process.env.DATABASE_URL ? "✅ Yes" : "❌ No"}</li>
                    <li>Has NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? "✅ Yes" : "❌ No"}</li>
                    <li>Has AUTH_SECRET: {process.env.AUTH_SECRET ? "✅ Yes" : "❌ No"}</li>
                </ul>
            </div>
        </div>
    );
}
