'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { ShieldX, LogOut, ArrowLeft } from 'lucide-react';

export default function KycRejectedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push('/login');
    } catch (err: any) {
      showToast('Logout failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-rose-50 via-slate-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.05] -z-10" />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-400/10 dark:bg-rose-600/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <div className="w-full max-w-lg relative">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 p-8 md:p-12 overflow-hidden text-center">
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-rose-500 to-red-600 p-5 rounded-3xl shadow-lg shadow-rose-500/20 mb-6">
              <ShieldX className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Access Denied</h1>
            <div className="h-1.5 w-16 bg-rose-500 rounded-full mb-6" />
            
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-md">
              Hi <span className="font-bold text-slate-900 dark:text-white">{user?.name}</span>, your administrative registration request was reviewed and **declined** by the platform super administrator.
            </p>
            
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider mt-4 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 inline-block">
              KYC Status: Rejected
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleLogout}
              variant="primary"
              size="lg"
              className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
            >
              <LogOut className="mr-2" size={16} />
              Return to Login
            </Button>
          </div>

          <div className="mt-8 text-xs text-slate-400 dark:text-slate-500">
            If you believe this is an error, please contact your respective company coordinator or support.
          </div>

        </div>
      </div>
    </div>
  );
}
