"use client";
import { CheckCircle2, Snowflake, Truck, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { configureAuthForRole } from "@/app/amplify/auth/resource";
import { confirmSignUp, resendSignUpCode, signUp } from 'aws-amplify/auth';
import { TenantType } from "@/types";
import { generateTenantId } from "@/app/utils/tenant-generators";
import TenantDetails from "./_components/tenant";
import OrgDetails from "./_components/org";
import AccountDetails from "./_components/account";
import OTP from "./otp";
import SummaryDetails from "./_components/summary";

type StepId = "type" | "org" | "account" | "verify" | "done";

const STEPS: { id: StepId; label: string; hint: string }[] = [
  { id: "type", label: "Tenant", hint: "Organization type" },
  { id: "org", label: "Profile", hint: "Business info" },
  { id: "account", label: "Account", hint: "Your details" },
  { id: "verify", label: "Verify", hint: "Email OTP" },
  { id: "done", label: "Launch", hint: "Enter workspace" },
];

const OPTIONS: { id: TenantType; title: string; icon: React.ReactNode; tag: string; desc: string; color: string }[] = [
  { id: "cooperative", title: "Farmer Cooperative or Union", tag: "Type A", desc: "Manage a registry of farmers, place bulk orders, accept USSD requests from members.", icon: <Users className="w-6 h-6" />, color: "bg-primary" },
  { id: "fleet", title: "Mechanization Fleet Owner", tag: "Type B", desc: "Track tractors and harvesters live, accept plowing requests, log fuel and maintenance.", icon: <Truck className="w-6 h-6" />, color: "bg-accent" },
  { id: "coldchain", title: "Cold-Chain / Infrastructure", tag: "Type C", desc: "Monitor cold storage capacity, IoT temperature telemetry, and per-crate billing.", icon: <Snowflake className="w-6 h-6" />, color: "bg-chart-3" },
];


export default function OnboardPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex]?.id;
  const [otpError, setOtpError] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<TenantType | null>(null);
  const [org, setOrg] = useState("");
  const [phone, setPhone] = useState("");
  // OTP State Machine
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  // Validation States
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validName = fullName.trim().length >= 2;
  const validOrg = org.trim().length >= 2;
  const isFormValid = !!(validEmail && validName && validOrg && type && phone);

  function generateTemporarySecurePassword() {
    return "P@ss1" + Math.random().toString(36).slice(-8) + "!";
  }
  console.log({ type, email, fullName, org, phone })

  useEffect(() => {
    configureAuthForRole('basic');
  }, []);


  const handleAdminOtpSignUp = async () => {
    // e.preventDefault();

    if (!isFormValid) return;
    setSending(true);
    setErrorMessage(null);

    const tenantId = generateTenantId(org, type);

    try {
      const { nextStep } = await signUp({
        username: email,
        password: generateTemporarySecurePassword(),
        options: {
          userAttributes: {
            email,
            phone_number: phone,
            name: fullName,
            website: org
          },
          // Passed directly for direct non-redirect API calls
          clientMetadata: { tenant_id: tenantId, role: 'admin', tenant_type: type! },
          //autoSignIn: true
        }
      });

      console.log({ nextStep })
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setResendIn(30);
        setStepIndex(3);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failure.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 6) return;
    setVerifying(true);
    setOtpError(null);
    setErrorMessage(null);

    try {
      const { nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: enteredOtp,
      });
      if (nextStep.signUpStep === 'DONE') {
        setStepIndex(4);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Registration failure.');
    } finally {
      setVerifying(false);
    }
  };


  const handleResendCode = async () => {
    if (resendIn > 0) return;
    setSending(true);
    setErrorMessage(null);
    setOtpError(null);

    try {
      await resendSignUpCode({
        username: email,
      });
      setResendIn(30);
      setOtpDigits(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failure.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (resendIn <= 0 || stepIndex !== 3) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn, stepIndex]);
  // OTP

  //Input Field Helper Methods
  const handleOtpChange = (i: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otpDigits];
    next[i] = clean;
    setOtpDigits(next);
    if (clean && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill("").map((_, i) => text[i] ?? "");
    setOtpDigits(next);
    const nextFocus = Math.min(text.length, 5);
    inputsRef.current[nextFocus]?.focus();
  };

  // Automatically trigger validation when 6 digits are fully filled
  useEffect(() => {
    if (otpDigits.join("").length === 6) {
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpDigits]);

  const progressPct = useMemo(() => ((stepIndex + 1) / STEPS.length) * 100, [stepIndex]);
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/70 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg">
            AgroShare <span className="text-accent">Ghana</span>
          </Link>
          <div className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/tenant/login" className="text-primary font-medium">Sign in</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-20 grid lg:grid-cols-[400px_1fr] gap-8">
        {/* Stepper rail */}
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Get started</div>
            <h2 className="mt-1 text-xl font-bold">Create your workspace</h2>
            <p className="mt-2 text-sm text-muted-foreground">A few quick steps to provision your tenant instance.</p>
            <ol className="mt-8 space-y-4">
              {STEPS.map((s, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <li key={s.id} className="relative pl-10">
                    {i < STEPS.length - 1 && (
                      <span className={`absolute left-[8px] top-8 bottom-[-20px] w-px ${done ? "bg-primary" : "bg-border"}`} />
                    )}
                    <span className={`absolute -left-3 top-1 w-10 h-10 rounded-full grid place-items-center text-xs font-semibold border-2 transition
                      ${done ? "bg-primary border-primary text-primary-foreground"
                        : active ? "bg-background border-primary text-primary"
                          : "bg-background border-border text-muted-foreground"}`}>
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </span>
                    <div className="py-2">
                      <div className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.hint}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Content card */}
        <main>
          {/* mobile progress */}
          <div className="lg:hidden mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step {stepIndex + 1} of {STEPS.length}</span>
              <span>{STEPS[stepIndex]?.label}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden md:min-w-175">
            {/* STEP 1: TYPE */}
            {step === "type" && (
              <TenantDetails options={OPTIONS} type={type} setType={setType} setStepIndex={setStepIndex} />
            )}
            {/* STEP 2: ORG */}
            {step === "org" && (
              <OrgDetails org={org} setOrg={setOrg} setStepIndex={setStepIndex} phone={phone} setPhone={setPhone} />
            )}

            {/* STEP 3: ACCOUNT */}
            {step === "account" && (
              <AccountDetails fullName={fullName} setFullName={setFullName} email={email} setEmail={setEmail} validName={validName} validEmail={validEmail} sending={sending} handleAdminOtpSignUp={handleAdminOtpSignUp} setStepIndex={setStepIndex} />
            )}

            {/* STEP 2: OTP */}
            {step === "verify" && (
              <OTP
                otpDigits={otpDigits}
                handleVerifyOtp={handleVerifyOtp}
                handleOtpChange={handleOtpChange}
                handleOtpKey={handleOtpKey}
                verifying={verifying}
                handleOtpPaste={handleOtpPaste}
                otpError={otpError}
                resendIn={resendIn}
                handleResendCode={handleResendCode}
                setStepIndex={setStepIndex}
                inputsRef={inputsRef}
                email={email}
              />
            )}

            {/* STEP 4: DONE */}
            {step === "done" && (
              <SummaryDetails
                options={OPTIONS}
                setStepIndex={setStepIndex}
                fullName={fullName}
                email={email}
                type={type!}
                org={org}
                phone={phone} />
            )}
          </div>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            By continuing you agree to AgroShare Ghana&apos;s Terms of Service and Privacy Policy.
          </p>
        </main>
      </div>

      <footer className="border-t border-border mt-auto">
        <div className="mx-auto px-6 py-10 flex items-center justify-center text-sm text-muted-foreground">
          <div>© 2026 AgroShare Ghana. Built in Accra.</div>
        </div>
      </footer>
    </div>
  );
}