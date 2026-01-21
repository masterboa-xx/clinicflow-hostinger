
import { getAdminSubscriptions } from "@/app/actions/admin";
import { SubscriptionsClient } from "./SubscriptionsClient";

export default async function SubscriptionsPage() {
    const subs = await getAdminSubscriptions();

    return <SubscriptionsClient subs={subs} />;
}
