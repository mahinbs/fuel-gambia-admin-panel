'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Shield, FileCheck, AlertCircle, Plus, MoreVertical, CheckCircle2, ChevronRight, Zap, Target, Scale } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function PoliciesGovPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [controls, setControls] = useState([
    { id: 1, label: 'Require Manager Approval', active: true },
    { id: 2, label: 'Weekend Restrictions', active: false },
    { id: 3, label: 'Night Shift Multiplier', active: false },
    { id: 4, label: 'Audit Trail Recording', active: true },
  ]);

  const toggleControl = (id: number) => {
    setControls(controls.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const activePolicies = [
    { id: '1', title: 'Standard Monthly Quota', limit: '200L Petrol', target: 'Private Vehicles', status: 'ACTIVE' },
    { id: '2', title: 'Emergency Service Priority', limit: 'Unlimited', target: 'Ambulances & Fire Trucks', status: 'ACTIVE' },
    { id: '3', title: 'Government Official Allocation', limit: '400L Petrol', target: 'Civil Servants', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Policy Framework</h1>
          <p className="text-slate-500 font-medium mt-2">Define and enforce national fuel distribution governance</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" strokeWidth={3} />
          Create New Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="text-blue-500" size={24} />
              Active Distribution Policies
            </h2>
            <Badge variant="info" size="sm" className="font-black">3 SYSTEM POLICIES</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePolicies.map((policy) => (
              <Card key={policy.id} className="p-8 border-none shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                    <FileCheck size={24} strokeWidth={2.5} />
                  </div>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                    <MoreVertical size={18} />
                  </button>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight relative z-10">{policy.title}</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Limit</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{policy.limit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Demographic</span>
                    <span className="text-xs font-bold text-slate-500">{policy.target}</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                  <Badge variant="success" size="sm" className="font-black">Active</Badge>
                  <Button variant="ghost" size="sm" className="text-blue-500 font-black hover:bg-blue-50 dark:hover:bg-blue-500/5 group text-[10px] uppercase tracking-widest">
                    Configure <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl" />
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Zap className="text-amber-500" size={24} />
            System Governance Toggles
          </h2>
          
          <Card className="p-8 border-none shadow-xl space-y-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
            <div className="space-y-6">
              {controls.map((control) => (
                <div 
                  key={control.id} 
                  className="flex items-center justify-between group cursor-pointer"
                  onClick={() => toggleControl(control.id)}
                >
                  <span className={cn(
                    "text-xs font-black uppercase tracking-widest transition-colors",
                    control.active ? "text-slate-900 dark:text-white" : "text-slate-400"
                  )}>
                    {control.label}
                  </span>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300 border-2",
                    control.active 
                      ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                      : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm",
                      control.active ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <Button variant="primary" className="w-full h-14 rounded-2xl shadow-blue-500/20 font-black tracking-widest text-xs uppercase" onClick={() => alert('Global configuration synchronized.')}>
                Synchronize Governance
              </Button>
            </div>
          </Card>
          
          <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-500/20 shadow-lg shadow-amber-500/5">
             <div className="flex gap-4">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <div className="space-y-2">
                   <p className="text-sm font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest">Attention</p>
                   <p className="text-xs font-medium text-amber-800 dark:text-amber-500/80 leading-relaxed">
                     Changes to system-wide policies may take up to 30 minutes to propagate to all station terminals nationwide.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Establish New Governance Policy"
        size="lg"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-6">
            <Input label="Policy Title" placeholder="e.g. Subsidy Cap 2026" />
            <div className="grid grid-cols-2 gap-6">
              <Input label="Monthly Limit (L)" placeholder="200" type="number" />
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Eligibility Group</label>
                <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all">
                  <option value="">Select Target</option>
                  <option value="private">Private Vehicles</option>
                  <option value="commercial">Commercial Transport</option>
                  <option value="emergency">Emergency Services</option>
                  <option value="govt">Government Officials</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Priority Level</label>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="flex-1 border-blue-600 bg-blue-50 text-blue-600 font-black">Standard</Button>
                   <Button variant="outline" size="sm" className="flex-1 font-black">High</Button>
                   <Button variant="outline" size="sm" className="flex-1 font-black">Critical</Button>
                </div>
               </div>
               <Input label="Effective From" type="date" />
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4">
             <Scale className="text-blue-600 shrink-0" size={24} />
             <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
               New policies undergo an automated simulation check against current national reserves before activation.
             </p>
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Discard</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsModalOpen(false)}>
              Activate Policy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
