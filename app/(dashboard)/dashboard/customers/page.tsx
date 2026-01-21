'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCustomers, suspendCustomer, activateCustomer } from '@/store/slices/customersSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Eye, Ban, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const { customers, total, loading } = useAppSelector((state) => state.customers);
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchCustomers({
        page: currentPage,
        search,
        status: statusFilter || undefined,
      })
    );
  }, [dispatch, currentPage, search, statusFilter]);

  const handleSuspend = async (id: string) => {
    try {
      await dispatch(suspendCustomer(id)).unwrap();
      showToast('Customer suspended', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to suspend customer', 'error');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await dispatch(activateCustomer(id)).unwrap();
      showToast('Customer activated', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to activate customer', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage commercial fuel customers</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search customers..."
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
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
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
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Wallet Balance</TableHeader>
                  <TableHeader>Total Spend</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name || 'N/A'}</TableCell>
                    <TableCell>{customer.phoneNumber}</TableCell>
                    <TableCell>{customer.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'error'}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(customer.walletBalance)}</TableCell>
                    <TableCell>{formatCurrency(customer.totalSpend)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/customers/${customer.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        {customer.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspend(customer.id)}
                          >
                            <Ban size={16} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(customer.id)}
                          >
                            <CheckCircle size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Card>
    </div>
  );
}
