'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ClipboardList, Plus, Building, TrendingUp, AlertCircle, ChevronRight, Search, Droplets } from 'lucide-react';
import { formatLiters } from '@/utils/format';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function AllocationsGovPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
  const [fuelProtocol, setFuelProtocol] = useState<'PETROL' | 'DIESEL'>('PETROL');
  
  const [allocations, setAllocations] = useState([
    { id: '1', department: 'Ministry of Health', monthly: 10000, used: 6500, status: 'STABLE', protocol: 'PETROL' },
    { id: '2', department: 'Ministry of Education', monthly: 8000, used: 4200, status: 'STABLE', protocol: 'PETROL' },
    { id: '3', department: 'Police Headquarters', monthly: 15000, used: 13200, status: 'CRITICAL', protocol: 'DIESEL' },
  ]);

  const [formData, setFormData] = useState({
    department: '',
    monthly: '',
    expiry: ''
  });

  const handleProvision = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlloc = {
      id: (allocations.length + 1).toString(),
      department: formData.department || 'General Dept',
      monthly: Number(formData.monthly),
      used: 0,
      status: 'STABLE',
      protocol: fuelProtocol
    };
    setAllocations([...allocations, newAlloc]);
    setIsModalOpen(false);
    setFormData({ department: '', monthly: '', expiry: '' });
  };

  const openDossier = (alloc: any) => {
    setSelectedAllocation(alloc);
    setIsDossierOpen(true);
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.GOVERNMENT_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Resource Quotas</h1>
            <p className="text-slate-500 font-medium mt-2">Executive control over departmental fuel allocations and consumption intensity</p>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
            className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px]"
          >
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Authorize New Quota
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Filter by ministry or department..." 
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-4">
             <Badge variant="success" className="h-12 px-6 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm">Stable Reservoirs: {allocations.filter(a => a.used/a.monthly < 0.85).length}</Badge>
             <Badge variant="warning" className="h-12 px-6 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm">Critical Warning: {allocations.filter(a => a.used/a.monthly >= 0.85).length}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {allocations.map((a) => {
            const usagePercent = (a.used / a.monthly) * 100;
            const isCritical = usagePercent > 85;
            
            return (
              <Card key={a.id} className="p-10 border-none shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden relative bg-white dark:bg-slate-900 rounded-[2.5rem]">
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                    <Building size={28} className="text-slate-400 group-hover:text-blue-500 transition-colors" strokeWidth={2.5} />
                  </div>
                  <Badge variant={isCritical ? 'error' : 'success'} className="font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm">
                    {isCritical ? 'High Burn' : 'Nominal'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-10 relative z-10">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{a.department}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Protocol: {a.protocol}</p>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Consumed Volume</p>
                      <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{formatLiters(a.used)}</p>
                    </div>
                    <div className="text-right space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Max Quota</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{formatLiters(a.monthly)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className={cn(isCritical ? "text-rose-500" : "text-blue-500", "tracking-[0.2em]")}>Utilization Intensity</span>
                      <span className="text-slate-900 dark:text-white">{usagePercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 relative group-hover:brightness-110",
                          isCritical ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        )} 
                        style={{ width: `${usagePercent}%` }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800/50 relative z-10">
                  <Button 
                    onClick={() => openDossier(a)}
                    variant="ghost" 
                    className="w-full h-14 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 font-black text-[10px] uppercase tracking-widest group/btn rounded-2xl transition-all border border-slate-100 dark:border-slate-700"
                  >
                    Review Utilization Dossier <ChevronRight size={18} className="ml-2 group-hover/btn:translate-x-1.5 transition-transform" strokeWidth={3} />
                  </Button>
                </div>

                <TrendingUp className={cn(
                  "absolute -bottom-16 -right-16 w-64 h-64 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12",
                  isCritical ? "text-rose-500" : "text-blue-500"
                )} />
              </Card>
            );
          })}
        </div>

        {/* Provisioning Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Quota Provisioning"
          size="lg"
        >
          <form className="space-y-10" onSubmit={handleProvision}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Identity</label>
                <select 
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none shadow-inner"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Ministry of Health">Ministry of Health</option>
                  <option value="Ministry of Education">Ministry of Education</option>
                  <option value="Police Headquarters">Police Headquarters</option>
                  <option value="Ministry of Agriculture">Ministry of Agriculture</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fuel Protocol</label>
                <div className="flex gap-4">
                   <button 
                      type="button"
                      onClick={() => setFuelProtocol('PETROL')}
                      className={cn(
                        "flex-1 h-14 border-2 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group",
                        fuelProtocol === 'PETROL' ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-lg shadow-blue-500/10" : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-500"
                      )}
                    >
                      <Droplets className={cn("transition-transform", fuelProtocol === 'PETROL' ? "scale-110" : "group-hover:scale-110")} size={24} strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Petrol</span>
                   </button>
                   <button 
                      type="button"
                      onClick={() => setFuelProtocol('DIESEL')}
                      className={cn(
                        "flex-1 h-14 border-2 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group",
                        fuelProtocol === 'DIESEL' ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-lg shadow-blue-500/10" : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-500"
                      )}
                    >
                      <Droplets className={cn("transition-transform", fuelProtocol === 'DIESEL' ? "scale-110" : "group-hover:scale-110")} size={24} strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Diesel</span>
                   </button>
                </div>
              </div>
              <Input 
                label="Monthly Allowance (L)" 
                type="number" 
                placeholder="e.g. 5000" 
                className="h-14 rounded-2xl font-bold"
                value={formData.monthly}
                onChange={(e) => setFormData({...formData, monthly: e.target.value})}
                required
              />
              <Input 
                label="Protocol Expiry Date" 
                type="date" 
                className="h-14 rounded-2xl font-bold"
                value={formData.expiry}
                onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                required
              />
            </div>
            <div className="p-8 bg-blue-50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100 dark:border-blue-500/10 flex gap-6">
               <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-100 dark:border-blue-900/20">
                  <AlertCircle size={28} strokeWidth={2.5} />
               </div>
               <div>
                  <p className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-1">Authorization Clause</p>
                  <p className="text-[10px] font-bold text-blue-700/70 dark:text-blue-400/70 leading-relaxed uppercase tracking-wider">
                    Resource allocations are processed and renewed on the 1st of every calendar month. All provisions are subject to treasury compliance audits and dynamic adjustment policies.
                  </p>
               </div>
            </div>
            <div className="pt-4 flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>Discard</Button>
              <Button variant="primary" type="submit" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
                Confirm Provisioning
              </Button>
            </div>
          </form>
        </Modal>

        {/* Dossier Modal */}
        <Modal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          title="Utilization Analytics Dossier"
          size="md"
        >
          {selectedAllocation && (
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <Building size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedAllocation.department}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Protocol: {selectedAllocation.protocol}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <Card className="p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Usage</p>
                   <p className="text-2xl font-black text-slate-900 dark:text-white">{formatLiters(selectedAllocation.used)}</p>
                </Card>
                <Card className="p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Budget</p>
                   <p className="text-2xl font-black text-slate-900 dark:text-white">{formatLiters(selectedAllocation.monthly)}</p>
                </Card>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Burn Rate Velocity</span>
                    <span className="text-slate-900 dark:text-white">{((selectedAllocation.used / selectedAllocation.monthly) * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${(selectedAllocation.used / selectedAllocation.monthly) * 100}%` }} 
                    />
                 </div>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsDossierOpen(false)}>
                Close Analytics
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
