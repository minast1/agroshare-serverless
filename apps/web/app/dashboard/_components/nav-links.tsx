"use client";
import React, { useState } from 'react'
import { NavItem, TenantType } from '@/types';
import { Users, LayoutDashboard, ShoppingCart, Radio, Network, Banknote, CreditCard, MapPin, ClipboardList, ClipboardSignature, Wrench, Boxes, Thermometer, Receipt, ChevronRight, Snowflake, Truck, LogOut } from 'lucide-react';

const TENANT_ICON: Record<TenantType, React.ReactNode> = {
    cooperative: <Users className="w-4 h-4" />,
    fleet: <Truck className="w-4 h-4" />,
    coldchain: <Snowflake className="w-4 h-4" />,
};


const NAV: Record<TenantType, NavItem[]> = {
    cooperative: [
        { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: "registry", label: "Farmer Registry", icon: <Users className="w-4 h-4" /> },
        { id: "orders", label: "Bulk Supply Orders", icon: <ShoppingCart className="w-4 h-4" /> },
        { id: "ussd", label: "USSD Integration Hub", icon: <Radio className="w-4 h-4" /> },
        { id: "logistics", label: "Logistics & Service Requests", icon: <Network className="w-4 h-4" /> },
        { id: "escrow", label: "Escrow Engine", icon: <Banknote className="w-4 h-4" /> },
        { id: "billing", label: "Billing & Subscriptions", icon: <CreditCard className="w-4 h-4" /> },
    ],
    fleet: [
        { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: "fleet", label: "Live Fleet Control", icon: <MapPin className="w-4 h-4" /> },
        { id: "dispatch", label: "Dispatch Queue", icon: <ClipboardList className="w-4 h-4" /> },
        { id: "registry", label: "Fleet & Team Registry", icon: <ClipboardSignature className="w-4 h-4" /> },
        { id: "maintenance", label: "Maintenance Log", icon: <Wrench className="w-4 h-4" /> },
        { id: "escrow", label: "Escrow Engine", icon: <Banknote className="w-4 h-4" /> },
        { id: "billing", label: "Billing & Subscriptions", icon: <CreditCard className="w-4 h-4" /> },
    ],
    coldchain: [
        { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: "capacity", label: "Volumetric Capacity", icon: <Boxes className="w-4 h-4" /> },
        { id: "telemetry", label: "IoT Telemetry", icon: <Thermometer className="w-4 h-4" /> },
        { id: "ledger", label: "Storage Billing", icon: <Receipt className="w-4 h-4" /> },
        { id: "escrow", label: "Escrow Engine", icon: <Banknote className="w-4 h-4" /> },
        { id: "billing", label: "Billing & Subscriptions", icon: <CreditCard className="w-4 h-4" /> },
    ],
};
const NavLinks = ({ tenantType, tenantLabels, org }: { tenantType: TenantType, tenantLabels: Record<TenantType, string>, org: string }) => {
    const nav = NAV[tenantType];
    const [section, setSection] = useState("overview");
    return (
        <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
            <div className="p-5 border-b border-sidebar-border">
                <div className="font-display font-bold text-lg">AgroShare <span className="text-accent">GH</span></div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="w-7 h-7 rounded-md bg-sidebar-accent grid place-items-center">{TENANT_ICON[tenantType]}</span>
                    <div className="min-w-0">
                        <div className="font-semibold truncate">{org}</div>
                        <div className="opacity-70 truncate">{tenantLabels[tenantType]}</div>
                    </div>
                </div>
            </div>

            {tenantType !== "coldchain" && (
                <div className="px-4 pt-4">
                    {/* <MomoWidget tenant={tenantType} /> */}
                </div>
            )}

            <nav className="flex-1 p-3 space-y-1">
                {nav.map((item) => {
                    const active = section === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setSection(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}
                        >
                            {item.icon}<span className="flex-1 text-left">{item.label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                    );
                })}
            </nav>
            <div className="p-3 border-t border-sidebar-border">

                <button
                    // onClick={async () => {
                    //   await queryClient.cancelQueries();
                    //   queryClient.clear();
                    //   await supabase.auth.signOut();
                    //   setTenant(null);
                    //   navigate({ to: "/login", replace: true });
                    // }}
                    className="mt-3 w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
            </div>
        </aside>

    )
}

export default NavLinks