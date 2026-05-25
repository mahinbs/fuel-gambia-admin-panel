'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search, Plus, FileSpreadsheet, ShieldCheck, Loader2, AlertCircle, Eye, Pencil, Trash2, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { beneficiaryFunctions, departmentFunctions } from '@/supabase';

export default function BeneficiariesGovPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    idNumber: '',
    vehicle: '',
    allocation: '',
    email: '',
    phone: '',
    password: '',
  });

  const loadBeneficiaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await beneficiaryFunctions.getBeneficiaries({ search: searchQuery || undefined });
      setBeneficiaries(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const loadDepartments = useCallback(async () => {
    try {
      const result = await departmentFunctions.getDepartments();
      setDepartments(result || []);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    loadBeneficiaries();
    loadDepartments();
  }, [loadBeneficiaries, loadDepartments]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      // Resolve department name to department_id (UUID)
      let departmentId = null;
      if (formData.department) {
        const cleanDeptName = formData.department.trim();
        let { data: dept } = await supabase
          .from('departments')
          .select('id')
          .eq('name', cleanDeptName)
          .single();
          
        if (!dept) {
          const { data: newDept, error: deptError } = await supabase
            .from('departments')
            .insert({
              name: cleanDeptName,
              code: cleanDeptName.slice(0, 6).toUpperCase().replace(/\s/g, '_'),
            })
            .select()
            .single();
          if (deptError) throw deptError;
          departmentId = newDept?.id;
        } else {
          departmentId = dept.id;
        }
      }

      if (isEditMode && editingId) {
        // Edit flow
        await beneficiaryFunctions.updateBeneficiary(editingId, {
          name: formData.name,
          phone: formData.phone,
          governmentId: formData.idNumber,
          departmentId: departmentId,
          monthlyAllocation: Number(formData.allocation) || 0,
        });

        // Also update department_name in profiles directly
        await supabase
          .from('profiles')
          .update({
            department_name: formData.department || null,
          })
          .eq('id', editingId);
      } else {
        // Register flow
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password || 'TempPass123!',
          options: {
            data: {
              name: formData.name,
              role: 'BENEFICIARY',
              phone_number: formData.phone,
              government_id: formData.idNumber,
              department_id: departmentId,
              department_name: formData.department || '',
            },
          },
        });

        if (authError) throw new Error(authError.message);

        if (authData?.user) {
          // Insert beneficiary row
          await supabase.from('beneficiaries').insert({
            id: authData.user.id,
            government_id: formData.idNumber,
            department_id: departmentId,
            monthly_allocation: Number(formData.allocation) || 0,
            verification_status: 'PENDING',
            fuel_type: 'PETROL',
          });
        }
      }

      await loadBeneficiaries();
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData({ name: '', department: '', idNumber: '', vehicle: '', allocation: '', email: '', phone: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (row: any) => {
    setIsEditMode(true);
    setEditingId(row.id);
    setFormData({
      name: row.name || '',
      department: row.beneficiary?.department?.name || row.department_name || '',
      idNumber: row.beneficiary?.government_id || row.government_id || '',
      vehicle: '',
      allocation: String(row.beneficiary?.monthly_allocation || ''),
      email: row.email || '',
      phone: row.phone_number || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await beneficiaryFunctions.deleteBeneficiary(deletingId);
      await loadBeneficiaries();
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setSubmitting(true);
    try {
      await beneficiaryFunctions.verifyBeneficiary(userId, 'APPROVED');
      setSelectedBeneficiary((prev: any) => prev ? {
        ...prev,
        beneficiary: {
          ...prev.beneficiary,
          verification_status: 'APPROVED'
        }
      } : null);
      await loadBeneficiaries();
    } catch (err: any) {
      setError(err.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (userId: string) => {
    setSubmitting(true);
    try {
      await beneficiaryFunctions.verifyBeneficiary(userId, 'REJECTED', 'Rejected by Government Admin');
      setSelectedBeneficiary((prev: any) => prev ? {
        ...prev,
        beneficiary: {
          ...prev.beneficiary,
          verification_status: 'REJECTED'
        }
      } : null);
      await loadBeneficiaries();
    } catch (err: any) {
      setError(err.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openDossier = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setIsDossierOpen(true);
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Department', 'Government ID', 'Monthly Allocation (L)', 'Remaining (L)', 'Status', 'Fuel Type'],
      ...beneficiaries.map((b: any) => [
        b.name || '',
        b.beneficiary?.department?.name || '',
        b.beneficiary?.government_id || '',
        b.beneficiary?.monthly_allocation || 0,
        b.beneficiary?.remaining_balance || 0,
        b.beneficiary?.verification_status || '',
        b.beneficiary?.fuel_type || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beneficiaries_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'name',
      label: 'Beneficiary Identity',
      render: (val: string) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">
            {(val || '?').charAt(0).toUpperCase()}
          </div>
          <span className="font-black text-slate-900 dark:text-white tracking-tight">{val || '—'}</span>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (_: any, row: any) => (
        <span className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">
          {row.beneficiary?.department?.name || 'General'}
        </span>
      ),
    },
    {
      key: 'government_id',
      label: 'Gov. ID',
      render: (_: any, row: any) => (
        <code className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 dark:border-blue-900/30">
          {row.beneficiary?.government_id || 'N/A'}
        </code>
      ),
    },
    {
      key: 'monthly_allocation',
      label: 'Monthly Quota',
      render: (_: any, row: any) => (
        <span className="font-black text-blue-600 dark:text-blue-400">
          {row.beneficiary?.monthly_allocation ? `${Number(row.beneficiary.monthly_allocation).toLocaleString()} L` : '0 L'}
        </span>
      ),
    },
    {
      key: 'verification_status',
      label: 'Verification',
      render: (_: any, row: any) => (
        <button onClick={() => openDossier(row)} className="text-left focus:outline-none">
          <Badge
            variant={(row.beneficiary?.verification_status || 'PENDING') === 'APPROVED' ? 'success' : (row.beneficiary?.verification_status || 'PENDING') === 'REJECTED' ? 'error' : 'warning'}
            className="font-black text-[9px] uppercase tracking-widest cursor-pointer hover:opacity-80 transition-all"
          >
            {row.beneficiary?.verification_status || 'PENDING'}
          </Badge>
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => openDossier(row)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all hover:scale-110 active:scale-95"
            title="View Dossier & KYC Documents"
          >
            <Eye size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-all hover:scale-110 active:scale-95"
            title="Edit Personnel"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-all hover:scale-110 active:scale-95"
            title="Delete Personnel"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
          {(row.beneficiary?.verification_status || 'PENDING') === 'PENDING' && (
            <button
              onClick={() => openDossier(row)}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 transition-all hover:scale-110 active:scale-95 animate-pulse"
              title="Review & Approve KYC"
            >
              <CheckCircle2 size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.GOVERNMENT_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Beneficiary Network</h1>
            <p className="text-slate-500 font-medium mt-2">Manage government personnel eligibility and dynamic fuel quotas</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" onClick={handleExport} className="bg-white dark:bg-slate-900 h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-800 shadow-sm">
              <FileSpreadsheet size={20} className="mr-2 text-emerald-600" />
              Export Dataset
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setIsEditMode(false);
                setEditingId(null);
                setFormData({ name: '', department: '', idNumber: '', vehicle: '', allocation: '', email: '', phone: '', password: '' });
                setIsModalOpen(true);
              }}
              className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
              <Plus size={20} className="mr-2" strokeWidth={3} />
              Register Personnel
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Beneficiaries...</p>
            </div>
          </div>
        ) : (
          <Card className="p-0 border-none shadow-2xl bg-transparent">
            <DataTable
              columns={columns}
              data={beneficiaries}
              searchable
              searchPlaceholder="Search by identity, department or ID..."
            />
          </Card>
        )}

        {/* Registration Modal */}
        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsEditMode(false); setEditingId(null); }} title={isEditMode ? "Modify Beneficiary Credentials" : "Executive Beneficiary Registration"} size="lg">
          <form className="space-y-10" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Full Identity"
                placeholder="e.g. John Doe"
                className="h-14 rounded-2xl font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Ministry / Department"
                placeholder="e.g. Ministry of Finance"
                className="h-14 rounded-2xl font-bold"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
              <Input
                label="Official ID Number"
                placeholder="GID-XXXX-XXXX"
                className="h-14 rounded-2xl font-bold"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                placeholder="+220 7XX XXXX"
                className="h-14 rounded-2xl font-bold"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Assigned Monthly Limit (L)"
                type="number"
                placeholder="200"
                className="h-14 rounded-2xl font-bold"
                value={formData.allocation}
                onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                required
              />
              <Input
                label="Corporate Email"
                type="email"
                placeholder="name@gov.gm"
                className="h-14 rounded-2xl font-bold"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isEditMode}
              />
            </div>

            <div className="p-8 bg-blue-50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100 dark:border-blue-500/10 flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-1">Authorization Protocol</p>
                <p className="text-[10px] font-bold text-blue-700/70 dark:text-blue-400/70 leading-relaxed uppercase tracking-wider">
                  {isEditMode 
                    ? "Updating these fields will immediately change active quotas and metadata. Changing corporate email is disabled." 
                    : "The beneficiary will receive a verification email. Their account will remain pending until KYC documents are reviewed."}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => { setIsModalOpen(false); setIsEditMode(false); setEditingId(null); }}>Discard</Button>
              <Button variant="primary" type="submit" disabled={submitting} className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
                {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Confirm Registration'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Dossier Modal */}
        <Modal isOpen={isDossierOpen} onClose={() => setIsDossierOpen(false)} title="Beneficiary Personnel Dossier" size="md">
          {selectedBeneficiary && (
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 font-black text-2xl">
                  {(selectedBeneficiary.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedBeneficiary.name}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedBeneficiary.beneficiary?.department?.name || 'General'} Department</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Gov. ID</p>
                  <code className="text-sm font-black text-blue-600">{selectedBeneficiary.beneficiary?.government_id || 'N/A'}</code>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Quota</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {Number(selectedBeneficiary.beneficiary?.monthly_allocation || 0).toLocaleString()} L
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification</p>
                  <Badge variant={(selectedBeneficiary.beneficiary?.verification_status || 'PENDING') === 'APPROVED' ? 'success' : (selectedBeneficiary.beneficiary?.verification_status || 'PENDING') === 'REJECTED' ? 'error' : 'warning'} className="font-black">
                    {selectedBeneficiary.beneficiary?.verification_status || 'PENDING'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Fuel Type</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedBeneficiary.beneficiary?.fuel_type || 'PETROL'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedBeneficiary.email || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone</p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedBeneficiary.phone_number || '—'}</p>
                </div>
              </div>

              {selectedBeneficiary.beneficiary?.monthly_allocation > 0 && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quota Utilization</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {(((selectedBeneficiary.beneficiary.monthly_allocation - selectedBeneficiary.beneficiary.remaining_balance) / selectedBeneficiary.beneficiary.monthly_allocation) * 100).toFixed(1)}% Used
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.min(100, ((selectedBeneficiary.beneficiary.monthly_allocation - selectedBeneficiary.beneficiary.remaining_balance) / selectedBeneficiary.beneficiary.monthly_allocation) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* KYC Documents Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">KYC Documents Verification</h4>
                <div className="space-y-3">
                  {/* Document 1: Government ID */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Government ID Card</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Review eligibility proof</p>
                      </div>
                    </div>
                    {selectedBeneficiary.kyc_document_1_url || selectedBeneficiary.beneficiary?.government_id_url ? (
                      <a
                        href={selectedBeneficiary.kyc_document_1_url || selectedBeneficiary.beneficiary?.government_id_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black rounded-xl uppercase tracking-wider hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="text-[9px] font-black text-slate-400 uppercase">Not Uploaded</span>
                    )}
                  </div>

                  {/* Document 2: Employment Letter */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Employment Letter</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Verify position/ministry</p>
                      </div>
                    </div>
                    {selectedBeneficiary.kyc_document_2_url || selectedBeneficiary.beneficiary?.employment_letter_url ? (
                      <a
                        href={selectedBeneficiary.kyc_document_2_url || selectedBeneficiary.beneficiary?.employment_letter_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black rounded-xl uppercase tracking-wider hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="text-[9px] font-black text-slate-400 uppercase">Not Uploaded</span>
                    )}
                  </div>

                  {/* Document 3: Additional Document */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Additional Document</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Supporting credential</p>
                      </div>
                    </div>
                    {selectedBeneficiary.kyc_document_3_url ? (
                      <a
                        href={selectedBeneficiary.kyc_document_3_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black rounded-xl uppercase tracking-wider hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="text-[9px] font-black text-slate-400 uppercase">Not Uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {(selectedBeneficiary.beneficiary?.verification_status || 'PENDING') === 'PENDING' && (
                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:text-rose-400 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    onClick={() => handleReject(selectedBeneficiary.id)}
                    disabled={submitting}
                  >
                    Reject KYC
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-500/10 font-black uppercase tracking-widest text-[10px]"
                    onClick={() => handleApprove(selectedBeneficiary.id)}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                    Approve KYC
                  </Button>
                </div>
              )}

              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsDossierOpen(false)}>
                Close Dossier
              </Button>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={isDeleteModalOpen} 
          onClose={() => { setIsDeleteModalOpen(false); setDeletingId(null); }} 
          title="Revoke Beneficiary Access" 
          size="sm"
        >
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirm Revocation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Are you absolutely sure you want to delete this beneficiary? This will permanently revoke their access, delete their profile and eliminate their dynamic fuel records.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[9px]" 
                onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null); }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xl shadow-rose-500/10 font-black uppercase tracking-widest text-[9px]" 
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                {submitting ? 'Deleting...' : 'Revoke Access'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
