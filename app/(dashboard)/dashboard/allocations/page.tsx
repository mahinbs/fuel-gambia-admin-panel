'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BeneficiaryAllocation, FuelType } from '@/types';
import { Plus, Edit, Pause, Play } from 'lucide-react';
import { formatCurrency, formatLiters, formatDate } from '@/utils/format';

const allocationSchema = z.object({
  beneficiaryId: z.string().min(1, 'Beneficiary is required'),
  fuelType: z.nativeEnum(FuelType),
  monthlyAmount: z.number().min(1, 'Monthly amount must be greater than 0'),
  monthlyLiters: z.number().min(1, 'Monthly liters must be greater than 0'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type AllocationForm = z.infer<typeof allocationSchema>;

const mockAllocations: BeneficiaryAllocation[] = [
  {
    id: '1',
    beneficiaryId: 'b1',
    beneficiaryName: 'John Doe',
    departmentId: 'd1',
    departmentName: 'Health',
    fuelType: FuelType.PETROL,
    monthlyAmount: 6500,
    monthlyLiters: 100,
    usedAmount: 3250,
    usedLiters: 50,
    remainingAmount: 3250,
    remainingLiters: 50,
    status: 'ACTIVE',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<BeneficiaryAllocation[]>(mockAllocations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<BeneficiaryAllocation | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AllocationForm>({
    resolver: zodResolver(allocationSchema),
  });

  const onSubmit = (data: AllocationForm) => {
    if (editingAllocation) {
      setAllocations(
        allocations.map((a) =>
          a.id === editingAllocation.id
            ? { ...a, ...data, updatedAt: new Date().toISOString() }
            : a
        )
      );
    } else {
      const newAllocation: BeneficiaryAllocation = {
        id: Date.now().toString(),
        ...data,
        beneficiaryName: 'New Beneficiary',
        departmentId: 'd1',
        departmentName: 'Health',
        usedAmount: 0,
        usedLiters: 0,
        remainingAmount: data.monthlyAmount,
        remainingLiters: data.monthlyLiters,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAllocations([...allocations, newAllocation]);
    }
    setIsModalOpen(false);
    setEditingAllocation(null);
    reset();
  };

  const handleToggleStatus = (id: string) => {
    setAllocations(
      allocations.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : a
      )
    );
  };

  const columns = [
    { key: 'beneficiaryName', label: 'Beneficiary' },
    { key: 'departmentName', label: 'Department' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'monthlyAmount', label: 'Monthly Amount' },
    { key: 'usedLiters', label: 'Used' },
    { key: 'remainingLiters', label: 'Remaining' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = allocations.map((allocation) => ({
    id: allocation.id,
    beneficiaryName: allocation.beneficiaryName,
    departmentName: allocation.departmentName,
    fuelType: <Badge variant="info">{allocation.fuelType}</Badge>,
    monthlyAmount: formatCurrency(allocation.monthlyAmount),
    usedLiters: formatLiters(allocation.usedLiters),
    remainingLiters: formatLiters(allocation.remainingLiters),
    status: (
      <Badge variant={allocation.status === 'ACTIVE' ? 'success' : 'default'}>
        {allocation.status}
      </Badge>
    ),
    actions: (
      <div className="flex gap-2">
        <button
          onClick={() => handleToggleStatus(allocation.id)}
          className={allocation.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
        >
          {allocation.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Allocation Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Assign monthly fuel amounts to beneficiaries</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingAllocation(null);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Create Allocation
        </Button>
      </div>

      <Card>
        <DataTable columns={columns} data={tableData} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAllocation(null);
          reset();
        }}
        title={editingAllocation ? 'Edit Allocation' : 'Create Allocation'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Beneficiary ID"
            {...register('beneficiaryId')}
            error={errors.beneficiaryId?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuel Type
            </label>
            <select
              {...register('fuelType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value={FuelType.PETROL}>Petrol</option>
              <option value={FuelType.DIESEL}>Diesel</option>
            </select>
          </div>
          <Input
            label="Monthly Amount (GMD)"
            type="number"
            {...register('monthlyAmount', { valueAsNumber: true })}
            error={errors.monthlyAmount?.message}
          />
          <Input
            label="Monthly Liters"
            type="number"
            {...register('monthlyLiters', { valueAsNumber: true })}
            error={errors.monthlyLiters?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input
              label="End Date"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAllocation(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingAllocation ? 'Update' : 'Create'} Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
