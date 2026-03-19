'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Receipt, Shield, FileText, ArrowRight, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function BillingHQPage() {
  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Billing & Invoicing</h1>
        <p className="text-slate-500 font-medium mt-2">Manage consolidated billing for government and institutional partners</p>
      </div>

      <Card className="p-12 border-none shadow-2xl relative overflow-hidden group bg-white dark:bg-slate-900">
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          <div className="p-6 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl shadow-blue-500/40 relative group-hover:scale-105 transition-transform duration-500">
            <Receipt size={64} strokeWidth={2} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Consolidated Coupon Billing</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Automate your monthly invoicing for government departments and private institutions. 
              Track used coupons, generate aging reports, and manage reconciliation in one unified interface.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4 w-full">
            <Button variant="primary" size="lg" className="h-16 px-10 rounded-2xl text-lg font-black shadow-xl shadow-blue-500/20 group">
              Generate Monthly Invoices
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-black border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              View Aging Reports
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-10 border-t border-slate-50 dark:border-slate-800 mt-10">
            {[
              { icon: CreditCard, label: 'Bulk Payments', desc: 'Process institutional payments' },
              { icon: Clock, label: 'Pending Billing', desc: 'GMD 1.2M unvoiced' },
              { icon: CheckCircle2, label: 'Reconciliation', desc: '100% Match last month' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center space-y-2">
                <item.icon className="text-blue-500" size={24} />
                <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Abstract background elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      </Card>
    </div>
  );
}
