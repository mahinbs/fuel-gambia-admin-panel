'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Fuel, AlertTriangle, TrendingDown, BarChart3, Plus, Droplets, Package, RefreshCw, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatLiters } from '@/utils/format';
import { inventoryFunctions } from '@/supabase';
import { useAppSelector } from '@/store/hooks';

export default function InventoryBranchPage() {
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector((state: any) => state.auth || {});

  const [deliveryForm, setDeliveryForm] = useState({
    fuelType: 'PETROL' as 'PETROL' | 'DIESEL',
    orderedLiters: '',
    deliveredLiters: '',
    supplier: '',
    note: '',
  });

  const [adjustForm, setAdjustForm] = useState({
    fuelType: 'PETROL' as 'PETROL' | 'DIESEL',
    quantity: '',
  });

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await inventoryFunctions.getInventories();
      // Filter to current station if we have a stationId
      const filtered = user?.stationId ? result.filter((i: any) => i.stationId === user.stationId) : result;
      setInventory(filtered || result);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [user?.stationId]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.stationId) { setError('No station assigned to your account'); return; }
    setSubmitting(true);
    try {
      await inventoryFunctions.processDelivery({
        stationId: user.stationId,
        receivedBy: user.id,
        fuelType: deliveryForm.fuelType,
        orderedLiters: Number(deliveryForm.orderedLiters),
        deliveredLiters: Number(deliveryForm.deliveredLiters),
        supplierName: deliveryForm.supplier,
        deliveryNote: deliveryForm.note,
      });
      await loadInventory();
      setIsDeliveryModalOpen(false);
      setDeliveryForm({ fuelType: 'PETROL', orderedLiters: '', deliveredLiters: '', supplier: '', note: '' });
    } catch (err: any) {
      setError(err.message || 'Delivery processing failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.stationId) { setError('No station assigned'); return; }
    setSubmitting(true);
    try {
      await inventoryFunctions.updateStock(user.stationId, adjustForm.fuelType, Number(adjustForm.quantity));
      await loadInventory();
      setIsAdjustModalOpen(false);
      setAdjustForm({ fuelType: 'PETROL', quantity: '' });
    } catch (err: any) {
      setError(err.message || 'Stock adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregate from all stations or current station
  const totalPetrol = inventory.reduce((sum, i) => sum + Number(i.petrolStock || 0), 0);
  const totalDiesel = inventory.reduce((sum, i) => sum + Number(i.dieselStock || 0), 0);
  const lowStockCount = inventory.filter(i => Number(i.petrolStock) < Number(i.lowStockThreshold) || Number(i.dieselStock) < Number(i.lowStockThreshold)).length;

  const getStockPercent = (current: number, threshold: number) => {
    const capacity = threshold * 4; // estimate total capacity as 4x threshold
    return Math.min(100, Math.round((current / capacity) * 100));
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Inventory Control</h1>
          <p className="text-slate-500 font-medium mt-2">Live tank monitoring, delivery intake, and stock adjustment records</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={loadInventory} className="bg-white dark:bg-slate-900 font-black text-xs uppercase tracking-widest shadow-sm h-14 px-6 rounded-2xl">
            <RefreshCw size={18} className="mr-2" /> Refresh
          </Button>
          <Button variant="primary" size="lg" onClick={() => setIsDeliveryModalOpen(true)} className="shadow-blue-500/20 hover:shadow-xl transition-all h-14 px-6 rounded-2xl font-black text-xs uppercase tracking-widest">
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Process Delivery
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
          <AlertCircle className="text-rose-500 shrink-0" size={20} />
          <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 border-none shadow-2xl bg-blue-600 text-white relative overflow-hidden group rounded-[2rem]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Petrol</p>
            {loading ? <Loader2 className="animate-spin" size={24} /> : <h3 className="text-3xl font-black">{formatLiters(totalPetrol)}</h3>}
          </div>
          <Droplets className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
        </Card>
        <Card className="p-8 border-none shadow-2xl bg-emerald-600 text-white relative overflow-hidden group rounded-[2rem]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Diesel</p>
            {loading ? <Loader2 className="animate-spin" size={24} /> : <h3 className="text-3xl font-black">{formatLiters(totalDiesel)}</h3>}
          </div>
          <Fuel className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
        </Card>
        <Card className="p-8 border-none shadow-2xl bg-rose-600 text-white relative overflow-hidden group rounded-[2rem]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Low Stock Alerts</p>
            {loading ? <Loader2 className="animate-spin" size={24} /> : <h3 className="text-3xl font-black">{lowStockCount}</h3>}
          </div>
          <AlertTriangle className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-blue-500" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {inventory.map((station: any) => {
            const petrolPct = getStockPercent(station.petrolStock, station.lowStockThreshold);
            const dieselPct = getStockPercent(station.dieselStock, station.lowStockThreshold);
            const isLow = station.petrolStock < station.lowStockThreshold || station.dieselStock < station.lowStockThreshold;

            return (
              <Card key={station.stationId} className="p-8 border-none shadow-2xl overflow-hidden rounded-[2rem]">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl",
                      isLow ? "bg-rose-500" : "bg-blue-600"
                    )}>
                      <Fuel size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{station.stationName}</h3>
                      {station.lastUpdated && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          Updated {new Date(station.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {isLow && (
                    <Badge variant="error" className="font-black text-[9px] uppercase tracking-widest flex items-center gap-1">
                      <AlertTriangle size={12} /> LOW STOCK
                    </Badge>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Petrol */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Petrol (PMS)</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{formatLiters(station.petrolStock)}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn("h-full rounded-full transition-all", petrolPct < 25 ? "bg-rose-500" : "bg-blue-600")}
                        style={{ width: `${petrolPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Petrol Level</span>
                      <span>{petrolPct}%</span>
                    </div>
                  </div>

                  {/* Diesel */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diesel (AGO)</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{formatLiters(station.dieselStock)}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn("h-full rounded-full transition-all", dieselPct < 25 ? "bg-rose-500" : "bg-emerald-500")}
                        style={{ width: `${dieselPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Diesel Level</span>
                      <span>{dieselPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1 font-black text-[10px] uppercase tracking-widest gap-1" onClick={() => setIsAdjustModalOpen(true)}>
                    <BarChart3 size={14} /> Adjust Stock
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1 font-black text-[10px] uppercase tracking-widest gap-1 shadow-blue-500/20" onClick={() => setIsDeliveryModalOpen(true)}>
                    <Package size={14} /> Log Delivery
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delivery Modal */}
      <Modal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)} title="Process Fuel Delivery" size="lg">
        <form className="space-y-6" onSubmit={handleDelivery}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fuel Type</label>
              <select
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                value={deliveryForm.fuelType}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, fuelType: e.target.value as 'PETROL' | 'DIESEL' })}
              >
                <option value="PETROL">Petrol (PMS)</option>
                <option value="DIESEL">Diesel (AGO)</option>
              </select>
            </div>
            <Input label="Ordered Volume (L)" type="number" placeholder="50000" value={deliveryForm.orderedLiters} onChange={(e) => setDeliveryForm({ ...deliveryForm, orderedLiters: e.target.value })} required />
            <Input label="Delivered Volume (L)" type="number" placeholder="50000" value={deliveryForm.deliveredLiters} onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveredLiters: e.target.value })} required />
            <Input label="Supplier Name" placeholder="e.g. GambPetro Ltd" value={deliveryForm.supplier} onChange={(e) => setDeliveryForm({ ...deliveryForm, supplier: e.target.value })} />
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Note</label>
              <textarea rows={2} value={deliveryForm.note} onChange={(e) => setDeliveryForm({ ...deliveryForm, note: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none resize-none" placeholder="Optional delivery notes..." />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <Button variant="outline" type="button" className="flex-1 py-4 font-black" onClick={() => setIsDeliveryModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting} className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black">
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {submitting ? 'Processing...' : 'Confirm Delivery'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Manual Stock Adjustment" size="md">
        <form className="space-y-6" onSubmit={handleAdjust}>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fuel Type</label>
            <select
              className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none"
              value={adjustForm.fuelType}
              onChange={(e) => setAdjustForm({ ...adjustForm, fuelType: e.target.value as 'PETROL' | 'DIESEL' })}
            >
              <option value="PETROL">Petrol (PMS)</option>
              <option value="DIESEL">Diesel (AGO)</option>
            </select>
          </div>
          <Input label="New Stock Quantity (L)" type="number" placeholder="e.g. 45000" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} required />
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">This will override the current stock level. Only use for physical stock reconciliation.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" type="button" className="flex-1 py-4 font-black" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting} className="flex-1 py-4 shadow-xl shadow-amber-500/20 bg-amber-600 border-amber-600 hover:bg-amber-700 font-black">
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {submitting ? 'Adjusting...' : 'Confirm Adjustment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
