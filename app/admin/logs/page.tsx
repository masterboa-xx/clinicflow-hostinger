
import { getAuditLogs } from "@/app/actions/admin";
import { LogsClient } from "./LogsClient";

export default async function LogsPage() {
    const logs = await getAuditLogs();

    return <LogsClient logs={logs} />;
}
