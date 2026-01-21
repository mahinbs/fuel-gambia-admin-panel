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
import { FuelPolicy, FuelType } from '@/types';
import { Plus, Edit, Trash2, History, Calendar } from 'lucide-react';
import { formatCurrency, formatLiters } from '@/utils/format';
import { format } from 'date-fns';

const policySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().min(1, 'Description is required'),
  fuelType: z.nativeEnum(FuelType),
  monthlyLimit: z.number().min(1, 'Monthly limit must be greater than 0'),
  amountEquivalent: z.number().min(1, 'Amount equivalent must be greater than 0'),
  validityStart: z.string().min(1, 'Start date is required'),
  validityEnd: z.string().min(1, 'End date is required'),
});

type PolicyForm = z.infer<typeof policySchema>;

const mockPolicies: FuelPolicy[] = [
  {
    id: '1',
    name: 'Government Employee Fuel Subsidy',
    description: 'Monthly fuel allocation for government employees',
    fuelType: FuelType.PETROL,
    monthlyLimit: 100,
    amountEquivalent: 6500,
    validityStart: '2024-01-01',
    validityEnd: '2024-12-31',
    status: 'ACTIVE',
    version: 1,
    createdBy: 'Super Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Healthcare Worker Diesel Subsidy',
    description: 'Monthly diesel allocation for healthcare workers',
    fuelType: FuelType.DIESEL,
    monthlyLimit: 150,
    amountEquivalent: 10200,
    validityStart: '2024-01-01',
    validityEnd: '2024-12-31',
    status: 'ACTIVE',
    version: 1,
    createdBy: 'Super Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<FuelPolicy[]>(mockPolicies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<FuelPolicy | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<FuelPolicy | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PolicyForm>({
    resolver: zodResolver(policySchema),
  });

  const onSubmit = (data: PolicyForm) => {
    if (editingPolicy) {
      setPolicies(
        policies.map((p) =>
          p.id === editingPolicy.id
            ? { ...p, ...data, updatedAt: new Date().toISOString(), version: p.version + 1 }
            : p
        )
      );
    } else {
      const newPolicy: FuelPolicy = {
        id: Date.now().toString(),
        ...data,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'Super Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPolicies([...policies, newPolicy]);
    }
    setIsModalOpen(false);
    setEditingPolicy(null);
    reset();
  };

  const handleEdit = (policy: FuelPolicy) => {
    setEditingPolicy(policy);
    reset({
      name: policy.name,
      description: policy.description,
      fuelType: policy.fuelType,
      monthlyLimit: policy.monthlyLimit,
      amountEquivalent: policy.amountEquivalent,
      validityStart: policy.validityStart,
      validityEnd: policy.validityEnd,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter((p) => p.id !== id));
    }
  };

  const handleDeactivate = (id: string) => {
    setPolicies(
      policies.map((p) => (p.id === id ? { ...p, status: 'INACTIVE' as const } : p))
    );
  };

  const columns = [
    { key: 'name', label: 'Policy Name' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'monthlyLimit', label: 'Monthly Limit' },
    { key: 'amountEquivalent', label: 'Amount (GMD)' },
    { key: 'validity', label: 'Validity' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = policies.map((policy) => ({
    id: policy.id,
    name: policy.name,
    fuelType: <Badge variant="info">{policy.fuelType}</Badge>,
    monthlyLimit: formatLiters(policy.monthlyLimit),
    amountEquivalent: formatCurrency(policy.amountEquivalent),
    validity: `${format(new Date(policy.validityStart), 'MMM dd, yyyy')} - ${format(new Date(policy.validityEnd), 'MMM dd, yyyy')}`,
    status: (
      <Badge variant={policy.status === 'ACTIVE' ? 'success' : 'default'}>
        {policy.status}
      </Badge>
    ),
    actions: (
      <div className="flex gap-2">
        <button
          onClick={() => handleEdit(policy)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => setSelectedPolicy(policy)}
          className="text-purple-600 hover:text-purple-800"
        >
          <History size={16} />
        </button>
        {policy.status === 'ACTIVE' && (
          <button
            onClick={() => handleDeactivate(policy.id)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            Deactivate
          </button>
        )}
        <button
          onClick={() => handleDelete(policy.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Policy Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage fuel policies</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingPolicy(null);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Create Policy
        </Button>
      </div>

      <Card>
        <DataTable columns={columns} data={tableData} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPolicy(null);
          reset();
        }}
        title={editingPolicy ? 'Edit Policy' : 'Create Policy'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Policy Name"
            {...register('name')}
            error={errors.name?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
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
            {errors.fuelType && (
              <p className="text-red-500 text-sm mt-1">{errors.fuelType.message}</p>
            )}
          </div>
          <Input
            label="Monthly Limit (Liters)"
            type="number"
            {...register('monthlyLimit', { valueAsNumber: true })}
            error={errors.monthlyLimit?.message}
          />
          <Input
            label="Amount Equivalent (GMD)"
            type="number"
            {...register('amountEquivalent', { valueAsNumber: true })}
            error={errors.amountEquivalent?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Validity Start"
              type="date"
              {...register('validityStart')}
              error={errors.validityStart?.message}
            />
            <Input
              label="Validity End"
              type="date"
              {...register('validityEnd')}
              error={errors.validityEnd?.message}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPolicy(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPolicy ? 'Update' : 'Create'} Policy
            </Button>
          </div>
        </form>
      </Modal>

      {selectedPolicy && (
        <Modal
          isOpen={!!selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          title="Policy Version History"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Version history for: <strong>{selectedPolicy.name}</strong>
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-semibold">Version {selectedPolicy.version}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created: {format(new Date(selectedPolicy.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Updated: {format(new Date(selectedPolicy.updatedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
