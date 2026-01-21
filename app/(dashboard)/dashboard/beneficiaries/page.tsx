'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBeneficiaries, verifyBeneficiary } from '@/store/slices/beneficiariesSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Eye, Check, X } from 'lucide-react';
import { VerificationStatus, FuelType } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';

export default function BeneficiariesPage() {
  const dispatch = useAppDispatch();
  const { beneficiaries, total, page, loading } = useAppSelector((state) => state.beneficiaries);
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [verificationModal, setVerificationModal] = useState<{ open: boolean; beneficiary: any }>({
    open: false,
    beneficiary: null,
  });
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VerificationStatus.APPROVED);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    dispatch(
      fetchBeneficiaries({
        page: currentPage,
        search,
        status: statusFilter || undefined,
        department: departmentFilter || undefined,
      })
    );
  }, [dispatch, currentPage, search, statusFilter, departmentFilter]);

  const handleVerify = async () => {
    if (!verificationModal.beneficiary) return;
    
    try {
      await dispatch(
        verifyBeneficiary({
          id: verificationModal.beneficiary.id,
          status: verificationStatus,
          rejectionReason: verificationStatus === VerificationStatus.REJECTED ? rejectionReason : undefined,
        })
      ).unwrap();
      showToast('Beneficiary verification updated', 'success');
      setVerificationModal({ open: false, beneficiary: null });
      setRejectionReason('');
      setVerificationStatus(VerificationStatus.APPROVED);
      
      // Refresh the beneficiaries list
      dispatch(
        fetchBeneficiaries({
          page: currentPage,
          search,
          status: statusFilter || undefined,
          department: departmentFilter || undefined,
        })
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to verify beneficiary', 'error');
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    const variants = {
      [VerificationStatus.PENDING]: 'warning',
      [VerificationStatus.APPROVED]: 'success',
      [VerificationStatus.REJECTED]: 'error',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Beneficiaries</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage government employee beneficiaries</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search beneficiaries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value={VerificationStatus.PENDING}>Pending</option>
            <option value={VerificationStatus.APPROVED}>Approved</option>
            <option value={VerificationStatus.REJECTED}>Rejected</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Departments</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Finance">Finance</option>
            <option value="Transport">Transport</option>
            <option value="Agriculture">Agriculture</option>
          </select>
          <Button variant="primary" onClick={() => setCurrentPage(1)}>
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={60} />
            ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Phone</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Allocation</TableHeader>
                  <TableHeader>Balance</TableHeader>
                  <TableHeader>Fuel Type</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id}>
                    <TableCell>{beneficiary.name || 'N/A'}</TableCell>
                    <TableCell>{beneficiary.phoneNumber}</TableCell>
                    <TableCell>{beneficiary.departmentName || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(beneficiary.verificationStatus)}</TableCell>
                    <TableCell>{formatCurrency(beneficiary.monthlyAllocation)}</TableCell>
                    <TableCell>{formatCurrency(beneficiary.remainingBalance)}</TableCell>
                    <TableCell>{beneficiary.fuelType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/beneficiaries/${beneficiary.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        {beneficiary.verificationStatus === VerificationStatus.PENDING && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setVerificationModal({ open: true, beneficiary });
                              setVerificationStatus(VerificationStatus.APPROVED);
                              setRejectionReason('');
                            }}
                          >
                            <Check size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {beneficiaries.length} of {total} beneficiaries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={beneficiaries.length < 20}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Verification Modal */}
      <Modal
        isOpen={verificationModal.open}
        onClose={() => {
          setVerificationModal({ open: false, beneficiary: null });
          setVerificationStatus(VerificationStatus.APPROVED);
          setRejectionReason('');
        }}
        title="Verify Beneficiary"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Status
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={VerificationStatus.APPROVED}>Approve</option>
              <option value={VerificationStatus.REJECTED}>Reject</option>
            </select>
          </div>
          {verificationStatus === VerificationStatus.REJECTED && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={4}
                placeholder="Enter rejection reason..."
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setVerificationModal({ open: false, beneficiary: null });
                setVerificationStatus(VerificationStatus.APPROVED);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVerify}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
