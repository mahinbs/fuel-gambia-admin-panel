'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search, Building, Plus, ExternalLink, ShieldCheck, Mail, Phone, MapPin, TrendingUp, History, Loader2, AlertCircle } from 'lucide-react';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { companyFunctions } from '@/supabase';

export default function CompaniesGovPage() {
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    allocation: '',
    address: '',
  });

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await companyFunctions.getCompanies({ search: search || undefined });
      setCompanies(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await companyFunctions.createCompany({
        name: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        address: formData.address,
        status: 'ACTIVE',
      });
      await loadCompanies();
      setIsOnboardModalOpen(false);
      setFormData({ name: '', type: '', email: '', phone: '', allocation: '', address: '' });
    } catch (err: any) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (company: any) => {
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.GOVERNMENT_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Institutional Partners</h1>
            <p className="text-slate-500 font-medium mt-2">Monitor and manage institutional partnerships and fuel compliance</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsOnboardModalOpen(true)}
            className="shadow-blue-500/20 hover:shadow-xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Onboard Institution
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <AlertCircle className="text-rose-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
          </div>
        )}

        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search institutions..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Institutions...</p>
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Building size={48} className="text-slate-300" />
            <p className="text-slate-400 font-bold">No institutions found. Onboard the first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company: any) => (
              <Card key={company.id} className="p-8 border-none shadow-xl hover:translate-y-[-4px] transition-all group overflow-hidden relative">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Building size={28} />
                  </div>
                  <Badge variant={company.status === 'ACTIVE' ? 'success' : 'warning'} size="sm" className="font-black">
                    {company.status || 'ACTIVE'}
                  </Badge>
                </div>

                <div className="space-y-1 relative z-10">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{company.name}</h3>
                  {company.address && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{company.address}</p>}
                </div>

                {(company.email || company.phone) && (
                  <div className="mt-6 space-y-2 relative z-10">
                    {company.email && (
                      <p className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                        <Mail size={13} className="text-slate-400" /> {company.email}
                      </p>
                    )}
                    {company.phone && (
                      <p className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                        <Phone size={13} className="text-slate-400" /> {company.phone}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-8 relative z-10">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Since {new Date(company.created_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 font-black group px-0 text-xs uppercase tracking-widest"
                    onClick={() => handleViewDetails(company)}
                  >
                    View Dossier
                    <ExternalLink size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>

                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              </Card>
            ))}
          </div>
        )}

        {/* Onboard Modal */}
        <Modal isOpen={isOnboardModalOpen} onClose={() => setIsOnboardModalOpen(false)} title="Onboard New Institution" size="lg">
          <form className="space-y-6" onSubmit={handleOnboard}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Institution Name"
                placeholder="e.g. Ministry of Interior"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Institution Type</label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="Government Department">Government Department</option>
                  <option value="State Owned Enterprise">State Owned Enterprise</option>
                  <option value="Public Service">Public Service</option>
                </select>
              </div>
              <Input
                label="Official Email"
                type="email"
                placeholder="admin@dept.gov.gm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Contact Number"
                placeholder="+220 XXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="Office Location"
                placeholder="Banjul, The Gambia"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex gap-3">
                <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Compliance Agreement</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                By onboarding this institution, you authorize their access to the national fuel subsidy program. All disbursements are subject to real-time audit and compliance monitoring.
              </p>
            </div>

            <div className="pt-4 flex gap-4">
              <Button variant="outline" type="button" className="flex-1 py-4 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsOnboardModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={submitting} className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest h-14 rounded-2xl uppercase text-[10px]">
                {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {submitting ? 'Onboarding...' : 'Complete Onboarding'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Details Modal */}
        <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Institutional Dossier" size="xl">
          {selectedCompany && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-500/20">
                  <Building size={48} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{selectedCompany.name}</h2>
                    <Badge variant={selectedCompany.status === 'ACTIVE' ? 'success' : 'warning'}>{selectedCompany.status || 'ACTIVE'}</Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Onboarded {new Date(selectedCompany.created_at).toLocaleDateString()}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedCompany.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedCompany.email}</p>
                        </div>
                      </div>
                    )}
                    {selectedCompany.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedCompany.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedCompany.address && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedCompany.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button variant="outline" className="flex-1 py-4 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsDetailsModalOpen(false)}>Close Dossier</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
