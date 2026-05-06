'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { AdminRole } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search, MapPin, Plus, MoreVertical, Fuel, Users, BarChart3, Pencil, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';

export default function StationsHQPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stations = [
    { id: '1', name: 'Banjul Central', manager: 'Abdou Bah', status: 'OPERATIONAL', stock: '92%', attendants: 8 },
    { id: '2', name: 'Serrekunda East', manager: 'Musa Jobe', status: 'OPERATIONAL', stock: '45%', attendants: 12 },
    { id: '3', name: 'Bakau Metro', manager: 'Ebrima Diallo', status: 'MAINTENANCE', stock: '12%', attendants: 5 },
    { id: '4', name: 'Lamin Station', manager: 'Omar Sarr', status: 'OPERATIONAL', stock: '78%', attendants: 6 },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_HQ}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Retail Network</h1>
            <p className="text-slate-500 font-medium mt-2">Manage all fuel station branches, localized inventory, and personnel across the network</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Provision Station
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Filter stations or managers..."
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-4">
            <Badge variant="success" className="h-12 px-6 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm">Operational: 3</Badge>
            <Badge variant="warning" className="h-12 px-6 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm">Maintenance: 1</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {stations.map((s) => (
            <Card key={s.id} className="p-0 overflow-hidden border-none shadow-2xl group hover:shadow-3xl transition-all hover:translate-y-[-4px] bg-white dark:bg-slate-900 rounded-[2rem]">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <MapPin size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-lg leading-tight">{s.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Terminal #{s.id}042</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <MoreVertical size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 border border-slate-200 dark:border-slate-700">
                      {s.manager.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Supervisor</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">{s.manager}</p>
                    </div>
                  </div>
                  <Badge variant={s.status === 'OPERATIONAL' ? 'success' : 'warning'} className="font-black text-[9px] uppercase tracking-widest px-2 py-1">
                    {s.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col gap-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Bulk Stock</p>
                    <div className="flex items-center gap-1.5">
                      <Fuel size={14} className={cn(parseInt(s.stock) < 20 ? "text-rose-500" : "text-blue-500")} />
                      <p className={cn("text-sm font-black tracking-tighter", parseInt(s.stock) < 20 ? "text-rose-500" : "text-slate-900 dark:text-white")}>{s.stock}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Staff</p>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-indigo-500" />
                      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">{s.attendants}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 text-[10px] font-black h-11 bg-white dark:bg-slate-900 shadow-sm gap-2 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  onClick={() => alert(`Viewing analytics for ${s.name}...`)}
                >
                  <BarChart3 size={16} strokeWidth={2.5} />
                  Metrics
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-[10px] font-black h-11 text-blue-600 gap-2 uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl"
                  onClick={() => alert(`Editing ${s.name} details...`)}
                >
                  <Pencil size={16} strokeWidth={2.5} />
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Terminal Registration"
          size="lg"
        >
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Station Identity" placeholder="e.g. Brikama South" className="h-14 rounded-2xl font-bold" />
              <Input label="Terminal Identifier" placeholder="e.g. GFS-005" className="h-14 rounded-2xl font-bold" />
              <Input label="Site Supervisor" placeholder="Full Name" className="h-14 rounded-2xl font-bold" />
              <Input label="Direct Hotline" placeholder="+220 7XX XXXX" className="h-14 rounded-2xl font-bold" />
              <Input label="Storage Capacity (L)" type="number" placeholder="50000" className="h-14 rounded-2xl font-bold" />
              <Input label="Geolocation" placeholder="13.4549° N, 16.5790° W" className="h-14 rounded-2xl font-bold" />
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Address</label>
                <textarea
                  rows={2}
                  placeholder="Street address, region, district..."
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Asset Types</label>
                <div className="flex gap-3">
                  <button type="button" className="flex-1 h-12 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Petrol</button>
                  <button type="button" className="flex-1 h-12 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Diesel</button>
                  <button type="button" className="flex-1 h-12 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-600 transition-colors">LPG</button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Deployment Status</label>
                <select className="w-full h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none">
                  <option value="operational">Operational</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-amber-500/5 rounded-[2rem] border border-amber-100 dark:border-amber-500/10 flex gap-4">
              <AlertCircle className="text-amber-600 shrink-0" size={24} strokeWidth={2.5} />
              <p className="text-[10px] font-black text-amber-800/70 dark:text-amber-400/70 leading-relaxed uppercase tracking-wider">
                Authorized registration is subject to executive compliance verification before active dispensing protocols can be initiated.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>Discard</Button>
              <Button variant="primary" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
                Confirm Registration
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
