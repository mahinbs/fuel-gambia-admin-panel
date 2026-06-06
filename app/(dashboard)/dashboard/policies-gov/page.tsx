'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Shield, FileCheck, AlertCircle, Plus, MoreVertical, CheckCircle2, ChevronRight, Zap, Scale, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { policyFunctions } from '@/supabase';

export default function PoliciesGovPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [controls, setControls] = useState([
    { id: 1, label: 'Require Manager Approval', active: true },
    { id: 2, label: 'Weekend Restrictions', active: false },
    { id: 3, label: 'Night Shift Multiplier', active: false },
    { id: 4, label: 'Audit Trail Recording', active: true },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    amountLimit: '',
    role: '',
    priority: 'STANDARD',
    effectiveFrom: '',
  });

  useEffect(() => {
    switch (formData.role) {
      case 'SUPER_ADMIN': setFormData(prev => ({ ...prev, amountLimit: '50000' })); break;
      case 'GOVERNMENT_ADMIN': setFormData(prev => ({ ...prev, amountLimit: '30000' })); break;
      case 'STATION_HQ': setFormData(prev => ({ ...prev, amountLimit: '20000' })); break;
      case 'STATION_BRANCH': setFormData(prev => ({ ...prev, amountLimit: '10000' })); break;
    }
  }, [formData.role]);

  const toggleControl = (id: number) => {
    setControls(controls.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await policyFunctions.getPolicies({});
      setPolicies(result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await policyFunctions.createPolicy({
        title: formData.title,
        description: `Amount limit: ${formData.amountLimit} GMD for ${formData.role}`,
        policyType: 'ALLOCATION_LIMIT',
        value: Number(formData.amountLimit),
        fuelType: 'ALL',
        effectiveFrom: formData.effectiveFrom || new Date().toISOString(),
      });
      await loadPolicies();
      setIsModalOpen(false);
      setFormData({ title: '', amountLimit: '', role: '', priority: 'STANDARD', effectiveFrom: '' });
    } catch (err: any) {
      setError(err.message || 'Policy creation failed');
    } finally {
      setSubmitting(false);
    }
  };

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

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
          <AlertCircle className="text-rose-500 shrink-0" size={20} />
          <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="text-blue-500" size={24} />
              Active Distribution Policies
            </h2>
            <Badge variant="info" size="sm" className="font-black">
              {loading ? '...' : `${policies.filter((p: any) => p.is_active).length} ACTIVE`}
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <Shield size={32} className="text-slate-300" />
              <p className="text-slate-400 font-bold text-sm">No policies yet. Create the first one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map((policy: any) => (
                <Card key={policy.id} className="p-8 border-none shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                      <FileCheck size={24} strokeWidth={2.5} />
                    </div>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight relative z-10">{policy.name}</h3>
                  <div className="space-y-4 relative z-10">
                    {policy.value && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Limit</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{Number(policy.value).toLocaleString()} GMD</span>
                      </div>
                    )}
                    {policy.vehicle_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</span>
                        <span className="text-xs font-bold text-slate-500">{policy.vehicle_type}</span>
                      </div>
                    )}
                    {policy.effective_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective</span>
                        <span className="text-xs font-bold text-slate-500">{new Date(policy.effective_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                    <Badge variant={policy.is_active ? 'success' : 'warning'} size="sm" className="font-black">
                      {policy.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-blue-500 font-black hover:bg-blue-50 dark:hover:bg-blue-500/5 group text-[10px] uppercase tracking-widest">
                      Configure <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl" />
                </Card>
              ))}
            </div>
          )}
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
        <form className="space-y-6" onSubmit={handleCreate}>
          <div className="space-y-6">
            <Input
              label="Policy Title"
              placeholder="e.g. Subsidy Cap 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Amount Limit (GMD)"
                placeholder="12000"
                type="number"
                value={formData.amountLimit}
                onChange={(e) => setFormData({ ...formData, amountLimit: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Target Role</label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Select Role</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                  <option value="GOVERNMENT_ADMIN">Government Officer</option>
                  <option value="STATION_HQ">Station HQ Manager</option>
                  <option value="STATION_BRANCH">Station Branch Manager</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Priority Level</label>
                <div className="flex gap-2">
                  {['STANDARD', 'HIGH', 'CRITICAL'].map(p => (
                    <Button
                      key={p}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 font-black",
                        formData.priority === p ? "border-blue-600 bg-blue-50 text-blue-600" : ""
                      )}
                      onClick={() => setFormData({ ...formData, priority: p })}
                    >
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <Input
                label="Effective From"
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4">
            <Scale className="text-blue-600 shrink-0" size={24} />
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
              New policies undergo an automated simulation check against current national reserves before activation.
            </p>
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" type="button" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Discard</Button>
            <Button variant="primary" type="submit" disabled={submitting} className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest">
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {submitting ? 'Activating...' : 'Activate Policy'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
