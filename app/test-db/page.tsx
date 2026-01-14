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
        // Simple query to check connection
        count = await prisma.clinic.count();
        status = "success";
        message = "✅ Database Connection Successful";
    } catch (error: any) {
        status = "error";
        message = "❌ Database Connection Failed";
        detailedError = JSON.stringify({
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        }, null, 2);
        console.error("Test DB Error:", error);
    }

    return (
        <div className="p-8 font-sans max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>

            <pre className="bg-slate-100 p-2 text-xs mb-4 border rounded">
                {sysInfo}
            </pre>

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
