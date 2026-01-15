export const dynamic = 'force-dynamic';

export default function EnvCheckPage() {
    const dbUrl = process.env.DATABASE_URL;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;

    return (
        <div className="p-10 font-mono">
            <h1 className="text-xl font-bold mb-4">Environment Debug</h1>
            <div className="space-y-2">
                <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
                <p>
                    <strong>DATABASE_URL:</strong>{' '}
                    {dbUrl ? (dbUrl.startsWith('mysql://') ? '✅ Present (Starts with mysql://)' : '⚠️ Present but weird format') : '❌ Missing (Undefined)'}
                </p>
                <p>
                    <strong>Length:</strong> {dbUrl?.length || 0} chars
                </p>
                <p>
                    <strong>NEXTAUTH_URL:</strong> {nextAuthUrl || '❌ Missing'}
                </p>
                <p>
                    <strong>NEXTAUTH_SECRET:</strong> {nextAuthSecret ? '✅ Present' : '❌ Missing'}
                </p>
            </div>
        </div>
    );
}
