'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, XCircle, Clock, Eye, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { beneficiaryFunctions } from '@/supabase';

export default function ApprovalsGovPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch beneficiaries (all) and filter by verification status
      const result = await beneficiaryFunctions.getBeneficiaries({});
      setApprovals(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const handleApprove = async (userId: string) => {
    setProcessing(userId + '_approve');
    try {
      await beneficiaryFunctions.verifyBeneficiary(userId, 'APPROVED');
      await loadApprovals();
    } catch (err: any) {
      setError(err.message || 'Approval failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessing(userId + '_reject');
    try {
      await beneficiaryFunctions.verifyBeneficiary(userId, 'REJECTED', 'Rejected by Government Admin');
      await loadApprovals();
    } catch (err: any) {
      setError(err.message || 'Rejection failed');
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = approvals.filter(a => a.beneficiary?.verification_status === 'PENDING').length;
  const approvedCount = approvals.filter(a => a.beneficiary?.verification_status === 'APPROVED').length;
  const rejectedCount = approvals.filter(a => a.beneficiary?.verification_status === 'REJECTED').length;

  const stats = [
    { title: 'Pending Requests', value: pendingCount, icon: Clock, color: 'amber' },
    { title: 'Approved (Total)', value: approvedCount, icon: CheckCircle2, color: 'emerald' },
    { title: 'Rejected (Total)', value: rejectedCount, icon: XCircle, color: 'rose' },
  ];

  const columns = [
    {
      key: 'role',
      label: 'Request Type',
      render: (val: string) => (
        <Badge variant="info" className="font-black text-[9px] uppercase tracking-widest px-2 py-1">
          {val === 'BENEFICIARY' ? 'New Beneficiary' : 'Coupon Request'}
        </Badge>
      ),
    },
    {
      key: 'name',
      label: 'Entity / Requester',
      render: (val: string, item: any) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 dark:text-white tracking-tight">{val || 'Unknown'}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5 opacity-60">
            Ref: #{item.id?.slice(0, 8)}
          </span>
        </div>
      ),
    },
    {
      key: 'beneficiary',
      label: 'Details',
      render: (val: any) => (
        <div className="space-y-1">
          <p className="text-slate-500 font-bold italic text-xs">
            {val?.government_id ? `ID: ${val.government_id}` : 'No ID provided'}
          </p>
          {val?.department?.name && (
            <span className="text-[9px] font-black bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-600 border border-blue-100 dark:border-blue-900/30 uppercase tracking-widest">
              Dept: {val.department.name}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Submission Date',
      render: (val: string) => (
        <span className="text-slate-500 text-[11px] font-black uppercase tracking-tight">
          {val ? new Date(val).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'beneficiary',
      label: 'Status',
      render: (val: any) => {
        const status = val?.verification_status || 'PENDING';
        return (
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              status === 'PENDING' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" :
              status === 'APPROVED' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
              "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            )} />
            <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{status}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Control',
      render: (_: any, item: any) => {
        const status = item.beneficiary?.verification_status || 'PENDING';
        return (
          <div className="flex items-center gap-3">
            {status === 'PENDING' && (
              <>
                <button
                  className="p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 transition-all hover:scale-110 active:scale-90 disabled:opacity-50"
                  title="Approve"
                  disabled={processing === item.id + '_approve'}
                  onClick={() => handleApprove(item.id)}
                >
                  {processing === item.id + '_approve' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  )}
                </button>
                <button
                  className="p-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-all hover:scale-110 active:scale-90 disabled:opacity-50"
                  title="Reject"
                  disabled={processing === item.id + '_reject'}
                  onClick={() => handleReject(item.id)}
                >
                  {processing === item.id + '_reject' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <XCircle size={20} strokeWidth={2.5} />
                  )}
                </button>
              </>
            )}
            {status !== 'PENDING' && (
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Processed</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.GOVERNMENT_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Executive Queue</h1>
            <p className="text-slate-500 font-medium mt-2">Critical decision engine for coupons, personnel, and institutional registrations</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-50" onClick={loadApprovals}>
              Refresh Queue
            </Button>
            <Button variant="primary" size="lg" className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95">
              Secure Audit
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <AlertCircle className="text-rose-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-10 border-none shadow-2xl relative overflow-hidden group bg-white dark:bg-slate-900 transition-all hover:translate-y-[-4px]">
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.title}</p>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {loading ? '—' : stat.value}
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Live Count</span>
                  </div>
                </div>
                <div className={cn(
                  "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl",
                  stat.color === 'amber' ? "bg-amber-600 text-white shadow-amber-500/20" :
                  stat.color === 'emerald' ? "bg-emerald-600 text-white shadow-emerald-500/20" :
                  "bg-rose-600 text-white shadow-rose-500/20"
                )}>
                  <stat.icon size={32} strokeWidth={2.5} />
                </div>
              </div>
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:rotate-45 translate-x-8 translate-y-[-8px]",
                stat.color === 'amber' ? "text-amber-500" : stat.color === 'emerald' ? "text-emerald-500" : "text-rose-500"
              )}>
                <stat.icon size={128} />
              </div>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Queue...</p>
            </div>
          </div>
        ) : (
          <Card className="p-0 border-none shadow-2xl bg-transparent">
            <DataTable
              columns={columns}
              data={approvals}
              searchable
              searchPlaceholder="Filter executive queue by entity or ID..."
            />
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
