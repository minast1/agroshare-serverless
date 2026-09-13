import React from 'react'
import Footer from './footer';
import { ArrowRight } from 'lucide-react';
import { Building2, CheckCircle2 } from 'lucide-react';
import { TenantType } from '@/types';
import { Badge } from '@/components/ui/badge';

interface TProps {
  type: TenantType | null;
  options: { id: TenantType; title: string; icon: React.ReactNode; tag: string; desc: string; color: string }[];
  setType: (value: TenantType | null) => void;
  setStepIndex: (index: number) => void;
}

const TenantDetails = ({ type, options, setType, setStepIndex }: TProps) => {
  return (
    <div className="p-8 lg:p-10">
      <Badge>
        <Building2 data-icon="inline-start" />
        Tenant type</Badge>
      <h1 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight">What kind of organization are you?</h1>
      <p className="mt-2 text-muted-foreground">Your dashboard will adapt to the workflows that matter to your role.</p>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {options.map((o) => {
          const active = type === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setType(o.id)}
              className={`text-left rounded-xl border-2 p-5 bg-card transition-all ${active ? "border-primary shadow-lg scale-[1.01]" : "border-border hover:border-primary/40"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-lg ${o.color} text-white grid place-items-center`}>{o.icon}</div>
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground">{o.tag}</span>
              </div>
              <h3 className="font-semibold">{o.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{o.desc}</p>
              {active && <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium"><CheckCircle2 className="w-4 h-4" /> Selected</div>}
            </button>
          );
        })}
      </div>

      <Footer
        // left={
        //   <button onClick={() => setStepIndex(0)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border bg-card">
        //     <ArrowLeft className="w-4 h-4" /> Back
        //   </button>
        // }
        right={
          <button disabled={!type} onClick={() => setStepIndex(1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        }
      />
    </div>
  )
}

export default TenantDetails