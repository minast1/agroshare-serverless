import { getServerAuthSession } from "@/app/amplify/auth/server-resource";
import { TenantType } from "@/types";

async function ColdchainOperatorWorkSpace({ params }: { params: Promise<{ tenantId: string }> }) {
    const { claims } = await getServerAuthSession();
    const tenantType = claims?.['tenant_type'] as TenantType;

    if (tenantType !== 'coldchain') {
        return null;
    }
    return (
        <div>ColdchainOperator WorkSpace</div>
    )
}

export default ColdchainOperatorWorkSpace;

