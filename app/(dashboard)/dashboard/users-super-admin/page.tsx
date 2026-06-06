'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Mail, Clock, Edit2, Trash2, Shield, UserCheck, Check, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { AdminRole, AdminUser } from '@/types';
import { cn } from '@/utils/cn';
import { profilesService } from '@/services/profilesService';
import { useToast } from '@/components/providers/ToastProvider';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { useSearchParams } from 'next/navigation';
import { companyFunctions } from '@/supabase';

export default function UsersSuperAdminPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'employees';
  const [activeTab, setActiveTab] = useState<'employees' | 'companies'>(tabParam as any);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: AdminRole.SUPER_ADMIN,
    active: true,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await profilesService.getAdminProfiles();
      setUsers(data.filter(u => !u.isArchived));
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch administrative profiles', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await companyFunctions.getCompanies({ page: 1 });
      setCompanies(response.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch onboarded companies', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchUsers();
    } else {
      fetchCompanies();
    }
  }, [activeTab]);

  useEffect(() => {
    setActiveTab((searchParams.get('tab') as any) || 'employees');
  }, [searchParams]);

  const handleUpdateKyc = async (userId: string, kycStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await profilesService.updateKycStatus(userId, kycStatus);
      showToast(`User KYC status updated to ${kycStatus}!`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update KYC status', 'error');
    }
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await profilesService.toggleUserActive(selectedUser.id, formData.active);
      showToast('User profile updated successfully', 'success');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user profile', 'error');
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Are you sure you want to archive this user?')) {
      try {
        await profilesService.archiveUserProfile(id);
        showToast('User profile successfully archived', 'success');
        fetchUsers();
      } catch (err: any) {
        showToast(err.message || 'Failed to archive user profile', 'error');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Identity & Contact',
      render: (val: string, row: AdminUser) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">
            {val.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-white tracking-tight">{val}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Mail size={10} /> {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Security Role',
      render: (role: string) => {
        const roleStyles: Record<string, string> = {
          [AdminRole.SUPER_ADMIN]: 'text-blue-600',
          [AdminRole.GOVERNMENT_ADMIN]: 'text-purple-600',
          [AdminRole.STATION_HQ]: 'text-indigo-600',
          [AdminRole.STATION_BRANCH]: 'text-emerald-600',
        };
        return (
          <span className={cn("text-[10px] font-black uppercase tracking-widest", roleStyles[role] || 'text-slate-500')}>
            {role.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'details',
      label: 'Organizational Metadata',
      render: (_: any, row: AdminUser) => {
        const detail = row.companyName || row.departmentName || row.stationName || row.phoneNumber || 'N/A';
        const type = row.companyName 
          ? 'Fuel Company' 
          : row.departmentName 
          ? 'Government Dept' 
          : row.stationName 
          ? 'Station Branch' 
          : row.phoneNumber 
          ? 'Phone Number' 
          : '';
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{detail}</span>
            {type && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{type}</span>}
          </div>
        );
      }
    },
    {
      key: 'kycStatus',
      label: 'KYC Verification',
      render: (val: string) => {
        const kycStyles = {
          PENDING: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
          APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
          REJECTED: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
        };
        return (
          <Badge className={cn("text-[10px] font-black uppercase tracking-wider border", kycStyles[val as keyof typeof kycStyles] || 'bg-slate-100 text-slate-800')}>
            {val || 'PENDING'}
          </Badge>
        );
      }
    },
    {
      key: 'active',
      label: 'Status',
      render: (val: boolean) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            val ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-700"
          )} />
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
            {val ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: AdminUser) => (
        <div className="flex items-center gap-2">
          {row.role !== AdminRole.SUPER_ADMIN && row.kycStatus === 'PENDING' && (
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateKyc(row.id, 'APPROVED')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] h-8 px-2 rounded-xl uppercase tracking-wider"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateKyc(row.id, 'REJECTED')}
                className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 font-black text-[10px] h-8 px-2 rounded-xl uppercase tracking-wider"
              >
                Reject
              </Button>
            </div>
          )}
          
          <button 
            onClick={() => handleEdit(row)}
            className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors"
            title="Edit User"
          >
            <Edit2 size={16} strokeWidth={2.5} />
          </button>
          
          {row.role !== AdminRole.SUPER_ADMIN && (
            <button 
              onClick={() => handleArchive(row.id)}
              className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-500 transition-colors"
              title="Archive User"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Access Control</h1>
            <p className="text-slate-500 font-medium mt-2">Verify registrations, manage KYC approvals, and configure platform permissions</p>
          </div>
          
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('employees')}
              className={cn(
                "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === 'employees' ? "bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              SleekTech Employees
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={cn(
                "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === 'companies' ? "bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              Onboarded Companies
            </button>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-20 flex flex-col justify-center items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading data...</p>
          </Card>
        ) : (
          <Card className="p-0 border-none shadow-2xl overflow-visible bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            {activeTab === 'employees' ? (
              <DataTable
                columns={columns}
                data={users}
                searchable
                searchPlaceholder="Search by name, email, or details..."
              />
            ) : (
              <DataTable
                columns={[
                  { key: 'name', label: 'Company Name', render: (val) => <span className="font-bold">{val}</span> },
                  { key: 'institution_code', label: 'Institution Code', render: (val, row) => val || row.tin || 'N/A' },
                  { key: 'contact_email', label: 'Email' },
                  { key: 'contact_phone', label: 'Phone' },
                  { key: 'address', label: 'Location' },
                  { key: 'status', label: 'Status', render: (val) => <Badge variant={val === 'ACTIVE' ? 'success' : 'warning'}>{val || 'ACTIVE'}</Badge> },
                ]}
                data={companies}
                searchable
                searchPlaceholder="Search companies..."
              />
            )}
          </Card>
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Access Profile"
          size="md"
        >
          <form className="space-y-8" onSubmit={handleUpdate}>
            <div className="space-y-6">
              <Input 
                label="Staff Full Name" 
                className="h-14 rounded-2xl font-bold"
                value={formData.name}
                disabled
              />
              <Input 
                label="Corporate Email" 
                type="email" 
                className="h-14 rounded-2xl font-bold"
                value={formData.email}
                disabled
              />
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.2em]">Administrative Role</label>
                <select 
                  className="w-full h-14 px-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none appearance-none cursor-not-allowed"
                  value={formData.role}
                  disabled
                >
                  <option value={AdminRole.SUPER_ADMIN}>Super Administrator</option>
                  <option value={AdminRole.GOVERNMENT_ADMIN}>Government Officer</option>
                  <option value={AdminRole.STATION_HQ}>Station HQ Manager</option>
                  <option value={AdminRole.STATION_BRANCH}>Station Branch Manager</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Account Access</p>
                  <p className="text-[10px] font-medium text-slate-400">Toggle whether this user can log in to the dashboard</p>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-6 h-6 text-blue-600 border-slate-300 dark:border-slate-700 rounded focus:ring-blue-500 bg-white dark:bg-slate-900 cursor-pointer"
                />
              </div>

              {/* Document Review Links */}
              {selectedUser && selectedUser.role !== AdminRole.SUPER_ADMIN && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">KYC Proof Documents</p>
                  <div className="space-y-3">
                    {selectedUser.kycDocument1Url && (
                      <a 
                        href={selectedUser.kycDocument1Url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-white dark:bg-slate-905 p-3 rounded-2xl border border-slate-100 dark:border-slate-800"
                      >
                        <FileText size={16} />
                        <span>View Document 1 (Mandatory)</span>
                      </a>
                    )}
                    {selectedUser.kycDocument2Url && (
                      <a 
                        href={selectedUser.kycDocument2Url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-white dark:bg-slate-905 p-3 rounded-2xl border border-slate-100 dark:border-slate-800"
                      >
                        <FileText size={16} />
                        <span>View Document 2 (Mandatory)</span>
                      </a>
                    )}
                    {selectedUser.kycDocument3Url && (
                      <a 
                        href={selectedUser.kycDocument3Url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-white dark:bg-slate-905 p-3 rounded-2xl border border-slate-100 dark:border-slate-800"
                      >
                        <FileText size={16} />
                        <span>View Document 3 (Optional)</span>
                      </a>
                    )}
                    {!selectedUser.kycDocument1Url && !selectedUser.kycDocument2Url && (
                      <p className="text-xs text-slate-450 dark:text-slate-500">No documents uploaded.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
                Update Profile
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
