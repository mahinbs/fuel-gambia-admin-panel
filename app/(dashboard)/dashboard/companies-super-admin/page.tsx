'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Building, Plus, Search, Filter, Globe, Mail, Phone, MapPin, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function CompaniesSuperAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  
  const [companies, setCompanies] = useState([
    { id: '1', name: 'Telco A', type: 'Private Institution', email: 'contact@telcoa.com', phone: '+220 123 4567', location: 'Banjul', status: 'ACTIVE', joined: '2025-10-01' },
    { id: '2', name: 'Bank B', type: 'Financial Service', email: 'info@bankb.gm', phone: '+220 765 4321', location: 'Serrekunda', status: 'ACTIVE', joined: '2025-12-15' },
    { id: '3', name: 'Fuel Co X', type: 'Fuel Provider', email: 'ops@fuelx.com', phone: '+220 999 8888', location: 'Kanifing', status: 'PENDING', joined: '2026-02-20' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    location: '',
    tin: ''
  });

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    const newCompany = {
      id: (companies.length + 1).toString(),
      name: formData.name,
      type: formData.type,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      status: 'ACTIVE',
      joined: new Date().toISOString().split('T')[0]
    };
    setCompanies([...companies, newCompany]);
    setIsModalOpen(false);
    setFormData({ name: '', type: '', email: '', phone: '', location: '', tin: '' });
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company) => (
            <Card key={company.id} className="p-0 group hover:shadow-3xl transition-all duration-500 border-none bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-600/10 dark:bg-blue-500/10 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Building className="text-blue-600 dark:text-blue-400" size={28} />
                  </div>
                  <Badge variant={company.status === 'ACTIVE' ? 'success' : 'warning'} className="font-black uppercase tracking-wider text-[9px] px-2 py-1 shadow-sm">
                    {company.status}
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{company.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{company.type}</p>
                  <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded">REF: #{company.id}</span>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                    <Mail size={16} className="text-slate-400" />
                    <span className="truncate">{company.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                    <Phone size={16} className="text-slate-400" />
                    <span>{company.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{company.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center group-hover:bg-blue-600 transition-colors duration-300">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-blue-100 uppercase tracking-widest">Joined {company.joined}</span>
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
              <Button variant="primary" type="submit" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
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
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedCompany.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</p>
                  <Badge variant={selectedCompany.status === 'ACTIVE' ? 'success' : 'warning'} className="font-black">
                    {selectedCompany.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">#{selectedCompany.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCompany.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCompany.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCompany.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined Date</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCompany.joined}</p>
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
