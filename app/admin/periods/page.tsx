
import { getAdminTrials } from "@/app/actions/admin";
import { PeriodsClient } from "./PeriodsClient";

export default async function PeriodsPage() {
    const trials = await getAdminTrials();

    return <PeriodsClient trials={trials} />;
}
