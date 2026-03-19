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

export default function BeneficiariesGovPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const beneficiaries = [
    { id: '1', name: 'John Doe', department: 'Health', vehicle: 'GG-1234', status: 'ACTIVE', allocation: '200L' },
    { id: '2', name: 'Jane Smith', department: 'Education', vehicle: 'GG-5678', status: 'PENDING', allocation: '150L' },
    { id: '3', name: 'Robert Wilson', department: 'Finance', vehicle: 'GG-9012', status: 'ACTIVE', allocation: '300L' },
  ];

  const handleExport = () => {
    alert('Exporting beneficiary list as CSV...');
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Beneficiary Management</h1>
          <p className="text-slate-500 font-medium mt-2">Oversee government personnel eligibility and fuel allocations</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={handleExport} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <FileSpreadsheet size={20} className="mr-2 text-emerald-600" />
            <span className="font-black text-xs uppercase tracking-widest">Export CSV</span>
          </Button>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
            className="shadow-blue-500/20 hover:shadow-xl transition-all"
          >
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Register Beneficiary
          </Button>
        </div>
      </div>

      <Card className="p-8 border-none shadow-2xl space-y-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or vehicle..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" size="sm" className="bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800">
              <Filter size={16} className="mr-2" />
              Department
            </Button>
            <Button variant="outline" size="sm" className="bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800">
              <Filter size={16} className="mr-2" />
              Status
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800">
          <Table>
            <TableHead className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Beneficiary Identity</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle ID</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Quota</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Verification</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right text-transparent">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {beneficiaries.map((b) => (
                <TableRow key={b.id} className="group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">
                        {b.name.charAt(0)}
                      </div>
                      <span className="font-black text-slate-900 dark:text-white tracking-tight">{b.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6 font-bold text-slate-500">{b.department}</TableCell>
                  <TableCell className="py-5 px-6">
                    <code className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 dark:border-blue-900/30">
                      {b.vehicle}
                    </code>
                  </TableCell>
                  <TableCell className="py-5 px-6 font-black text-blue-600 dark:text-blue-400">{b.allocation}</TableCell>
                  <TableCell className="py-5 px-6 text-center">
                    <Badge variant={b.status === 'ACTIVE' ? 'success' : 'warning'} size="sm" className="font-black">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <button className="text-xs font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Dossier <Plus size={12} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Beneficiary"
        size="lg"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input label="Full Identity" placeholder="e.g. John Doe" />
             <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Department</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all">
                <option value="">Select Department</option>
                <option value="health">Ministry of Health</option>
                <option value="police">Police Headquarters</option>
                <option value="finance">Ministry of Finance</option>
              </select>
            </div>
            <Input label="Official ID Number" placeholder="GID-XXXX-XXXX" />
            <Input label="Primary Vehicle Plate" placeholder="GG-XXXX" />
            <Input label="Assigned Monthly Limit (L)" type="number" placeholder="200" />
            <Input label="Email Address" type="email" placeholder="name@gov.gm" />
          </div>
          
          <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex gap-4">
             <ShieldCheck className="text-blue-600 shrink-0" size={24} />
             <div>
                <p className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-1">Authorization Note</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  The beneficiary will receive a secure PIN via their registered government email for first-time activation at fuel stations.
                </p>
             </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsModalOpen(false)}>
              Verify & Register
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
