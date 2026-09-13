
import { TenantType } from '@/types';
import { Leaf, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import AuthSection from './_components/auth-section';


const workspaceTypes: { value: TenantType; label: string }[] = [
    { value: "cooperative", label: "Farmer Cooperative" },
    { value: "fleet", label: "Mechanization Fleet" },
    { value: "coldchain", label: "Cold-Chain Operator" },
];


export default function TenantLoginPage() {

    // const { setTenant } = useTenant();

    //   const enterWorkspace = async () => {
    //     const { data: userData } = await supabase.auth.getUser();
    //     const user = userData.user;
    //     if (!user) return;

    //     const { data: profile } = await supabase
    //       .from("profiles")
    //       .select("tenant_type")
    //       .eq("id", user.id)
    //       .maybeSingle();

    //     const tenantType = profile?.tenant_type as TenantType | null | undefined;
    //     if (tenantType && workspaceTypes.some((item) => item.value === tenantType)) {
    //       setTenant(tenantType);
    //       navigate({ to: "/app", replace: true });
    //       return;
    //     }

    //     navigate({ to: "/onboarding", replace: true });
    //   };



    return (
        <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(380px,0.9fr)_minmax(520px,1.1fr)]">
            <section className="relative hidden overflow-hidden bg-sidebar px-12 py-10 text-sidebar-foreground lg:flex lg:flex-col">
                <div className="absolute inset-0 opacity-[0.06] auth-grid" aria-hidden="true" />
                <Link href="/" className="relative flex items-center gap-3 font-display text-xl font-bold">
                    <span className="grid size-10 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                        <Leaf className="size-5" />
                    </span>
                    AgroShare Ghana
                </Link>

                <div className="relative my-auto max-w-xl py-16">
                    <p className="text-xs font-semibold uppercase text-sidebar-primary">Secure operations workspace</p>
                    <h1 className="mt-5 max-w-lg text-4xl font-semibold leading-tight xl:text-5xl">
                        One platform for every link in Ghana’s agricultural value chain.
                    </h1>
                    <p className="mt-6 max-w-md text-base leading-7 text-sidebar-foreground/70">
                        Coordinate farmer communities, field machinery, cold storage and protected payments from one verified account.
                    </p>

                    <div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-3">
                        {workspaceTypes.map((workspace) => (
                            <div key={workspace.value} className="border-l-2 border-sidebar-primary/70 pl-3 text-sm text-sidebar-foreground/80">
                                {workspace.label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative flex items-center gap-2 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/60">
                    <ShieldCheck className="size-4 text-sidebar-primary" />
                    Identity protected by encrypted, passwordless authentication
                </div>
            </section>

            <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-display font-bold lg:hidden">
                        <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Leaf className="size-4" /></span>
                        AgroShare Ghana
                    </Link>
                    <div className="ml-auto text-sm text-muted-foreground">
                        New to AgroShare? <Link href="/auth/onboard" className="font-semibold text-primary hover:underline">Create a workspace</Link>
                    </div>
                </div>

                <AuthSection />
            </section>
        </main>
    )
}
