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
      showToast('Login successful!', 'success');
      
      // Redirect to role-specific dashboard
      const dashboardPath = authService.getDashboardPath(result.user.role);
      router.push(dashboardPath);
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Fuel className="text-white" size={32} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Fuel Gambia
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Admin Panel Login
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="admin@fuelgambia.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              <strong>Demo Credentials:</strong>
            </p>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>
                <strong>Super Admin:</strong> superadmin@fuelgambia.com
              </p>
              <p>
                <strong>Dept. Officer:</strong> deptofficer@fuelgambia.com
              </p>
              <p>
                <strong>Station Manager:</strong> stationmanager@fuelgambia.com
              </p>
              <p className="mt-2">Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
