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
    description: 'Government Department Head - Full system access',
    icon: Shield,
    color: 'blue',
    features: ['Policy Management', 'User Management', 'Station Approvals', 'Analytics'],
  },
  {
    value: AdminRole.DEPARTMENT_OFFICER,
    label: 'Department Officer',
    description: 'Department Administrator - Manage beneficiaries and allocations',
    icon: UserCheck,
    color: 'green',
    features: ['Beneficiary Verification', 'Allocation Management', 'Coupon Management', 'Reports'],
  },
  {
    value: AdminRole.STATION_MANAGER,
    label: 'Station Manager',
    description: 'Fuel Station Manager - Manage station operations',
    icon: Building2,
    color: 'purple',
    features: ['Inventory Management', 'Attendant Management', 'Transactions', 'Settlements'],
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
      role: selectedRole || undefined,
    },
  });

  const handleRoleSelect = (role: AdminRole) => {
    setSelectedRole(role);
    setValue('role', role);
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
      
      // Redirect to role-specific dashboard
      const dashboardPath = authService.getDashboardPath(result.user.role);
      router.push(dashboardPath);
    } catch (error: any) {
      showToast(error.message || 'Signup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Role Selection
  if (currentStep === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Fuel className="text-white" size={32} />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Select your role to get started
            </p>

            {/* Role Selection */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Select Your Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleSelect(role.value)}
                        className={`p-5 rounded-lg border-2 transition-all text-left relative hover:shadow-lg ${
                          isSelected
                            ? role.color === 'blue'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                              : role.color === 'green'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                              : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {isSelected && (
                          <div
                            className={`absolute top-3 right-3 rounded-full p-1.5 ${
                              role.color === 'blue'
                                ? 'bg-blue-500'
                                : role.color === 'green'
                                ? 'bg-green-500'
                                : 'bg-purple-500'
                            }`}
                          >
                            <Check className="text-white" size={18} />
                          </div>
                        )}
                        <div className="flex items-start gap-3 mb-3">
                          <Icon
                            size={28}
                            className={`flex-shrink-0 ${
                              role.color === 'blue'
                                ? 'text-blue-600 dark:text-blue-400'
                                : role.color === 'green'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-purple-600 dark:text-purple-400'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">
                              {role.label}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {role.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Key Features:
                          </p>
                          <ul className="space-y-1.5">
                            {role.features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <span className="text-green-500 font-bold">•</span> {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-2">{errors.role.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Already have an account? Sign in
                </Link>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleContinue}
                  disabled={!selectedRole}
                  className="flex items-center gap-2"
                >
                  Continue
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Signup Form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Fuel className="text-white" size={32} />
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Fill in your details to complete registration
              </p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </button>
          </div>

          {/* Selected Role Display */}
          {selectedRole && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                {(() => {
                  const role = roleOptions.find((r) => r.value === selectedRole);
                  const Icon = role?.icon;
                  return (
                    <>
                      {Icon && (
                        <Icon
                          size={24}
                          className={
                            role.color === 'blue'
                              ? 'text-blue-600 dark:text-blue-400'
                              : role.color === 'green'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-purple-600 dark:text-purple-400'
                          }
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Selected Role: <span className="font-semibold">{role?.label}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{role?.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('role')} value={selectedRole || ''} />

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                {...register('name')}
                error={errors.name?.message}
              />

              <Input
                label="Email"
                type="email"
                placeholder="admin@fuelgambia.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                error={errors.password?.message}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
