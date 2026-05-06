"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { ShoppingCart, Plus, History, Truck, Droplets, ArrowRight, Package, Search, Info } from 'lucide-react';
import { formatLiters } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { DataTable } from '@/components/ui/DataTable';

export default function OrderingHQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const orders = [
    { id: '1', date: '2026-03-15', petrol: 10000, diesel: 5000, status: 'DELIVERED', total: 'GMD 450,000' },
    { id: '2', date: '2026-03-16', petrol: 15000, diesel: 10000, status: 'IN_TRANSIT', total: 'GMD 725,000' },
    { id: '3', date: '2026-03-14', petrol: 5000, diesel: 5000, status: 'DELIVERED', total: 'GMD 310,000' },
  ];

  const columns = [
    {
      key: 'id',
      label: 'Order Reference',
      render: (val: string) => <span className="font-black text-slate-900 dark:text-white tracking-tight">ORD-{val}B-2026</span>,
    },
    {
      key: 'date',
      label: 'Submission Date',
      render: (val: string) => <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{val}</span>,
    },
    {
      key: 'volumes',
      label: 'Fuel Volume (L)',
      render: (_: any, item: any) => (
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none opacity-60">Petrol</span>
            <span className="font-black text-slate-900 dark:text-white tracking-tighter">{formatLiters(item.petrol)}</span>
          </div>
          <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none opacity-60">Diesel</span>
            <span className="font-black text-slate-900 dark:text-white tracking-tighter">{formatLiters(item.diesel)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Procurement Total',
      render: (val: string) => <span className="font-black text-blue-600 dark:text-blue-400 tracking-tighter text-base">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => (
        <Badge 
          variant={val === 'DELIVERED' ? 'success' : 'info'} 
          className="font-black text-[9px] uppercase tracking-widest px-3 py-1.5"
        >
          {val.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Control',
      render: () => (
        <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95">
          Invoice
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

            <form className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Petrol Volume (L)</label>
                <div className="relative group">
                  <input 
                    type="number" 
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-7 py-5 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-200 shadow-inner appearance-none" 
                    placeholder="0.00" 
                  />
                  <Droplets className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-blue-500 transition-colors" size={28} strokeWidth={2.5} />
                </div>
              </div>
              <div className="md:col-span-2 pt-4">
                <Button type="submit" variant="primary" className="w-full h-20 rounded-[1.5rem] text-base font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 group hover:shadow-2xl active:scale-[0.98] transition-all">
                  Initiate Global Procurement
                  <ArrowRight size={22} className="ml-3 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-10 border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden group rounded-[2.5rem] flex flex-col justify-between">
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                  <Truck size={32} strokeWidth={2.5} className="text-blue-400" />
                </div>
                <Badge className="bg-blue-500 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border-none shadow-lg shadow-blue-500/20">1 Active Supply</Badge>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-4xl font-black tracking-tighter leading-none">In Transit</h3>
                <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-80">Current Supply Protocol</p>
              </div>

              <div className="space-y-8 pt-4">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-400">Est. Terminal Arrival</span>
                  <span className="text-blue-400">T+ 14:00:00</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                   <p className="text-[9px] text-center font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                     Carrier: Banjul Logistics Group<br/>
                     Status: Approaching Distribution Hub
                   </p>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-12 -right-12 w-64 h-64 text-blue-500 opacity-5 pointer-events-none group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-1000">
               <Truck size={256} />
            </div>
          </Card>
        </div>

        <Card className="p-0 border-none shadow-2xl bg-transparent">
          <DataTable
            columns={columns}
            data={orders}
            searchable
            searchPlaceholder="Filter procurement history by reference..."
          />
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Executive Bulk Procurement"
          size="lg"
        >
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Input label="Petrol Volume (L)" type="number" placeholder="5000" className="h-14 rounded-2xl font-bold" />
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current HQ Stock: 14,200L</p>
                </div>
              </div>
              <div className="space-y-4">
                <Input label="Diesel Volume (L)" type="number" placeholder="3000" className="h-14 rounded-2xl font-bold" />
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current HQ Stock: 8,450L</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Distribution Terminal</label>
              <select className="w-full h-14 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none appearance-none shadow-inner">
                <option>Banjul Main Depot (Zone A)</option>
                <option>Serrekunda South Hub (Zone B)</option>
                <option>Basse East Terminal (Zone C)</option>
              </select>
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
              <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
                Discard Order
              </Button>
              <Button variant="primary" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
                Authorize Procurement
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
