import { Badge } from '@/components/ui/badge'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input} from '@/components/ui/input'
import { ArrowRight, Loader2, Mail, Sparkles } from 'lucide-react'
import React from 'react'
import Footer from './footer'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

interface AProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  validName: boolean;
  validEmail: boolean;
  sending: boolean;
  handleAdminOtpSignUp: (e: React.FormEvent<HTMLButtonElement>) => Promise<void>;
  setStepIndex: (index: number) => void;
}

const AccountDetails = ({fullName, setFullName, email, setEmail, validName, validEmail, sending, handleAdminOtpSignUp }: AProps) => {
  return (
     <div className="p-8 lg:p-10">
                <Badge>
                    <Sparkles data-icon="inline-start" />
                    Create account</Badge>
                <h1 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight">Let&apos;s set up your account</h1>
                <p className="mt-2 text-muted-foreground">We&lsquo;ll send a one-time verification code to your business email.</p>

                <div className="mt-8 space-y-5 max-w-lg">
                  <Field>
                    <FieldLabel>Full name</FieldLabel>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Kwame Mensah"/>
                    </Field>
                  <Field
                   data-invalid={!!email && !validEmail}
                  >
                    <FieldLabel> Business email </FieldLabel>
                    <InputGroup >
                     <InputGroupInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" type="email"/>
                      <InputGroupAddon>
                       <Mail className="w-4 h-4 text-muted-foreground" />
                      </InputGroupAddon>
                   </InputGroup>
                   
                    {email && !validEmail && (
                      <FieldError>Enter a valid business email address.</FieldError>
                    )}
                    </Field>
                </div>

                <Footer
                  right={
                    <button
                      onClick={handleAdminOtpSignUp}
                      disabled={!validName || !validEmail || sending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
                    >
                      {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code…</> : <>Send verification code <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  }
                />
              </div>
  )
}

export default AccountDetails