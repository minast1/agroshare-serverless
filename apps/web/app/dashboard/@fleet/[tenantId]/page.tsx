import { getServerAuthSession } from "@/app/amplify/auth/server-resource";
import { TenantType } from "@/types";

async function FleetOwnerWorkSpace({ params }: { params: Promise<{ tenantId: string }> }) {
    const { claims } = await getServerAuthSession();
    const tenantType = claims?.['tenant_type'] as TenantType;

    if (tenantType !== 'fleet') {
        return null;
    }
    return (
        <div>FleetOwner WorkSpace</div>
    )
}

export default FleetOwnerWorkSpace;

