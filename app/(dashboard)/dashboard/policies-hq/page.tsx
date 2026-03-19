'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Shield, FileText, Clock, Users, Plus, ChevronRight, Zap, MoreVertical, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function PoliciesHQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [controls, setControls] = useState([
    { id: 1, label: 'Mandatory ID Verification', active: true },
    { id: 2, label: 'Pre-shift Briefing Required', active: true },
    { id: 3, label: 'Overtime Auto-Approval', active: false },
    { id: 4, label: 'CCTV Audit Logging', active: true },
  ]);

  const toggleControl = (id: number) => {
    setControls(controls.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const policies = [
    { id: '1', title: 'Station Operating Hours', desc: 'Standard: 06:00–22:00. Highway stations: 24/7.', icon: Clock, color: 'blue' },
    { id: '2', title: 'Staff Uniform Policy', desc: 'Compulsory high-vis vests and safety boots at all times.', icon: Users, color: 'purple' },
    { id: '3', title: 'Maximum Cash Float', desc: 'End-of-shift float must not exceed D 5,000 per pump.', icon: Shield, color: 'emerald' },
    { id: '4', title: 'Fuel Spillage Protocol', desc: 'Immediate station lockdown. Incident report within 2 hrs.', icon: AlertCircle, color: 'rose' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Station Policy Hub</h1>
          <p className="text-slate-500 font-medium mt-2">Define and enforce operational standards across all branches</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" strokeWidth={3} />
          Create Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-blue-500" size={22} />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Station Policies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {policies.map((p) => (
              <Card key={p.id} className="p-8 border-none shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className={cn(
                  'p-3 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110',
                  p.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                  p.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' :
                  p.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                  'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                )}>
                  <p.icon size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-2">{p.title}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{p.desc}</p>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <Badge variant="success" size="sm" className="font-black">Enforced</Badge>
                  <Button variant="ghost" size="sm" className="text-blue-500 font-black group text-[10px] uppercase tracking-widest p-0 hover:bg-transparent">
                    Edit <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-current opacity-[0.03] rounded-full blur-2xl" />
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-0">
            <Zap className="text-amber-500" size={22} />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Operational Toggles</h2>
          </div>
          <Card className="p-8 border-none shadow-xl space-y-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
            {controls.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => toggleControl(c.id)}
              >
                <span className={cn(
                  'text-xs font-black uppercase tracking-widest transition-colors',
                  c.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                )}>
                  {c.label}
                </span>
                <div className={cn(
                  'w-12 h-6 rounded-full relative transition-all duration-300 border-2 shrink-0',
                  c.active
                    ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                )}>
                  <div className={cn(
                    'absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm',
                    c.active ? 'right-1' : 'left-1'
                  )} />
                </div>
              </div>
            ))}
            <Button variant="primary" className="w-full h-14 rounded-2xl shadow-blue-500/20 font-black tracking-widest text-xs uppercase mt-4" onClick={() => alert('Station policies synchronized.')}>
              Push to All Stations
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Station Policy"
        size="lg"
      >
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <Input label="Policy Title" placeholder="e.g. Peak Hour Premium Rate" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Policy Type</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                <option>Operational</option>
                <option>Safety</option>
                <option>Financial</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Applies To</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                <option>All Stations</option>
                <option>Highway Stations</option>
                <option>Urban Stations</option>
                <option>Specific Station</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Policy Description</label>
            <textarea
              rows={3}
              placeholder="Describe what this policy enforces and the expected compliance..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Discard</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsModalOpen(false)}>
              Publish Policy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
