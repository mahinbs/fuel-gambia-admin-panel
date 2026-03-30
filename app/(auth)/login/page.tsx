'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { Fuel } from 'lucide-react';
import { authService } from '@/services/authService';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await dispatch(login(data)).unwrap();
      showToast('Welcome back!', 'success');
      const dashboardPath = authService.getDashboardPath(result.user.role);
      router.push(dashboardPath);
    } catch (error: any) {
      showToast(error.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.05] -z-10" />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <div className="w-full max-w-md relative">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 p-8 md:p-12 overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg mb-6 transform hover:rotate-12 transition-transform duration-300">
              <Fuel className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Fuel Gambia</h1>
            <div className="h-1.5 w-12 bg-blue-600 rounded-full mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">Administration Secure Access</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@fuelgambia.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <div className="space-y-1">
              <Input
                label="Security Key"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
              <div className="text-right">
                <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                  Recovery Access?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-14 text-lg shadow-xl shadow-blue-500/25"
              isLoading={isLoading}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              New to the platform?{' '}
              <Link
                href="/signup"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-all"
              >
                Join Registry
              </Link>
            </p>
          </div>

          {/* Training Mode / Demo Credentials */}
          <div className="mt-10 p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                System Credentials
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Super Admin', email: 'superadmin@fuelgambia.com' },
                { label: 'Dept. Officer', email: 'deptofficer@fuelgambia.com' },
                { label: 'Station HQ', email: 'stationhq@fuelgambia.com' },
                { label: 'Station Manager', email: 'stationmanager@fuelgambia.com' }
              ].map((cred) => (
                <div key={cred.email} className="flex justify-between items-center group">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{cred.label}</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors group-hover:text-blue-500">{cred.email}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2 flex justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Universal Pass</span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
