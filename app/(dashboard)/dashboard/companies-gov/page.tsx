'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search, Building, Plus, MoreHorizontal, ExternalLink, ShieldCheck, Mail, Phone, MapPin, TrendingUp, History } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function CompaniesGovPage() {
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const companies = [
    { id: '1', name: 'National Utility Co.', type: 'State Owned', allocation: '15,000 L', status: 'ACTIVE', compliance: '98%', email: 'contact@nuc.gm', phone: '+220 449XXXX', address: 'Kanifing Institutional Area' },
    { id: '2', name: 'Public Works Dept.', type: 'Government', allocation: '12,000 L', status: 'ACTIVE', compliance: '94%', email: 'info@pwd.gov.gm', phone: '+220 422XXXX', address: 'Banjul, The Gambia' },
    { id: '3', name: 'Gambia Transport Service', type: 'Public', allocation: '25,000 L', status: 'WARNING', compliance: '82%', email: 'support@gtsc.gm', phone: '+220 437XXXX', address: 'Kanifing South' },
  ];

  const handleViewDetails = (company: any) => {
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  return (
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
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" strokeWidth={3} />
          Onboard Institution
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search institutions..." 
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="p-8 border-none shadow-xl hover:translate-y-[-4px] transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Building size={28} />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <MoreHorizontal size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-1 relative z-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{company.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{company.type}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Allocation</p>
                <p className="font-bold text-slate-900 dark:text-white">{company.allocation}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Compliance</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{company.compliance}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 relative z-10">
              <Badge variant={company.status === 'ACTIVE' ? 'success' : 'warning'} size="sm" className="font-black">
                {company.status}
              </Badge>
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

      {/* Onboard Modal */}
      <Modal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        title="Onboard New Institution"
        size="lg"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Institution Name" placeholder="e.g. Ministry of Interior" />
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Institution Type</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all">
                <option value="">Select Type</option>
                <option value="govt">Government Department</option>
                <option value="state">State Owned Enterprise</option>
                <option value="public">Public Service</option>
              </select>
            </div>
            <Input label="Official Email" type="email" placeholder="admin@dept.gov.gm" />
            <Input label="Contact Number" placeholder="+220 XXX XXXX" />
            <Input label="Initial Monthly Quota (L)" type="number" placeholder="10000" />
            <Input label="Office Location" placeholder="Banjul, The Gambia" />
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
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsOnboardModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsOnboardModalOpen(false)}>
              Complete Onboarding
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Institutional Dossier"
        size="xl"
      >
        {selectedCompany && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-500/20">
                <Building size={48} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{selectedCompany.name}</h2>
                  <Badge variant={selectedCompany.status === 'ACTIVE' ? 'success' : 'warning'}>{selectedCompany.status}</Badge>
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">{selectedCompany.type}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedCompany.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedCompany.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedCompany.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="p-6 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                       <TrendingUp className="text-blue-600" size={16} />
                       Consumption Analytics
                    </h4>
                    <span className="text-xs font-black text-blue-600">This Month</span>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                           <span className="text-slate-400">Quota Utilization</span>
                           <span className="text-slate-900 dark:text-white">{selectedCompany.compliance}</span>
                        </div>
                        <div className="h-2 w-full bg-white dark:bg-slate-900 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 rounded-full" style={{ width: selectedCompany.compliance }} />
                        </div>
                     </div>
                     <div className="flex justify-between items-center py-2 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-xs font-bold text-slate-500">Total Allocated</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{selectedCompany.allocation}</span>
                     </div>
                  </div>
               </Card>

               <Card className="p-6 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                       <History className="text-amber-600" size={16} />
                       Recent Activity
                    </h4>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase h-auto p-0 hover:bg-transparent">View All</Button>
                  </div>
                  <div className="space-y-3">
                     {[
                       { action: 'Quota Renewal', date: '2 days ago', status: 'SUCCESS' },
                       { action: 'Compliance Audit', date: '1 week ago', status: 'PASSED' },
                     ].map((item, idx) => (
                       <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{item.action}</span>
                          <span className="text-slate-400">{item.date}</span>
                       </div>
                     ))}
                  </div>
               </Card>
            </div>

            <div className="pt-4 flex gap-4">
              <Button variant="outline" className="flex-1 py-4" onClick={() => setIsDetailsModalOpen(false)}>Close Dossier</Button>
              <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest">
                Edit Institutional Data
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
