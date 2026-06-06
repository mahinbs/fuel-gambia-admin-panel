'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Building, FileCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { companyFunctions } from '@/supabase';
import { useToast } from '@/components/providers/ToastProvider';

export default function LicenseManagementPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [renewDuration, setRenewDuration] = useState<number>(12);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await companyFunctions.getCompanies({ page: 1 });
      setCompanies(response.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch companies', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleRenew = (company: any) => {
    setSelectedCompany(company);
    setRenewDuration(12);
    setIsRenewModalOpen(true);
  };

  const submitRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    setIsLoading(true);
    try {
      // Calculate new expiration date
      const currentDate = selectedCompany.license_expiration_date 
        ? new Date(selectedCompany.license_expiration_date) 
        : new Date();
      
      if (isNaN(currentDate.getTime())) {
        currentDate.setTime(Date.now());
      }

      // If expired, renew from today
      const baseDate = currentDate.getTime() < Date.now() ? new Date() : currentDate;
      
      const newExpiration = new Date(baseDate);
      newExpiration.setMonth(newExpiration.getMonth() + Number(renewDuration));
      
      await companyFunctions.renewLicense({
        companyId: selectedCompany.id,
        newDurationMonths: renewDuration,
        newExpirationDate: newExpiration.toISOString().split('T')[0]
      });

      showToast(`License renewed for ${selectedCompany.name}`, 'success');
      setIsRenewModalOpen(false);
      fetchCompanies();
    } catch (err: any) {
      showToast(err.message || 'Failed to renew license', 'error');
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Company',
      render: (val: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Building size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold">{val}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{row.institution_code || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'license_duration_months',
      label: 'Duration',
      render: (val: number) => <span className="font-bold">{val ? `${val} months` : 'N/A'}</span>
    },
    {
      key: 'license_expiration_date',
      label: 'Expiration Date',
      render: (val: string) => {
        if (!val) return <span className="text-slate-400">Not set</span>;
        const expDate = new Date(val);
        const isExpired = expDate.getTime() < Date.now();
        const isExpiringSoon = expDate.getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000 && !isExpired;

        return (
          <div className="flex flex-col gap-1">
            <span className="font-bold">{val}</span>
            {isExpired ? (
              <Badge variant="warning" className="bg-rose-100 text-rose-700 w-fit text-[9px]">EXPIRED</Badge>
            ) : isExpiringSoon ? (
              <Badge variant="warning" className="w-fit text-[9px]">EXPIRING SOON</Badge>
            ) : (
              <Badge variant="success" className="w-fit text-[9px]">ACTIVE</Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRenew(row)}
          className="h-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
          <FileCheck size={14} />
          Renew
        </Button>
      )
    }
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">License Management</h1>
          <p className="text-slate-500 font-medium mt-2">Manage and renew corporate partner licenses and durations</p>
        </div>

        {isLoading && companies.length === 0 ? (
          <Card className="p-20 flex flex-col justify-center items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading licenses...</p>
          </Card>
        ) : (
          <Card className="p-0 border-none shadow-2xl overflow-visible bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <DataTable
              columns={columns}
              data={companies}
              searchable
              searchPlaceholder="Search companies by name..."
            />
          </Card>
        )}

        <Modal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          title="Renew Corporate License"
          size="sm"
        >
          <form onSubmit={submitRenewal} className="space-y-6">
            {selectedCompany && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedCompany.name}</p>
                
                <div className="mt-4 flex gap-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Expiration</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {selectedCompany.license_expiration_date || 'None'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <Input 
                label="Renewal Duration (months)" 
                type="number"
                min="1"
                className="h-14 rounded-2xl font-bold" 
                value={renewDuration}
                onChange={(e) => setRenewDuration(parseInt(e.target.value) || 12)}
                required
              />
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsRenewModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1 h-14 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]" isLoading={isLoading}>
                Confirm Renewal
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
