'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStations, fetchStationById } from '@/store/slices/stationsSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Eye, MapPin, AlertTriangle } from 'lucide-react';
import { formatLiters, formatDate } from '@/utils/format';
import Link from 'next/link';

export default function StationsPage() {
  const dispatch = useAppDispatch();
  const { stations, total, loading } = useAppSelector((state) => state.stations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchStations({
        page: currentPage,
        search,
        status: statusFilter || undefined,
      })
    );
  }, [dispatch, currentPage, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'error' | 'warning'> = {
      ACTIVE: 'success',
      INACTIVE: 'error',
      MAINTENANCE: 'warning',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const isLowStock = (petrol: number, diesel: number, threshold: number) => {
    return petrol < threshold || diesel < threshold;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage fuel stations</p>
        </div>
        <Button variant="primary">Add Station</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search stations..."
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
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
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
                  <TableHeader>Location</TableHeader>
                  <TableHeader>Manager</TableHeader>
                  <TableHeader>Petrol Stock</TableHeader>
                  <TableHeader>Diesel Stock</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Last Sync</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {stations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isLowStock(station.petrolStock, station.dieselStock, station.lowStockThreshold) && (
                          <AlertTriangle className="text-yellow-500" size={16} />
                        )}
                        {station.name}
                      </div>
                    </TableCell>
                    <TableCell>{station.location}</TableCell>
                    <TableCell>{station.managerName || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {formatLiters(station.petrolStock)}
                        {station.petrolStock < station.lowStockThreshold && (
                          <Badge variant="warning" size="sm">Low</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {formatLiters(station.dieselStock)}
                        {station.dieselStock < station.lowStockThreshold && (
                          <Badge variant="warning" size="sm">Low</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(station.status)}</TableCell>
                    <TableCell>
                      {station.lastSync ? formatDate(station.lastSync) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/stations/${station.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye size={16} />
                        </Button>
                      </Link>
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
