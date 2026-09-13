import { Field, FieldLabel } from '@/components/ui/field'
import { Badge, Building2, ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'
import Footer from './footer'
import { Input } from '@/components/ui/input'

const OrgDetails = ({org, setOrg, setStepIndex, phone, setPhone}: {org: string, setOrg: (value: string) => void, setStepIndex: (index: number) => void, phone: string, setPhone: (value: string) => void}) => {
  return (
    <div className="p-8 lg:p-10">
                <Badge>
                    <Building2 data-icon="inline-start" />
                    Organization
                    </Badge>
                <h1 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight">Tell us about your organization</h1>
                <p className="mt-2 text-muted-foreground">We&apos;ll provision your tenant instance with mock data for now.</p>

                <div className="mt-8 space-y-5 max-w-lg">
                  <Field>
                    <FieldLabel>
                      Organization name
                    </FieldLabel>
                    <Input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g. Techiman Tomato Cooperative"/>
                    </Field>

                  <Field>
                  <FieldLabel>
                  MoMo / phone number
                  </FieldLabel>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 000 0000" />
                  </Field>
                </div>

                <Footer
                  left={
                    <button 
                    onClick={() => setStepIndex(0)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border bg-card"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  }
                  right={
                    <button 
                    disabled={!org} 
                    onClick={() => setStepIndex(2)} 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  }
                />
              </div>
  )
}

export default OrgDetails