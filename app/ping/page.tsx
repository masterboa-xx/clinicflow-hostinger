export const dynamic = 'force-static';

export default function PingPage() {
    return (
        <div style={{ padding: 20, fontFamily: 'system-ui' }}>
            <h1>Pong! 🏓</h1>
            <p>Server is running.</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    );
}
