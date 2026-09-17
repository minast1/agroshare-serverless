import React from 'react'
import { getServerAuthSession } from '@/app/amplify/auth/server-resource'
import { TenantType } from '@/types';

async function FarmerCooperativeWorkSpace({ params }: { params: Promise<{ tenantId: string }> }) {
  const { claims } = await getServerAuthSession('basic');
  const tenantType = claims?.['tenant_type'] as TenantType;

  if (tenantType !== 'cooperative') {
    return null;
  }
  return (
    <div>Farmer Cooporative WorkSpace</div>
  )
}

export default FarmerCooperativeWorkSpace;

