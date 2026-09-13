import { ArrowLeft, ArrowRight, Badge, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import React from 'react'
import Footer from "./_components/footer";

type TProps = {
  otpDigits: string[],
  handleVerifyOtp: () => void,
  otpError: string | null,
  resendIn: number,
  email: string,
  handleResendCode: () => void,
  setStepIndex: (index: number) => void,
  handleOtpChange: (index: number, value: string) => void,
  handleOtpKey: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void,
  verifying: boolean,
  handleOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void,
  inputsRef: React.RefObject<Array<HTMLInputElement | null>>
}
const OTP = ({ otpDigits, handleVerifyOtp, handleOtpChange, handleOtpKey, verifying, handleOtpPaste, otpError, resendIn, handleResendCode, setStepIndex, inputsRef, email }: TProps) => {
  return (
    <div className="p-8 lg:p-10">
      <Badge>
        <ShieldCheck data-icon="inline-start" />
        Verify email</Badge>
      <h1 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight">Check your inbox</h1>
      <p className="mt-2 text-muted-foreground">
        We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Enter it below to continue.
      </p>

      <div className="mt-8">
        <div className="flex gap-2 sm:gap-3">
          {otpDigits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              value={d}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKey(i, e)}
              onPaste={handleOtpPaste}
              inputMode="numeric"
              maxLength={1}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-semibold rounded-lg border-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring transition
                          ${otpError ? "border-destructive" : d ? "border-primary" : "border-border"}`}
            />
          ))}
        </div>
        {otpError && <p className="mt-3 text-sm text-destructive">{otpError}</p>}

        <div className="mt-5 text-sm text-muted-foreground">
          Didn&apos;t get the email?{" "}
          {resendIn > 0 ? (
            <span>Resend in {resendIn}s</span>
          ) : (
            <button onClick={handleResendCode} className="inline-flex hover:cursor-pointer items-center gap-1 text-primary font-medium hover:underline">
              <RefreshCw className="w-3.5 h-3.5" /> Resend code
            </button>
          )}
        </div>
      </div>

      <Footer
        left={
          <button onClick={() => setStepIndex(2)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border bg-card">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        }
        right={
          <button
            onClick={handleVerifyOtp}
            disabled={otpDigits.length !== 6 || verifying}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <>Verify & continue <ArrowRight className="w-4 h-4" /></>}
          </button>
        }
      />
    </div>
  )
}

export default OTP