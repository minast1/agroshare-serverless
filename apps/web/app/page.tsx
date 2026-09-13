import { Snowflake, Truck, Users, ArrowRight, CheckCircle2, TrendingDown, Activity } from "lucide-react"
import Link from "next/link";


export default function Home() {


  // Feedback states
  //const [infoMessage, setInfoMessage] = useState<string | null>(null);
  //const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //const [challengeActive, setChallengeActive] = useState(false);
  //const [sessionData, setSessionData] = useState(null);
  //console.log(sessionData)
  // 2. LISTEN FOR OAUTH REDIRECTS (Capturing Google return packets)
  // useEffect(() => {
  //   // Default to initializing standard client profiles on load
  //   configureAmplifyForRole('basic');

  //   const unsubscribe = Hub.listen('auth', ({ payload }) => {
  //     if (payload.event === 'customOAuthState') {
  //       setInfoMessage(`Returned via Google redirection! Passed State: ${payload.data}`);
  //       checkActiveSession();
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  // =========================================================================
  // AUTH FLOW EXECUTION HANDLERS
  // =========================================================================

  // FLOW A: Super-admin Email & Password Authentication
  // const handleSuperAdminSignIn = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   clearMessages();
  //   configureAmplifyForRole('superadmin'); // Pivot singleton to Super-admin credentials
  //   console.log('Configured Amplify for superadmin')

  //   try {
  //     const { isSignedIn } = await signIn({ username: email, password });
  //     if (isSignedIn) {
  //       setInfoMessage('Super-admin Authenticated Successfully!');
  //       await checkActiveSession();
  //     }
  //   } catch (err: any) {
  //     setErrorMessage(err.message || 'Super-admin validation failed.');
  //   }
  // };

  // // FLOW B: Admin Social Authentication via Google
  // const handleGoogleSocialAuth = async () => {
  //   clearMessages();
  //   configureAmplifyForRole('basic'); // Pivot singleton to standard Client App ID

  //   try {
  //     await signInWithRedirect({
  //       provider: 'Google',

  //       customState : JSON.stringify({ tenant_id: tenantId, tenant_type: 'vendor', role: 'admin' }) ,
  //     });
  //   } catch (err: any) {
  //     setErrorMessage(err.message || 'OAuth Redirection Blocked.');
  //   }
  // };


  // // FLOW D: Admin OTP Verification (Submitting the code to finalize user account)
  // const handleAdminVerifyOtp = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   clearMessages();
  //   configureAmplifyForRole('basic');

  //   try {
  //     const { isSignUpComplete } = await confirmSignUp({
  //       username: email,
  //       confirmationCode: otpCode,
  //       options: {
  //         // Carry context forward to the Post-Confirmation execution lambda
  //         clientMetadata: { tenantId, role: 'admin' }
  //       }
  //     });

  //     if (isSignUpComplete) {
  //       setInfoMessage('Account Confirmed! Your custom tenant attributes have been permanently saved. You can now use the email OTP flow.');
  //       setAdminSubFlow('otp_signin');
  //     }
  //   } catch (err: any) {
  //     setErrorMessage(err.message || 'Validation code rejection.');
  //   }
  // };

  // const handleSubmitLoginOtp = async (e: React.FormEvent) => {
  //    e.preventDefault();
  //   clearMessages();
  //   configureAmplifyForRole('basic');
  //    if (!otpCode || otpCode.trim().length !== 6) {
  //   setErrorMessage('Please enter a valid 6-digit confirmation PIN.');
  //   return;
  // }
  //   try {
  //     const { isSignedIn, nextStep } = await confirmSignIn({challengeResponse : otpCode.trim()})
  //        if (isSignedIn) {
  //       setInfoMessage('Admin Custom OTP Authenticated Successfully!');
  //       setChallengeActive(false); // Reset the UI form challenge visibility toggle
  //       setOtpCode('');
  //        await checkActiveSession();
  //     } else {
  //       setInfoMessage(`Additional authentication step required: ${nextStep.signInStep}`);
  //     }
  //   } catch (err: any) {
  //     setErrorMessage(err.message || 'Admin validation failed.');
  //   }
  // };

  // // FLOW E: Direct Email OTP Passwordless Sign-In
  // const handleAdminOtpSignIn = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   clearMessages();
  //   configureAmplifyForRole('basic');

  //   try {
  //     const { nextStep } = await signIn({
  //       username: email,
  //       options: {
  //         authFlowType: 'CUSTOM_WITHOUT_SRP',
  //         clientMetadata: { tenantId, role: 'admin' }
  //       }
  //     });
  //     if(nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
  //       setInfoMessage(`Challenge created: ${nextStep.signInStep}. Pull code from Ministack logs.`);
  //       setChallengeActive(true);
  //       setOtpCode('');
  //     }
  //   } catch (err: any) {
  //     setErrorMessage(err.message || 'OTP Challenge initiation failed.');
  //   }
  // };

  return (
    <div className="min-h-screen bg-background text-foreground bg-[url('/app_bg.png')] bg-repeat bg-center">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground grid place-items-center">A</span>
            AgroShare <span className="text-accent">Ghana</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#problem" className="hover:text-foreground">The Problem</a>
            <a href="#tenants" className="hover:text-foreground">Tenant Types</a>
            <a href="#how" className="hover:text-foreground">How it Works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/tenant/login" className="text-sm px-3 py-2 rounded-md hover:bg-muted">Sign in</Link>
            <Link href="/auth/onboard" className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.07_145/.18),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-accent/15 text-accent-foreground border border-accent/30 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Live across 7 regions in Ghana
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Shared infrastructure for <span className="text-primary">Ghana&apos;s</span> next harvest.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              AgroShare connects farmer cooperatives, mechanization fleets, and cold-chain operators on one
              platform — cutting post-harvest loss and unlocking idle machinery from Tamale to Techiman.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/onboard" className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">
                Start onboarding <ArrowRight className="w-4 h-4" />
              </Link>
              {/* <Link href="/login" className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border bg-card hover:bg-muted font-medium">
                Try a demo persona
              </Link> */}
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat value="38%" label="Post-harvest loss cut" />
              <Stat value="2.4×" label="Tractor utilization" />
              <Stat value="GH₵12M" label="Escrow processed" />
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-medium text-muted-foreground">LIVE NETWORK</div>
                <div className="text-xs text-accent flex items-center gap-1"><Activity className="w-3 h-3" /> 142 nodes online</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Techiman Hub", v: "84%", c: "bg-primary" },
                  { label: "Tamale Yard", v: "12 active", c: "bg-accent" },
                  { label: "Accra Cold 2", v: "4.2°C", c: "bg-chart-3" },
                  { label: "Ejura Field", v: "Plowing", c: "bg-primary" },
                  { label: "Kumasi Depot", v: "67%", c: "bg-chart-5" },
                  { label: "Sunyani Co-op", v: "203 farmers", c: "bg-accent" },
                ].map((x) => (
                  <div key={x.label} className="rounded-lg border border-border p-3 bg-background">
                    <div className={`w-2 h-2 rounded-full ${x.c} mb-2`} />
                    <div className="text-[11px] text-muted-foreground">{x.label}</div>
                    <div className="text-sm font-semibold mt-1">{x.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-primary text-primary-foreground p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-80">Escrow cleared today</div>
                  <div className="text-2xl font-bold font-display">GH₵ 84,250.00</div>
                </div>
                <div className="text-xs bg-primary-foreground/15 px-2 py-1 rounded">+12%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-3 gap-8">
          <Problem icon={<TrendingDown className="w-5 h-5" />} title="40% of harvests rot before market" body="Tomato, yam, and pepper losses cost Ghanaian farmers GH₵2B+ annually due to fragmented cold storage." />
          <Problem icon={<Truck className="w-5 h-5" />} title="Tractors idle 6 months a year" body="Mechanization fleets in Tamale and Kumasi are booked privately; cooperatives can't reach them." />
          <Problem icon={<Users className="w-5 h-5" />} title="Cash never reaches the field" body="Bulk orders collapse without trust. We escrow MoMo payments and auto-split on GPS-verified completion." />
        </div>
      </section>

      <section id="tenants" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Three tenant types. One unified platform.</h2>
          <p className="mt-4 text-muted-foreground">The interface morphs to your role. Pick yours during onboarding.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <TenantCard color="bg-primary" icon={<Users className="w-5 h-5" />} title="Farmer Cooperative" body="Member registry, bulk ordering, USSD shortcode for offline farmers." features={["Digital Farmer Registry", "Bulk Supply Orders", "USSD *714*45#"]} />
          <TenantCard color="bg-accent" icon={<Truck className="w-5 h-5" />} title="Mechanization Fleet" body="Live GPS fleet control, driver dispatch queue, maintenance logbook." features={["Live Fleet Map", "Dispatch Queue", "Fuel & Engine Hours"]} />
          <TenantCard color="bg-chart-3" icon={<Snowflake className="w-5 h-5" />} title="Cold-Chain Operator" body="Volumetric capacity, IoT temperature telemetry, storage billing ledger." features={["Capacity Monitor", "IoT Telemetry", "GH₵/crate Billing"]} />
        </div>
      </section>

      <section id="how" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Mobile Money escrow, GPS-verified payouts.</h2>
            <p className="mt-4 opacity-85 max-w-lg">Every transaction flows through a shared escrow engine. Funds lock on order, release on field completion, and split automatically — vendor, cooperative, and platform.</p>
          </div>
          <div className="rounded-xl bg-primary-foreground/10 backdrop-blur p-6 space-y-3 border border-primary-foreground/20">
            {[
              { l: "Locked Funds", v: "GH₵ 142,800.00" },
              { l: "Vendor Payouts (85%)", v: "GH₵ 121,380.00" },
              { l: "Platform Commission (5%)", v: "GH₵ 7,140.00" },
            ].map(r => (
              <div key={r.l} className="flex justify-between items-center py-2 border-b border-primary-foreground/15 last:border-0">
                <span className="text-sm opacity-80">{r.l}</span>
                <span className="font-mono font-semibold">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto px-6 py-10 flex items-center justify-center text-sm text-muted-foreground">
          <div>© 2026 AgroShare Ghana. Built in Accra.</div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold font-display text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Problem({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function TenantCard({ color, icon, title, body, features }: { color: string; icon: React.ReactNode; title: string; body: string; features: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 hover:shadow-lg transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${color} text-white grid place-items-center mb-4`}>{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <ul className="mt-4 space-y-2">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> {f}</li>
        ))}
      </ul>
    </div>
  );

}

