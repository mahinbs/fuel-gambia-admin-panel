'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Receipt, Shield, FileText, ArrowRight, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function BillingHQPage() {
  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_HQ}>
      <div className="space-y-12 pb-20">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Ledger & Settlement</h1>
          <p className="text-slate-500 font-medium mt-2">Centralized institutional invoicing and automated reconciliation for government entities</p>
        </div>

        <Card className="p-16 border-none shadow-3xl relative overflow-hidden group bg-white dark:bg-slate-900 rounded-[3rem]">
          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-10">
            <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-500/40 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border-4 border-white/10">
              <Receipt size={48} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Institutional Settlement Hub</h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed opacity-80">
                Orchestrate large-scale settlement cycles for coupon-based fuel transactions. 
                Generate institutional aging reports and manage global reconciliation protocols.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-6 w-full">
              <Button variant="primary" size="lg" className="h-20 px-12 rounded-[1.5rem] text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 group hover:shadow-blue-500/40 active:scale-95 transition-all">
                Generate Cycle Invoices
                <ArrowRight size={22} className="ml-3 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
              </Button>
              <Button variant="outline" size="lg" className="h-20 px-12 rounded-[1.5rem] text-base font-black uppercase tracking-[0.2em] border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                Aging Reports
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full pt-16 border-t border-slate-50 dark:border-slate-800/50 mt-16">
              {[
                { icon: CreditCard, label: 'Bulk Clearing', desc: 'GMD 4.8M Settled' },
                { icon: Clock, label: 'Aging Reserve', desc: 'GMD 1.2M Pending' },
                { icon: CheckCircle2, label: 'Integrity Sync', desc: '100% Validated' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center space-y-3 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 border border-slate-100 dark:border-slate-700 shadow-sm group-hover/item:scale-110 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-500">
                    <item.icon size={24} strokeWidth={2.5} />
                  </div>
                  <p className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none pt-1">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500 opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />
          <Receipt className="absolute -bottom-16 -left-16 w-64 h-64 text-slate-100 dark:text-slate-800/20 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        </Card>
      </div>
    </ProtectedRoute>
  );
}
