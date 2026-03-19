'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@/store/hooks';
import { signup } from '@/store/slices/authSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { Fuel, Shield, UserCheck, Building2, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { AdminRole } from '@/types';
import { authService } from '@/services/authService';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(AdminRole),
  })
  .refine((data) => data.role !== undefined && data.role !== null, {
    message: 'Please select a role',
    path: ['role'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

const roleOptions = [
  {
    value: AdminRole.SUPER_ADMIN,
    label: 'Super Admin',
    description: 'System Overseer - Full system access and analytics',
    icon: Shield,
    color: 'blue' as const,
    features: ['Company Onboarding', 'User Management', 'Fuel Consumption', 'Consolidated Reports'],
  },
  {
    value: AdminRole.GOVERNMENT_ADMIN,
    label: 'Dept. Officer',
    description: 'Government Official - Manage fuel allocations and coupons',
    icon: UserCheck,
    color: 'green' as const,
    features: ['Fuel Allocation', 'Coupon Management', 'Company Approvals', 'Policy Management'],
  },
  {
    value: AdminRole.STATION_HQ,
    label: 'Station HQ Admin',
    description: 'Station Head Office - Oversee all business branches',
    icon: Building2,
    color: 'purple' as const,
    features: ['Branch Management', 'Fuel Ordering', 'HQ Reporting', 'Coupon Billing'],
  },
  {
    value: AdminRole.STATION_BRANCH,
    label: 'Station Manager',
    description: 'Branch Manager - Manage individual station operations',
    icon: Fuel,
    color: 'orange' as const,
    features: ['Staff Management', 'Inventory Control', 'Shift Management', 'Daily Reconciliation'],
  },
];

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [currentStep, setCurrentStep] = useState<'role' | 'form'>('role');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: selectedRole as any,
    },
  });

  const handleRoleSelect = (role: AdminRole) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const handleContinue = () => {
    if (!selectedRole) {
      showToast('Please select a role to continue', 'error');
      return;
    }
    setCurrentStep('form');
  };

  const handleBack = () => {
    setCurrentStep('role');
  };

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const result = await dispatch(signup(data)).unwrap();
      showToast('Account created successfully!', 'success');
      const dashboardPath = authService.getDashboardPath(result.user.role);
      router.push(dashboardPath);
    } catch (error: any) {
      showToast(error.message || 'Signup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.05] -z-10" />
        <div className="w-full max-w-5xl">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 p-8 md:p-12">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg mb-6 active:scale-95 transition-transform duration-300">
                <Fuel className="text-white" size={40} />
              </div>
              <h1 className="text-4xl font-extrabold text-center text-slate-900 dark:text-white mb-3 tracking-tight">
                Get Started with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Fuel Gambia</span>
              </h1>
              <p className="text-center text-slate-600 dark:text-slate-400 max-w-lg text-lg">
                Choose the role that best defines your position in the fuel management ecosystem.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                // Explicit string comparison to prevent any role selection overlaps
                const isSelected = selectedRole?.toString() === role.value.toString();
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelect(role.value)}
                    className={`group p-6 rounded-3xl border-2 transition-all duration-500 text-left relative overflow-hidden backdrop-blur-md flex flex-col h-full ${
                      isSelected
                        ? role.color === 'blue'
                          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]'
                          : role.color === 'green'
                          ? 'border-green-500 bg-green-500/10 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]'
                          : role.color === 'purple'
                          ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]'
                          : 'border-orange-500 bg-orange-500/10 shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]'
                        : 'border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 hover:border-blue-500/50 hover:shadow-xl'
                    }`}
                  >
                    {/* Animated background on hover/select */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-700 ${
                      role.color === 'blue' ? 'bg-blue-600' : role.color === 'green' ? 'bg-green-600' : role.color === 'purple' ? 'bg-purple-600' : 'bg-orange-600'
                    }`} />
                    
                    <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                      isSelected
                        ? role.color === 'blue' ? 'bg-blue-500 text-white' : role.color === 'green' ? 'bg-green-500 text-white' : role.color === 'purple' ? 'bg-purple-500 text-white' : 'bg-orange-500 text-white'
                        : role.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : role.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : role.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                    }`}>
                      <Icon size={30} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 leading-tight">
                        {role.label}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    <div className="space-y-2 mt-auto">
                      {role.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <Check size={12} className="text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {isSelected && (
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center animate-in zoom-in duration-300 ${
                        role.color === 'blue' ? 'bg-blue-500' : role.color === 'green' ? 'bg-green-500' : role.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'
                      }`}>
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/login"
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Already have an account? <span className="underline underline-offset-4 decoration-blue-500/30">Sign in</span>
              </Link>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full sm:w-auto min-w-[200px] h-14"
              >
                <span className="mr-2">Continue to Details</span>
                <ArrowRight size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-blue-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.05] -z-10" />
      <div className="w-full max-w-3xl">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden">
          <div className="md:flex">
            <div className="w-full p-8 md:p-12">
              <div className="flex items-center justify-between mb-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  <div className="p-2 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                    <ArrowLeft size={20} />
                  </div>
                  <span>Back</span>
                </button>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl">
                  <Fuel className="text-white" size={24} />
                </div>
              </div>

              <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Complete Registry</h1>
                <p className="text-slate-600 dark:text-slate-400">Join as <span className="font-bold text-blue-600">{roleOptions.find(r => r.value === selectedRole)?.label}</span> by filling the form below.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Work Email"
                    type="email"
                    placeholder="admin@fuelgambia.com"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create security code"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Repeat for safety"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 w-5 h-5 text-blue-600 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-blue-500 bg-white dark:bg-slate-900"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    By clicking this, I agree to the <Link href="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and recognize our <Link href="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>.
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-14 text-lg shadow-xl shadow-blue-500/20"
                  isLoading={isLoading}
                >
                  Finish Registration
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
