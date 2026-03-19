'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Building, Plus, Search, Filter, Globe, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function CompaniesSuperAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const companies = [
    { id: '1', name: 'Telco A', type: 'Private Institution', email: 'contact@telcoa.com', phone: '+220 123 4567', location: 'Banjul', status: 'ACTIVE', joined: '2025-10-01' },
    { id: '2', name: 'Bank B', type: 'Financial Service', email: 'info@bankb.gm', phone: '+220 765 4321', location: 'Serrekunda', status: 'ACTIVE', joined: '2025-12-15' },
    { id: '3', name: 'Fuel Co X', type: 'Fuel Provider', email: 'ops@fuelx.com', phone: '+220 999 8888', location: 'Kanifing', status: 'PENDING', joined: '2026-02-20' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Company Onboarding</h1>
          <p className="text-slate-500 font-medium mt-2">Scale the ecosystem by registering new institutions and partners</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" strokeWidth={3} />
          Register New Company
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="group hover:shadow-2xl transition-all duration-500 border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-600/10 dark:bg-blue-500/10 p-3 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Building className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <Badge variant={company.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                  {company.status}
                </Badge>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{company.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{company.type}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Mail size={14} className="text-slate-400" />
                  <span className="truncate">{company.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{company.location}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center group-hover:bg-blue-600 transition-colors duration-300">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-blue-100 uppercase tracking-tighter">Joined {company.joined}</span>
              <button className="text-xs font-black text-blue-600 dark:text-blue-400 group-hover:text-white flex items-center gap-1">
                View Profile <Plus size={12} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Activate Corporate Partner"
        size="lg"
      >
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Input label="Institution Name" placeholder="e.g. Gambia National Bank" />
              <Input label="Business Sector" placeholder="e.g. Financial Services" />
              <Input label="Registry Email" type="email" placeholder="contact@company.gm" />
            </div>
            <div className="space-y-6">
              <Input label="Verified Phone" placeholder="+220 XXX XXXX" />
              <Input label="Headquarters" placeholder="e.g. Banjul, The Gambia" />
              <Input label="TIN / Business ID" placeholder="TIN-XXXX-XXXX" />
            </div>
          </div>
          
          <div className="p-6 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl border border-blue-100/50 dark:border-blue-500/10 flex gap-4">
            <Shield className="text-blue-600 shrink-0" size={24} />
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
              Onboarding a new institution enables automated fuel allocation and corporate billing for all verified employees within the system.
            </p>
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
              Discard
            </Button>
            <Button variant="primary" className="flex-1 py-6 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
              Establish Partnership
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
