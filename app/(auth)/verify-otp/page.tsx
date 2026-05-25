'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { verifyOtp } from '@/store/slices/authSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { AdminRole } from '@/types';
import Link from 'next/link';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || '';

  useEffect(() => {
    if (!email) {
      showToast('Email address is required for verification.', 'error');
      router.push('/signup');
    }
  }, [email, router, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 8) {
      setError('Please enter a valid 8-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await dispatch(verifyOtp({ email, token: otp })).unwrap();
      showToast('Account verified successfully!', 'success');

      // KYC check gate routing
      if (result.user.role === AdminRole.SUPER_ADMIN) {
        router.push('/dashboard/super-admin');
      } else {
        router.push('/kyc-pending');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-blue-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.05] -z-10" />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <div className="w-full max-w-md relative">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 p-8 md:p-12 overflow-hidden">
          
          <div className="flex items-center mb-8">
            <Link
              href="/signup"
              className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              <div className="p-2 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                <ArrowLeft size={18} />
              </div>
              <span className="text-sm">Back</span>
            </Link>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg mb-6 transform hover:rotate-12 transition-transform duration-300">
              <KeyRound className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Security Check</h1>
            <div className="h-1.5 w-12 bg-blue-600 rounded-full mb-4" />
            <p className="text-center text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed">
              We sent a verification code to <br />
              <span className="font-bold text-slate-900 dark:text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Input
                label="8-Digit OTP Code"
                type="text"
                placeholder="Enter 8-digit OTP"
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                error={error}
                className="h-14 text-center text-2xl font-mono tracking-widest rounded-2xl"
                required
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
                Enter the authentication token received from Supabase.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-14 text-lg shadow-xl shadow-blue-500/25"
              isLoading={isLoading}
            >
              <ShieldCheck className="mr-2" size={20} />
              Verify & Proceed
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Didn't receive the code? Check your spam folder or verify your registry email address.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
