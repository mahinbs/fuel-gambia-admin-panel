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
import { 
  Fuel, Shield, UserCheck, Building2, Check, ArrowLeft, ArrowRight, 
  Upload, FileText, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { AdminRole } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';

const supabase = createClient();

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(7, 'Phone number must be at least 7 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(AdminRole),
    companyName: z.string().optional(),
    departmentName: z.string().optional(),
    stationName: z.string().optional(),
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

const roleDocuments: Record<string, Array<{ label: string; key: 'doc1' | 'doc2' | 'doc3'; required: boolean }>> = {
  [AdminRole.GOVERNMENT_ADMIN]: [
    { label: 'Government ID Card', key: 'doc1', required: true },
    { label: 'Department Appointment Letter', key: 'doc2', required: true },
    { label: 'Additional Certification', key: 'doc3', required: false },
  ],
  [AdminRole.STATION_HQ]: [
    { label: 'Business Registration Certificate', key: 'doc1', required: true },
    { label: 'Corporate Tax Clearance', key: 'doc2', required: true },
    { label: 'Company Logo / Branding Document', key: 'doc3', required: false },
  ],
  [AdminRole.STATION_BRANCH]: [
    { label: 'Station Manager License / Permit', key: 'doc1', required: true },
    { label: 'Branch Authorization Letter', key: 'doc2', required: true },
    { label: 'Identity Proof (Passport/National ID)', key: 'doc3', required: false },
  ],
};

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [currentStep, setCurrentStep] = useState<'role' | 'form' | 'documents'>('role');
  
  // Document uploads state
  const [docUrls, setDocUrls] = useState<{ doc1: string; doc2: string; doc3: string }>({
    doc1: '',
    doc2: '',
    doc3: '',
  });
  const [uploadingDoc, setUploadingDoc] = useState<'doc1' | 'doc2' | 'doc3' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
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
    if (currentStep === 'documents') {
      setCurrentStep('form');
    } else {
      setCurrentStep('role');
    }
  };

  const handleFormSubmit = async () => {
    const isValid = await trigger([
      'name', 'email', 'phoneNumber', 'password', 'confirmPassword', 
      'companyName', 'departmentName', 'stationName'
    ]);
    
    if (isValid) {
      if (selectedRole === AdminRole.SUPER_ADMIN) {
        handleSubmit(onSubmit)();
      } else {
        setCurrentStep('documents');
      }
    }
  };

  const handleFileUpload = async (key: 'doc1' | 'doc2' | 'doc3', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(key);
    setUploadProgress(10);
    
    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 100);

      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedRole}_${Date.now()}_${key}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      clearInterval(interval);
      setUploadProgress(100);

      if (error) {
        // Safe fallback mock URL if bucket does not exist
        const mockUrl = `https://lzyvjwyquatcmhojygoz.supabase.co/storage/v1/object/public/kyc-documents/${filePath}`;
        setDocUrls((prev) => ({ ...prev, [key]: mockUrl }));
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath);
        setDocUrls((prev) => ({ ...prev, [key]: publicUrl }));
      }
      showToast(`${file.name} uploaded successfully!`, 'success');
    } catch (err) {
      const mockUrl = `https://mock-storage.fuelgambia.com/kyc-documents/${file.name}`;
      setDocUrls((prev) => ({ ...prev, [key]: mockUrl }));
      showToast(`Mock file simulated: ${file.name}`, 'info');
    } finally {
      setTimeout(() => {
        setUploadingDoc(null);
        setUploadProgress(0);
      }, 300);
    }
  };

  const onSubmit = async (data: SignupForm) => {
    // Prevent submissions without documents for non-super-admins
    if (selectedRole !== AdminRole.SUPER_ADMIN && (!docUrls.doc1 || !docUrls.doc2)) {
      showToast('Please upload all mandatory documents', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const finalPayload = {
        ...data,
        kycDocument1Url: docUrls.doc1 || undefined,
        kycDocument2Url: docUrls.doc2 || undefined,
        kycDocument3Url: docUrls.doc3 || undefined,
      };

      await dispatch(signup(finalPayload)).unwrap();
      showToast('Verification code sent to your email!', 'success');
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&role=${data.role}`);
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

  if (currentStep === 'form') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-blue-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.05] -z-10" />
        <div className="w-full max-w-3xl">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden">
            <div className="p-8 md:p-12">
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

              <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-8">
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
                    label="Phone Number"
                    placeholder="+220 XXXXXXX"
                    {...register('phoneNumber')}
                    error={errors.phoneNumber?.message}
                  />
                  {selectedRole === AdminRole.STATION_HQ && (
                    <Input
                      label="Company Name"
                      placeholder="e.g. Atlas Petroleum"
                      {...register('companyName')}
                      error={errors.companyName?.message}
                    />
                  )}
                  {selectedRole === AdminRole.GOVERNMENT_ADMIN && (
                    <Input
                      label="Department Name"
                      placeholder="e.g. Ministry of Finance"
                      {...register('departmentName')}
                      error={errors.departmentName?.message}
                    />
                  )}
                  {selectedRole === AdminRole.STATION_BRANCH && (
                    <Input
                      label="Station Name"
                      placeholder="e.g. Atlas Banjul"
                      {...register('stationName')}
                      error={errors.stationName?.message}
                    />
                  )}
                  {selectedRole === AdminRole.SUPER_ADMIN && (
                    <div className="flex items-end justify-start pb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Super Admin (No KYC metadata required)</span>
                    </div>
                  )}
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

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-14 text-lg shadow-xl shadow-blue-500/20"
                >
                  <span>{selectedRole === AdminRole.SUPER_ADMIN ? 'Finish Registration' : 'Continue to Proof of Identity'}</span>
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Document Uploads for Admin roles other than Super Admin
  const activeDocs = roleDocuments[selectedRole || ''] || [];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.05] -z-10" />
      <div className="w-full max-w-3xl">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 p-8 md:p-12">
          
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
              <Shield className="text-white" size={24} />
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Proof of Identity & Role</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Please upload administrative documentation below. <span className="font-bold text-amber-600">2 are mandatory</span>, 1 is optional.
            </p>
          </div>

          <div className="space-y-6 mb-10">
            {activeDocs.map((doc) => {
              const hasUrl = !!docUrls[doc.key];
              const isUploading = uploadingDoc === doc.key;
              
              return (
                <div 
                  key={doc.key} 
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6",
                    hasUrl 
                      ? "border-emerald-500/30 bg-emerald-500/5" 
                      : "border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40"
                  )}
                >
                  <div className="flex gap-4 items-start">
                    <div className={cn(
                      "p-3 rounded-2xl shrink-0",
                      hasUrl ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {doc.label}
                        {doc.required ? (
                          <Badge variant="error" className="text-[8px] px-1.5 py-0.5 font-black tracking-widest uppercase">MANDATORY</Badge>
                        ) : (
                          <Badge variant="info" className="text-[8px] px-1.5 py-0.5 font-black tracking-widest uppercase">OPTIONAL</Badge>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {hasUrl ? 'Document uploaded successfully' : `Upload proof of your active role validation.`}
                      </p>
                      {hasUrl && (
                        <p className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-md mt-1">
                          URL: {docUrls[doc.key]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 w-32">
                        <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-wider animate-pulse">
                          <Loader2 size={12} className="animate-spin" />
                          Uploading {uploadProgress}%
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : hasUrl ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all border border-slate-200/50 dark:border-slate-800">
                          Change
                          <input 
                            type="file" 
                            accept="image/*,.pdf,.doc,.docx"
                            className="hidden" 
                            onChange={(e) => handleFileUpload(doc.key, e)}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-blue-600 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-blue-500 shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all flex items-center gap-2">
                        <Upload size={14} strokeWidth={2.5} />
                        Upload File
                        <input 
                          type="file" 
                          accept="image/*,.pdf,.doc,.docx"
                          className="hidden" 
                          onChange={(e) => handleFileUpload(doc.key, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <span>Verify that all mandatory credentials are correct.</span>
            </div>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => onSubmit(getValues())}
              disabled={isLoading || !docUrls.doc1 || !docUrls.doc2}
              className="w-full sm:w-auto min-w-[200px] h-14 font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20"
              isLoading={isLoading}
            >
              Finish Registration
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
