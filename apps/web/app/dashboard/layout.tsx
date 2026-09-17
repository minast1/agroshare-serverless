import React from 'react'
import '../globals.css'
import { TenantType } from '@/types';
import { Users, Truck, Snowflake, Bell } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { getServerAuthSession } from '../amplify/auth/server-resource';
import NavLinks from './_components/nav-links';


const TENANT_LABELS: Record<TenantType, string> = {
  cooperative: "Farmer Cooperative",
  fleet: "Mechanization Fleet Owner",
  coldchain: "Cold-Chain Operator",
};



export default async function TenantDashboardLayout({ coldchain, cooperative, fleet }: { coldchain: React.ReactNode, cooperative: React.ReactNode, fleet: React.ReactNode }) {
  const { claims } = await getServerAuthSession('basic');

  const tenantType = claims!['tenant_type'] as TenantType;
  const name = claims!['name'] as string;
  const org = claims!['org'] as string;
  const role = claims!['role'] as string;


  return (
    <section className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <NavLinks tenantType={tenantType} tenantLabels={TENANT_LABELS} org={org} />

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b bg-background flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{TENANT_LABELS[tenantType]}</span>
            <span className="mx-2">/</span>
            {/* {nav.find(n => n.id === section)?.label} */}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-md hover:bg-muted">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                {name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-medium">{name}</div>
                <div className="text-[11px] text-muted-foreground">{role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {cooperative}
          {coldchain}
          {fleet}
        </main>
      </div>
    </section>
  )
}
