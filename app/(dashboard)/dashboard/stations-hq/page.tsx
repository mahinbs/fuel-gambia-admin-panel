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
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Station Management</h1>
          <p className="text-slate-500 font-medium mt-2">Manage all fuel station branches and operational status</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" strokeWidth={3} />
          Register New Station
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search stations or managers..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="h-10 px-4 font-black">Operational: 3</Badge>
          <Badge variant="warning" className="h-10 px-4 font-black">Maintenance: 1</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {stations.map((s) => (
          <Card key={s.id} className="p-0 overflow-hidden border-none shadow-xl group hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white tracking-tight">{s.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">ID: #{s.id}042</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <MoreVertical size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-500">
                    {s.manager.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Manager</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{s.manager}</p>
                  </div>
                </div>
                <Badge variant={s.status === 'OPERATIONAL' ? 'success' : 'warning'} size="sm" className="font-black">
                  {s.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                {user?.role !== AdminRole.SUPER_ADMIN && (
                  <div className="flex items-center gap-2">
                    <Fuel size={14} className="text-slate-400" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Stock</p>
                      <p className={cn("text-xs font-black", parseInt(s.stock) < 20 ? "text-rose-500" : "text-slate-700 dark:text-slate-300")}>{s.stock}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 {user?.role === AdminRole.SUPER_ADMIN ? 'col-span-2' : ''}">
                  <Users size={14} className="text-slate-400" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Staff</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{s.attendants} Attendants</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 text-xs font-black h-9 bg-white dark:bg-slate-900 shadow-sm gap-1"
                onClick={() => alert(`Viewing analytics for ${s.name}...`)}
              >
                <BarChart3 size={14} />
                Analytics
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-xs font-black h-9 text-blue-500 gap-1"
                onClick={() => alert(`Editing ${s.name} details...`)}
              >
                <Pencil size={14} />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Fuel Station"
        size="lg"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Station Name" placeholder="e.g. Brikama South" />
            <Input label="Station Code" placeholder="e.g. GFS-005" />
            <Input label="Station Manager" placeholder="Full Name" />
            <Input label="Manager Phone" placeholder="+220 7XX XXXX" />
            <Input label="Total Capacity (Liters)" type="number" placeholder="50000" />
            <Input label="GPS Coordinates" placeholder="13.4549° N, 16.5790° W" />
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Full Address</label>
              <textarea
                rows={2}
                placeholder="Station address, region, district..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Fuel Types</label>
              <div className="flex gap-3">
                <button type="button" className="flex-1 p-3 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-[10px] font-black uppercase text-blue-600">Petrol</button>
                <button type="button" className="flex-1 p-3 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-[10px] font-black uppercase text-blue-600">Diesel</button>
                <button type="button" className="flex-1 p-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:border-blue-600 transition-colors">LPG</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Initial Status</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                <option value="operational">Operational</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>
          <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
              New stations require government compliance verification before they can begin dispensing subsidized fuel.
            </p>
          </div>
          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsModalOpen(false)}>
              Register Station
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
