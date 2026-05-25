'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth, logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { authService } from '@/services/authService';

export default function KycPendingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    try {
      const result = await dispatch(checkAuth()).unwrap();
      if (result && result.user) {
        if (result.user.kycStatus === 'APPROVED') {
          showToast('KYC Approved! Redirecting to dashboard...', 'success');
          const dashboardPath = authService.getDashboardPath(result.user.role);
          router.push(dashboardPath);
        } else if (result.user.kycStatus === 'REJECTED') {
          showToast('KYC Rejected. Please contact administration.', 'error');
          router.push('/kyc-rejected');
        } else {
          showToast('KYC status is still pending review.', 'info');
        }
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      showToast(err.message || 'Status check failed', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push('/login');
    } catch (err: any) {
      showToast('Logout failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-yellow-50 via-slate-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.05] -z-10" />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-600/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <div className="w-full max-w-lg relative">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 p-8 md:p-12 overflow-hidden text-center">
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-3xl shadow-lg shadow-orange-500/20 mb-6 animate-bounce">
              <Clock className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">KYC Pending Verification</h1>
            <div className="h-1.5 w-16 bg-amber-500 rounded-full mb-6" />
            
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex gap-3 text-left max-w-sm mb-6">
              <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wide leading-relaxed">
                Security clearance is required. Your administrative credentials are being validated.
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-md">
              Hi <span className="font-bold text-slate-900 dark:text-white">{user?.name}</span>, your registration request has been submitted. A platform administrator is verifying your identity and details. 
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleCheckStatus}
              variant="primary"
              size="lg"
              className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
              isLoading={isRefreshing}
            >
              <RefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} size={16} />
              Check Verification Status
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="lg"
              className="w-full h-14 text-sm font-black uppercase tracking-widest text-slate-600 hover:text-slate-900"
            >
              <LogOut className="mr-2" size={16} />
              Log Out / Exit Registry
            </Button>
          </div>

          <div className="mt-8 text-xs text-slate-400 dark:text-slate-500">
            Registered Role: <span className="font-bold text-blue-600">{user?.role.replace('_', ' ')}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
