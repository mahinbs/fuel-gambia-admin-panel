'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBeneficiaries } from '@/store/slices/beneficiariesSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Eye, CheckCircle2, UserCheck, Mail, Phone, Building2, ArrowRight } from 'lucide-react';
import { VerificationStatus, Beneficiary } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import Link from 'next/link';

export default function BeneficiariesSuperAdminPage() {
  const dispatch = useAppDispatch();
  const { beneficiaries, total, loading } = useAppSelector((state) => state.beneficiaries);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBeneficiaries({ page: currentPage }));
  }, [dispatch, currentPage]);

  const columns = [
    {
      key: 'name',
      label: 'Beneficiary Information',
      render: (val: string, row: Beneficiary) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
            <UserCheck size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white">{val || 'Unnamed User'}</span>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                <Phone size={10} /> {row.phoneNumber}
              </span>
              {row.email && (
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                  <Mail size={10} /> {row.email}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'departmentName',
      label: 'Institutional Link',
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-slate-400" />
          <span className="font-bold text-slate-700 dark:text-slate-300">{val || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      label: 'Status',
      render: (val: VerificationStatus) => {
        const variants = {
          [VerificationStatus.PENDING]: 'warning',
          [VerificationStatus.APPROVED]: 'success',
          [VerificationStatus.REJECTED]: 'error',
        } as const;
        return (
          <Badge variant={variants[val]} className="font-black uppercase tracking-wider text-[9px] px-2 py-0.5 shadow-sm">
            {val}
          </Badge>
        );
      },
    },
    {
      key: 'monthlyAllocation',
      label: 'Allocated Budget',
      sortable: true,
      render: (val: number) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 dark:text-white">{formatCurrency(val)}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Per Month</span>
        </div>
      ),
    },
    {
      key: 'remainingBalance',
      label: 'Current Balance',
      render: (val: number) => (
        <span className="font-black text-blue-600">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'fuelType',
      label: 'Fuel Type',
      render: (val: string) => (
        <Badge variant="info" className="font-black uppercase tracking-wider text-[9px] px-2 py-0.5">
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: Beneficiary) => (
        <div className="flex justify-end gap-2">
          {row.verificationStatus === VerificationStatus.PENDING && (
            <button className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 transition-colors" title="Verify Now">
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </button>
          )}
          <Link href={`/dashboard/beneficiaries/${row.id}`}>
            <button className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
              <Eye size={18} strokeWidth={2.5} />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Beneficiary Registry</h1>
            <p className="text-slate-500 font-medium mt-2">Manage and verify platform-wide fuel subsidy recipients</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 shadow-sm font-black text-xs uppercase tracking-widest">
              Export Database
            </Button>
            <Button variant="primary" size="lg" className="shadow-blue-500/20 hover:shadow-xl transition-all">
              Enroll New
            </Button>
          </div>
        </div>

        <Card className="p-0 border-none shadow-2xl overflow-visible bg-transparent">
          <DataTable
            columns={columns}
            data={beneficiaries}
            searchable
            searchPlaceholder="Search by name, phone, or department..."
            className="bg-transparent"
          />
          
          <div className="flex items-center justify-between mt-8 px-8 pb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {beneficiaries.length} of {total} beneficiaries
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={beneficiaries.length < 20}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Next
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
