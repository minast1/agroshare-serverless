import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import React from 'react'
import Footer from './footer'
import { TenantType} from '@/types'
import Row from '../row';

interface Props {
  setStepIndex: (index: number) => void;
  options: { id: TenantType; title: string; icon: React.ReactNode; tag: string; desc: string; color: string }[];
  fullName: string;
  email: string;
  type: TenantType;
  org: string;
  phone: string;
}
const SummaryDetails = ({setStepIndex, options, fullName, email, type, org, phone}: Props) => {
  return (
    <div className="p-8 lg:p-10">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary grid place-items-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h1 className="mt-4 text-2xl lg:text-3xl font-bold tracking-tight">You&apos;re all set</h1>
                <p className="mt-2 text-muted-foreground">
                  Your AgroShare workspace is ready as a <strong>{options.find(o => o.id === type)?.title}</strong>.
                </p>

                <div className="mt-6 rounded-xl border bg-muted/30 p-6 space-y-2 text-sm max-w-lg">
                  <Row k="Account" v={fullName || "—"} />
                  <Row k="Email" v={email || "—"} />
                  <Row k="Tenant type" v={options.find(o => o.id === type)?.title || "—"} />
                  <Row k="Organization" v={org || "(mock organization)"} />
                  <Row k="Phone" v={phone || "(mock phone)"} />
                </div>

                <Footer
                  left={
                    <button 
                    onClick={() => setStepIndex(2)} 
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border bg-card"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  }
                  right={
                    <button
                     // onClick={() => { if (type) { setTenant(type); } }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium"
                    >
                      Enter dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                  }
                />
              </div>
  )
}

export default SummaryDetails