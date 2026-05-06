'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search, Filter, Plus, FileSpreadsheet, User, Mail, Car, Droplets, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { DataTable } from '@/components/ui/DataTable';

export default function BeneficiariesGovPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  
  const [beneficiaries, setBeneficiaries] = useState([
    { id: '1', name: 'John Doe', department: 'Health', vehicle: 'GG-1234', status: 'ACTIVE', allocation: '200L' },
    { id: '2', name: 'Jane Smith', department: 'Education', vehicle: 'GG-5678', status: 'PENDING', allocation: '150L' },
    { id: '3', name: 'Robert Wilson', department: 'Finance', vehicle: 'GG-9012', status: 'ACTIVE', allocation: '300L' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    idNumber: '',
    vehicle: '',
    allocation: '',
    email: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newBeneficiary = {
      id: (beneficiaries.length + 1).toString(),
      name: formData.name,
      department: formData.department || 'General',
      vehicle: formData.vehicle,
      status: 'ACTIVE',
      allocation: `${formData.allocation}L`
    };
    setBeneficiaries([...beneficiaries, newBeneficiary]);
    setIsModalOpen(false);
    setFormData({ name: '', department: '', idNumber: '', vehicle: '', allocation: '', email: '' });
  };

  const openDossier = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setIsDossierOpen(true);
  };

  const handleExport = () => {
    alert('Exporting beneficiary list as CSV...');
  };

  const columns = [
    {
      key: 'name',
      label: 'Beneficiary Identity',
      render: (val: string) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">
            {val.charAt(0)}
          </div>
          <span className="font-black text-slate-900 dark:text-white tracking-tight">{val}</span>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (val: string) => <span className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">{val}</span>,
    },
    {
      key: 'vehicle',
      label: 'Vehicle ID',
      render: (val: string) => (
        <code className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 dark:border-blue-900/30">
          {val}
        </code>
      ),
    },
    {
      key: 'allocation',
      label: 'Monthly Quota',
      render: (val: string) => <span className="font-black text-blue-600 dark:text-blue-400">{val}</span>,
    },
    {
      key: 'status',
      label: 'Verification',
      render: (val: string) => (
        <Badge variant={val === 'ACTIVE' ? 'success' : 'warning'} className="font-black text-[9px] uppercase tracking-widest">
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <button 
          onClick={() => openDossier(row)}
          className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest inline-flex items-center gap-1.5 group/btn"
        >
          View Dossier <Plus size={14} className="group-hover/btn:rotate-90 transition-transform" strokeWidth={3} />
        </button>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.GOVERNMENT_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Beneficiary Network</h1>
            <p className="text-slate-500 font-medium mt-2">Manage government personnel eligibility and dynamic fuel quotas</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" onClick={handleExport} className="bg-white dark:bg-slate-900 h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-800 shadow-sm">
              <FileSpreadsheet size={20} className="mr-2 text-emerald-600" />
              Export Dataset
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setIsModalOpen(true)}
              className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
              <Plus size={20} className="mr-2" strokeWidth={3} />
              Register Personnel
            </Button>
          </div>
        </div>

        <Card className="p-0 border-none shadow-2xl bg-transparent">
          <DataTable
            columns={columns}
            data={beneficiaries}
            searchable
            searchPlaceholder="Search by identity, department or vehicle..."
          />
        </Card>

        {/* Registration Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Executive Beneficiary Registration"
          size="lg"
        >
          <form className="space-y-10" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Input 
                label="Full Identity" 
                placeholder="e.g. John Doe" 
                className="h-14 rounded-2xl font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
               />
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ministry / Department</label>
                <select 
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Select Protocol</option>
                  <option value="Health">Ministry of Health</option>
                  <option value="Police">Police Headquarters</option>
                  <option value="Finance">Ministry of Finance</option>
                  <option value="Education">Ministry of Education</option>
                </select>
              </div>
              <Input 
                label="Official ID Number" 
                placeholder="GID-XXXX-XXXX" 
                className="h-14 rounded-2xl font-bold"
                value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                required
              />
              <Input 
                label="Primary Vehicle Plate" 
                placeholder="GG-XXXX" 
                className="h-14 rounded-2xl font-bold"
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                required
              />
              <Input 
                label="Assigned Monthly Limit (L)" 
                type="number" 
                placeholder="200" 
                className="h-14 rounded-2xl font-bold"
                value={formData.allocation}
                onChange={(e) => setFormData({...formData, allocation: e.target.value})}
                required
              />
              <Input 
                label="Corporate Email" 
                type="email" 
                placeholder="name@gov.gm" 
                className="h-14 rounded-2xl font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="p-8 bg-blue-50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100 dark:border-blue-500/10 flex gap-6">
               <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                  <ShieldCheck size={28} strokeWidth={2.5} />
               </div>
               <div>
                  <p className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-1">Authorization Protocol</p>
                  <p className="text-[10px] font-bold text-blue-700/70 dark:text-blue-400/70 leading-relaxed uppercase tracking-wider">
                    The beneficiary will receive a unique cryptographic PIN via their registered government email for secure activation at dispensing terminals.
                  </p>
               </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>Discard</Button>
              <Button variant="primary" type="submit" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
                Confirm Registration
              </Button>
            </div>
          </form>
        </Modal>

        {/* Dossier Modal */}
        <Modal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          title="Beneficiary Personnel Dossier"
          size="md"
        >
          {selectedBeneficiary && (
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 font-black text-2xl">
                  {selectedBeneficiary.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedBeneficiary.name}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedBeneficiary.department} Department</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle ID</p>
                  <code className="text-sm font-black text-blue-600">{selectedBeneficiary.vehicle}</code>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Quota Limit</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{selectedBeneficiary.allocation}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification</p>
                  <Badge variant={selectedBeneficiary.status === 'ACTIVE' ? 'success' : 'warning'} className="font-black">
                    {selectedBeneficiary.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference ID</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">#{selectedBeneficiary.id}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Quota</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">74.5% Remaining</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '74.5%' }} />
                </div>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsDossierOpen(false)}>
                Close Dossier
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
