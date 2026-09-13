"use client";

import React, { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Globe2, Loader2, LockKeyhole, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GoogleMark from './google-mark';

type LoginStage = "email" | "verify";


const AuthSection = () => {
    const [stage, setStage] = useState<LoginStage>("email");
    const [email, setEmail] = useState("");
    const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [resendIn, setResendIn] = useState(0);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


    useEffect(() => {
        if (resendIn <= 0) return;
        const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [resendIn]);

    const sendCode = async () => {
        if (!validEmail) return;
        setBusy(true);
        setError("");
        // const { error: sendError } = await supabase.auth.signInWithOtp({
        //   email: email.trim().toLowerCase(),
        //   options: { shouldCreateUser: true },
        // });
        setBusy(false);

        // if (sendError) {
        //   setError(sendError.message);
        //   return;
        // }

        setDigits(Array(6).fill(""));
        setResendIn(45);
        setStage("verify");
        window.setTimeout(() => inputsRef.current[0]?.focus(), 80);
    };

    const verifyCode = async () => {
        const token = digits.join("");
        if (token.length !== 6) return;
        setBusy(true);
        setError("");

        // const { error: verifyError } = await supabase.auth.verifyOtp({
        //   email: email.trim().toLowerCase(),
        //   token,
        //   type: "email",
        // });

        //     if (verifyError) {
        //       setBusy(false);
        //       setError("That code is invalid or has expired. Request a new code and try again.");
        //       return;
        //     }

        //     toast.success("Email verified. Welcome back to AgroShare Ghana.");
        //     await enterWorkspace();
        //     setBusy(false);
    };

    const signInWithGoogle = async () => {
        setBusy(true);
        setError("");
        // const result = await lovable.auth.signInWithOAuth("google", {
        //   redirect_uri: `${window.location.origin}/login`,
        //   extraParams: { prompt: "select_account" },
        // });

        //     if (result.error) {
        //       setBusy(false);
        //       setError(result.error.message || "Google sign-in could not be completed.");
        //       return;
        //     }

        //     if (!result.redirected) await enterWorkspace();
        //     setBusy(false);
    };

    const updateDigit = (index: number, value: string) => {
        const clean = value.replace(/\D/g, "").slice(-1);
        setDigits((current) => current.map((digit, position) => (position === index ? clean : digit)));
        if (clean && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && !digits[index] && index > 0) inputsRef.current[index - 1]?.focus();
        if (event.key === "Enter") void verifyCode();
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        event.preventDefault();
        setDigits(Array(6).fill("").map((_, index) => pasted[index] ?? ""));
        inputsRef.current[Math.min(pasted.length, 6) - 1]?.focus();
    };



    return (
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">
            <div className="w-full">
                {stage === "email" ? (
                    <>
                        <div className="mb-8">
                            <div className="mb-5 grid size-12 place-items-center rounded-md border bg-muted text-primary">
                                <LockKeyhole className="size-5" />
                            </div>
                            <h2 className="text-3xl font-semibold">Welcome back</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Sign in securely to access your organization’s workspace.
                            </p>
                        </div>

                        <Button variant="outline" size="lg" className="h-12 w-full" onClick={signInWithGoogle} disabled={busy}>
                            <GoogleMark />
                            Continue with Google
                        </Button>

                        <div className="my-7 flex items-center gap-4">
                            <span className="h-px flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">or use your business email</span>
                            <span className="h-px flex-1 bg-border" />
                        </div>

                        <form onSubmit={(event) => { event.preventDefault(); void sendCode(); }}>
                            <label htmlFor="email" className="text-sm font-medium">Business email</label>
                            <div className="relative mt-2">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => { setEmail(event.target.value); setError(""); }}
                                    placeholder="name@organization.com"
                                    className="h-12 pl-10"
                                    aria-invalid={Boolean(error)}
                                />
                            </div>
                            {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
                            <Button type="submit" size="lg" className="mt-5 h-12 w-full" disabled={!validEmail || busy}>
                                {busy ? <Loader2 className="animate-spin" /> : <Mail />}
                                Email me a sign-in code
                                {!busy && <ArrowRight />}
                            </Button>
                        </form>

                        <div className="mt-7 flex gap-3 rounded-md border bg-muted/45 p-4">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            <p className="text-xs leading-5 text-muted-foreground">
                                No password required. We’ll send a single-use 6-digit code to verify your identity.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" className="mb-8 -ml-3" onClick={() => { setStage("email"); setError(""); }}>
                            <ArrowLeft /> Change email
                        </Button>
                        <div className="mb-8">
                            <div className="mb-5 grid size-12 place-items-center rounded-md bg-primary/10 text-primary">
                                <ShieldCheck className="size-5" />
                            </div>
                            <h2 className="text-3xl font-semibold">Check your inbox</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Enter the 6-digit sign-in code sent to <span className="font-semibold text-foreground">{email}</span>.
                            </p>
                        </div>

                        <div className="flex justify-between gap-2" aria-label="Six digit verification code">
                            {digits.map((digit, index) => (
                                <Input
                                    key={index}
                                    ref={(element) => { inputsRef.current[index] = element; }}
                                    value={digit}
                                    onChange={(event) => updateDigit(index, event.target.value)}
                                    onKeyDown={(event) => handleKeyDown(index, event)}
                                    onPaste={handlePaste}
                                    inputMode="numeric"
                                    autoComplete={index === 0 ? "one-time-code" : "off"}
                                    maxLength={1}
                                    className="h-14 w-[14%] px-0 text-center font-mono text-xl font-semibold"
                                    aria-label={`Digit ${index + 1}`}
                                />
                            ))}
                        </div>
                        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

                        <Button className="mt-6 h-12 w-full" size="lg" disabled={digits.join("").length !== 6 || busy} onClick={verifyCode}>
                            {busy ? <Loader2 className="animate-spin" /> : <Check />}
                            Verify and sign in
                        </Button>

                        <div className="mt-6 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Didn’t receive it?</span>
                            <Button variant="link" className="h-auto p-0" disabled={resendIn > 0 || busy} onClick={sendCode}>
                                <RefreshCw /> {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                            </Button>
                        </div>
                    </>
                )}

                <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Globe2 className="size-3.5" /> Secure access for verified Ghanaian agribusinesses
                </div>
            </div>
        </div>
    )
}

export default AuthSection