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
import { AdminUser, AdminRole } from '@/types';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(AdminRole),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type UserForm = z.infer<typeof userSchema>;

const mockUsers: AdminUser[] = [
  {
    id: '1',
    email: 'deptofficer1@fuelgambia.com',
    name: 'John Doe',
    role: AdminRole.DEPARTMENT_OFFICER,
    permissions: [],
    createdAt: '2024-01-01T00:00:00Z',
    active: true,
  },
  {
    id: '2',
    email: 'stationmanager1@fuelgambia.com',
    name: 'Jane Smith',
    role: AdminRole.STATION_MANAGER,
    permissions: [],
    createdAt: '2024-01-02T00:00:00Z',
    active: true,
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = (data: UserForm) => {
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...data, updatedAt: new Date().toISOString() }
            : u
        )
      );
    } else {
      const newUser: AdminUser = {
        id: Date.now().toString(),
        ...data,
        permissions: [],
        createdAt: new Date().toISOString(),
        active: true,
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return 'Super Admin';
      case AdminRole.DEPARTMENT_OFFICER:
        return 'Department Officer';
      case AdminRole.STATION_MANAGER:
        return 'Station Manager';
      default:
        return role;
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: <Badge variant="info">{getRoleLabel(user.role)}</Badge>,
    status: (
      <Badge variant={user.active ? 'success' : 'default'}>
        {user.active ? 'Active' : 'Suspended'}
      </Badge>
    ),
    createdAt: format(new Date(user.createdAt), 'MMM dd, yyyy'),
    actions: (
      <div className="flex gap-2">
        <button
          onClick={() => handleEdit(user)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => handleToggleActive(user.id)}
          className={user.active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
        >
          {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
        </button>
        <button
          onClick={() => handleDelete(user.id)}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User & Role Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage department officers and station managers</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingUser(null);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Create User
        </Button>
      </div>

      <Card>
        <DataTable columns={columns} data={tableData} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          reset();
        }}
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value={AdminRole.DEPARTMENT_OFFICER}>Department Officer</option>
              <option value={AdminRole.STATION_MANAGER}>Station Manager</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
