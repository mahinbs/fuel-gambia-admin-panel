'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAttendants, createAttendant, deleteAttendant } from '@/store/slices/attendantsSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Eye, Plus, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { useToast } from '@/components/providers/ToastProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const attendantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  stationId: z.string().min(1, 'Station is required'),
  stationName: z.string().min(1, 'Station name is required'),
});

type AttendantForm = z.infer<typeof attendantSchema>;

const mockStations = [
  { id: 'station_1', name: 'Station A' },
  { id: 'station_2', name: 'Station B' },
  { id: 'station_3', name: 'Station C' },
  { id: 'station_4', name: 'Station D' },
  { id: 'station_5', name: 'Station E' },
];

export default function AttendantsPage() {
  const dispatch = useAppDispatch();
  const { attendants, total, loading } = useAppSelector((state) => state.attendants);
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AttendantForm>({
    resolver: zodResolver(attendantSchema),
  });

  const selectedStationId = watch('stationId');

  useEffect(() => {
    dispatch(
      fetchAttendants({
        page: currentPage,
        search,
        status: statusFilter || undefined,
      })
    );
  }, [dispatch, currentPage, search, statusFilter]);

  const handleCreate = async (data: AttendantForm) => {
    try {
      await dispatch(createAttendant(data)).unwrap();
      showToast('Attendant created successfully', 'success');
      setIsCreateModalOpen(false);
      reset();
      dispatch(
        fetchAttendants({
          page: currentPage,
          search,
          status: statusFilter || undefined,
        })
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to create attendant', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteAttendant(id)).unwrap();
        showToast('Attendant deleted successfully', 'success');
        dispatch(
          fetchAttendants({
            page: currentPage,
            search,
            status: statusFilter || undefined,
          })
        );
      } catch (error: any) {
        showToast(error.message || 'Failed to delete attendant', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendants</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage fuel station attendants</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={20} className="mr-2" />
          Add Attendant
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search attendants..."
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
                  <TableHeader>Station</TableHeader>
                  <TableHeader>Device ID</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Last Login</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendants.map((attendant) => (
                  <TableRow key={attendant.id}>
                    <TableCell>{attendant.name || 'N/A'}</TableCell>
                    <TableCell>{attendant.phoneNumber}</TableCell>
                    <TableCell>{attendant.stationName}</TableCell>
                    <TableCell>
                      {attendant.deviceId ? (
                        <Badge variant="success" size="sm">{attendant.deviceId}</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Not Bound</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={attendant.status === 'ACTIVE' ? 'success' : 'error'}>
                        {attendant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attendant.lastLogin ? formatDate(attendant.lastLogin) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/attendants/${attendant.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attendant.id, attendant.name || 'Attendant')}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Card>

      {/* Create Attendant Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          reset();
        }}
        title="Add New Attendant"
      >
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Phone Number"
            placeholder="+220 123 4567"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="attendant@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Station <span className="text-red-500">*</span>
            </label>
            <select
              {...register('stationId')}
              onChange={(e) => {
                const selectedStation = mockStations.find((s) => s.id === e.target.value);
                if (selectedStation) {
                  setValue('stationName', selectedStation.name);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select Station</option>
              {mockStations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
            {errors.stationId && (
              <p className="text-red-500 text-sm mt-1">{errors.stationId.message}</p>
            )}
            <input type="hidden" {...register('stationName')} />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Attendant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
