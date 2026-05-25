"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShoppingCart, Plus, Truck, Droplets, ArrowRight, Package, Info, Loader2, AlertCircle } from 'lucide-react';
import { formatLiters } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { stationOrderFunctions, stationFunctions } from '@/supabase';

export default function OrderingHQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    stationId: '',
    fuelType: 'PETROL' as 'PETROL' | 'DIESEL',
    liters: '',
    unitPrice: '',
    supplier: '',
    expectedDate: '',
  });

  const [quickPetrol, setQuickPetrol] = useState('');
  const [quickDiesel, setQuickDiesel] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await stationOrderFunctions.getOrders({});
      setOrders(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStations = useCallback(async () => {
    try {
      const result = await stationFunctions.getStations({});
      setStations(result.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadOrders();
    loadStations();
  }, [loadOrders, loadStations]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await stationOrderFunctions.createOrder({
        stationId: formData.stationId,
        fuelType: formData.fuelType,
        orderedLiters: Number(formData.liters),
        unitPrice: Number(formData.unitPrice),
        supplierName: formData.supplier,
        expectedDeliveryDate: formData.expectedDate,
      });
      await loadOrders();
      setIsModalOpen(false);
      setFormData({ stationId: '', fuelType: 'PETROL', liters: '', unitPrice: '', supplier: '', expectedDate: '' });
    } catch (err: any) {
      setError(err.message || 'Order creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickOrder = async () => {
    if (!quickPetrol && !quickDiesel) return;
    const defaultStation = stations[0];
    if (!defaultStation) return alert('No stations available');

    setSubmitting(true);
    try {
      const promises = [];
      if (quickPetrol) {
        promises.push(stationOrderFunctions.createOrder({
          stationId: defaultStation.id,
          fuelType: 'PETROL',
          orderedLiters: Number(quickPetrol),
          unitPrice: 25,
          supplierName: 'National Supply Corp',
        }));
      }
      if (quickDiesel) {
        promises.push(stationOrderFunctions.createOrder({
          stationId: defaultStation.id,
          fuelType: 'DIESEL',
          orderedLiters: Number(quickDiesel),
          unitPrice: 27,
          supplierName: 'National Supply Corp',
        }));
      }
      await Promise.all(promises);
      await loadOrders();
      setQuickPetrol('');
      setQuickDiesel('');
      alert('Procurement initiated successfully');
    } catch (err: any) {
      setError(err.message || 'Quick order failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inTransitCount = orders.filter(o => o.status === 'IN_TRANSIT').length;

  const columns = [
    {
      key: 'id',
      label: 'Order Reference',
      render: (val: string) => <span className="font-black text-slate-900 dark:text-white tracking-tight">ORD-{val?.slice(0, 8).toUpperCase()}</span>,
    },
    {
      key: 'created_at',
      label: 'Submission Date',
      render: (val: string) => <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{val ? new Date(val).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'fuel_type',
      label: 'Fuel Type & Volume',
      render: (val: string, item: any) => (
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none opacity-60">{val}</span>
            <span className="font-black text-slate-900 dark:text-white tracking-tighter">{formatLiters(Number(item.ordered_liters))}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'station',
      label: 'Station',
      render: (val: any) => <span className="font-bold text-slate-500 text-xs">{val?.name || 'Unknown'}</span>,
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      render: (val: number, item: any) => (
        <span className="font-black text-blue-600 dark:text-blue-400 tracking-tighter text-base">
          D {(Number(val) * Number(item.ordered_liters)).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => (
        <Badge
          variant={val === 'DELIVERED' ? 'success' : val === 'IN_TRANSIT' ? 'info' : 'warning'}
          className="font-black text-[9px] uppercase tracking-widest px-3 py-1.5"
        >
          {(val || 'PENDING').replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Control',
      render: (_: any, item: any) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-10 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95"
          onClick={() => stationOrderFunctions.updateOrderStatus(item.id, 'DELIVERED').then(loadOrders)}
        >
          Mark Delivered
        </Button>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_HQ}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Bulk Procurement</h1>
            <p className="text-slate-500 font-medium mt-2">Executive oversight for high-volume fuel acquisition and supply chain status</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px]"
          >
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Create Bulk Order
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <AlertCircle className="text-rose-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="lg:col-span-2 p-10 border-none shadow-2xl space-y-10 bg-white dark:bg-slate-900 rounded-[2.5rem]">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Package size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Fast Procurement</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 opacity-60">Express Batch Submission</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Petrol Volume (L)</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={quickPetrol}
                    onChange={(e) => setQuickPetrol(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-7 py-5 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-200 shadow-inner appearance-none"
                    placeholder="0.00"
                  />
                  <Droplets className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-blue-500 transition-colors" size={28} strokeWidth={2.5} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Diesel Volume (L)</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={quickDiesel}
                    onChange={(e) => setQuickDiesel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-7 py-5 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-200 shadow-inner appearance-none"
                    placeholder="0.00"
                  />
                  <Droplets className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-blue-500 transition-colors" size={28} strokeWidth={2.5} />
                </div>
              </div>
              <div className="md:col-span-2 pt-4">
                <Button
                  type="button"
                  variant="primary"
                  disabled={submitting}
                  onClick={handleQuickOrder}
                  className="w-full h-20 rounded-[1.5rem] text-base font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 group hover:shadow-2xl active:scale-[0.98] transition-all"
                >
                  {submitting ? <Loader2 className="animate-spin mr-3" size={22} /> : null}
                  Initiate Global Procurement
                  <ArrowRight size={22} className="ml-3 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-10 border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden group rounded-[2.5rem] flex flex-col justify-between">
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                  <Truck size={32} strokeWidth={2.5} className="text-blue-400" />
                </div>
                <Badge className="bg-blue-500 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border-none shadow-lg shadow-blue-500/20">
                  {inTransitCount} In Transit
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="text-4xl font-black tracking-tighter leading-none">Supply Chain</h3>
                <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-80">Current Protocol Status</p>
              </div>

              <div className="space-y-8 pt-4">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-400">Orders This Month</span>
                  <span className="text-blue-400">{loading ? '...' : orders.length} Orders</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                  <div
                    className="h-full bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] relative overflow-hidden"
                    style={{ width: `${Math.min(100, (inTransitCount / Math.max(1, orders.length)) * 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <p className="text-[9px] text-center font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    {inTransitCount > 0 ? `${inTransitCount} active delivery pipeline(s)` : 'No active deliveries'}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -top-12 -right-12 w-64 h-64 text-blue-500 opacity-5 pointer-events-none group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-1000">
              <Truck size={256} />
            </div>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <Card className="p-0 border-none shadow-2xl bg-transparent">
            <DataTable
              columns={columns}
              data={orders}
              searchable
              searchPlaceholder="Filter procurement history by reference..."
            />
          </Card>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Executive Bulk Procurement" size="lg">
          <form className="space-y-10" onSubmit={handleCreateOrder}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Station</label>
                <select
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none appearance-none shadow-inner"
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                  required
                >
                  <option value="">Select Station</option>
                  {stations.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fuel Type</label>
                <select
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none appearance-none shadow-inner"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as 'PETROL' | 'DIESEL' })}
                  required
                >
                  <option value="PETROL">Petrol (PMS)</option>
                  <option value="DIESEL">Diesel (AGO)</option>
                </select>
              </div>
              <Input
                label="Volume (L)"
                type="number"
                placeholder="5000"
                className="h-14 rounded-2xl font-bold"
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                required
              />
              <Input
                label="Unit Price (GMD/L)"
                type="number"
                placeholder="25"
                className="h-14 rounded-2xl font-bold"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                required
              />
              <Input
                label="Supplier Name"
                placeholder="e.g. National Supply Corp"
                className="h-14 rounded-2xl font-bold"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
              <Input
                label="Expected Delivery Date"
                type="date"
                className="h-14 rounded-2xl font-bold"
                value={formData.expectedDate}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
              />
            </div>

            <div className="p-8 bg-blue-50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100 dark:border-blue-500/10 flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-100 dark:border-blue-900/20">
                <Info size={28} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-bold text-blue-700/70 dark:text-blue-400/70 leading-relaxed uppercase tracking-wider">
                Bulk procurement orders are prioritized for processing within 24 operational hours. Real-time inventory synchronization across the executive dashboard will initiate upon verified carrier dispatch.
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
                Discard Order
              </Button>
              <Button variant="primary" type="submit" disabled={submitting} className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
                {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {submitting ? 'Authorizing...' : 'Authorize Procurement'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
