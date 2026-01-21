'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBeneficiaries } from '@/store/slices/beneficiariesSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Eye } from 'lucide-react';
import { VerificationStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import Link from 'next/link';

export default function BeneficiariesSuperAdminPage() {
  const dispatch = useAppDispatch();
  const { beneficiaries, total, page, loading } = useAppSelector((state) => state.beneficiaries);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const getStatusBadge = (status: VerificationStatus) => {
    const variants = {
      [VerificationStatus.PENDING]: 'warning',
      [VerificationStatus.APPROVED]: 'success',
      [VerificationStatus.REJECTED]: 'error',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Beneficiaries Overview - Super Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all beneficiaries across all departments</p>
        </div>

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
                        <Link href={`/dashboard/beneficiaries/${beneficiary.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
      </div>
    </ProtectedRoute>
  );
}
