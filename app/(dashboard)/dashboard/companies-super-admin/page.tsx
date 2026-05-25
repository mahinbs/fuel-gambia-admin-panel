'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Building, Plus, Mail, Phone, MapPin, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { companyFunctions } from '@/supabase';
import { useToast } from '@/components/providers/ToastProvider';

export default function CompaniesSuperAdminPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Private Institution',
    email: '',
    phone: '',
    location: '',
    tin: ''
  });

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await companyFunctions.getCompanies({ page: 1 });
      setCompanies(response.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch onboarded companies', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await companyFunctions.createCompany({
        name: formData.name,
        contact_email: formData.email,
        contact_phone: formData.phone,
        address: formData.location,
        tin: formData.tin,
        registration_number: formData.tin || `REG-${Date.now()}`,
        status: 'ACTIVE'
      } as any);

      showToast('Company onboarded successfully!', 'success');
      setIsModalOpen(false);
      setFormData({ name: '', type: 'Private Institution', email: '', phone: '', location: '', tin: '' });
      fetchCompanies();
    } catch (err: any) {
      showToast(err.message || 'Failed to onboard company', 'error');
      setIsLoading(false);
    }
  };

  const openReview = (company: any) => {
    setSelectedCompany(company);
    setIsReviewModalOpen(true);
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Corporate Network</h1>
            <p className="text-slate-500 font-medium mt-2">Manage institutional partners and coordinate high-volume allocations</p>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
            className="shadow-blue-500/20 hover:shadow-xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Onboard Company
          </Button>
        </div>

        {isLoading && companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading corporate network...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl text-center">
            <Building className="text-slate-300 dark:text-slate-700 mb-6" size={48} />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No Companies Registered</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">Onboard partner institutions and corporate clients to manage fuel limits and invoicing.</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>Onboard First Company</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
              <Card key={company.id} className="p-0 group hover:shadow-3xl transition-all duration-500 border-none bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-blue-600/10 dark:bg-blue-500/10 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Building className="text-blue-600 dark:text-blue-400" size={28} />
                    </div>
                    <Badge variant={company.status === 'ACTIVE' ? 'success' : 'warning'} className="font-black uppercase tracking-wider text-[9px] px-2 py-1 shadow-sm">
                      {company.status || 'ACTIVE'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight truncate">{company.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Corporate Partner</p>
                    <span className="text-[9px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                      TIN: {company.tin || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                      <Mail size={16} className="text-slate-400 shrink-0" />
                      <span className="truncate">{company.contact_email || 'No Email'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                      <Phone size={16} className="text-slate-400 shrink-0" />
                      <span>{company.contact_phone || 'No Phone'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                      <MapPin size={16} className="text-slate-400 shrink-0" />
                      <span className="truncate">{company.address || 'Gambia'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center group-hover:bg-blue-600 transition-colors duration-300">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-blue-100 uppercase tracking-widest">
                    Joined {company.created_at ? company.created_at.split('T')[0] : 'N/A'}
                  </span>
                  <button 
                    onClick={() => openReview(company)}
                    className="text-[10px] font-black text-blue-600 dark:text-blue-400 group-hover:text-white flex items-center gap-1.5 uppercase tracking-widest"
                  >
                    Review <ArrowRight size={14} strokeWidth={3} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Onboarding Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Establish Corporate Partnership"
          size="lg"
        >
          <form className="space-y-10" onSubmit={handleOnboard}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <Input 
                  label="Institution Name" 
                  placeholder="e.g. Gambia National Bank" 
                  className="h-14 rounded-2xl font-bold" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input 
                  label="Business Sector" 
                  placeholder="e.g. Financial Services" 
                  className="h-14 rounded-2xl font-bold" 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                />
                <Input 
                  label="Registry Email" 
                  type="email" 
                  placeholder="contact@company.gm" 
                  className="h-14 rounded-2xl font-bold" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-8">
                <Input 
                  label="Official Phone" 
                  placeholder="+220 XXX XXXX" 
                  className="h-14 rounded-2xl font-bold" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
                <Input 
                  label="Regional Headquarters" 
                  placeholder="e.g. Banjul, The Gambia" 
                  className="h-14 rounded-2xl font-bold" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
                <Input 
                  label="TIN / Business ID" 
                  placeholder="TIN-XXXX-XXXX" 
                  className="h-14 rounded-2xl font-bold" 
                  value={formData.tin}
                  onChange={(e) => setFormData({...formData, tin: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="p-8 bg-blue-50/50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100/50 dark:border-blue-500/10 flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <Shield size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Authorization Notice</p>
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                  Partnering with this institution enables automated fuel allocation and corporate billing protocols for all verified organizational users.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
                Discard
              </Button>
              <Button variant="primary" type="submit" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]" isLoading={isLoading}>
                Confirm Partnership
              </Button>
            </div>
          </form>
        </Modal>

        {/* Review Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Company Details Audit"
          size="md"
        >
          {selectedCompany && (
            <div className="space-y-8">
              <div className="flex items-center gap-5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <Building size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedCompany.name}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Corporate Partner</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</p>
                  <Badge variant={selectedCompany.status === 'ACTIVE' ? 'success' : 'warning'} className="font-black">
                    {selectedCompany.status || 'ACTIVE'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Business ID / TIN</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCompany.tin || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedCompany.contact_email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCompany.contact_phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCompany.address || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined Date</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedCompany.created_at ? selectedCompany.created_at.split('T')[0] : 'N/A'}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsReviewModalOpen(false)}>
                Close Audit
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
