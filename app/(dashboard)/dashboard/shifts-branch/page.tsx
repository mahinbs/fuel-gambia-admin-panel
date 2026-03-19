'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Clock, Plus, CheckCircle2, Activity, Sun, Moon, Sunset } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ShiftsBranchPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeShifts = [
    { name: 'Ousman Bah', shift: 'Morning', time: '06:00–14:00', status: 'ACTIVE', pumped: '1,240 L' },
    { name: 'Fatima Jallow', shift: 'Morning', time: '06:00–14:00', status: 'ACTIVE', pumped: '980 L' },
    { name: 'Ebrima Sanneh', shift: 'Evening', time: '14:00–22:00', status: 'UPCOMING', pumped: '—' },
  ];

  const shiftSlots = [
    { label: 'Morning', icon: Sun, time: '06:00 – 14:00', color: 'amber', assigned: ['Ousman Bah', 'Fatima Jallow'] },
    { label: 'Evening', icon: Sunset, time: '14:00 – 22:00', color: 'blue', assigned: ['Ebrima Sanneh'] },
    { label: 'Night', icon: Moon, time: '22:00 – 06:00', color: 'purple', assigned: [] },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Shift Management</h1>
          <p className="text-slate-500 font-medium mt-2">Schedule and monitor all pump attendant shifts</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" strokeWidth={3} />
          Assign New Shift
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shiftSlots.map((slot) => (
          <Card key={slot.label} className="p-8 border-none shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className={cn(
              'p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform',
              slot.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
              slot.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
              'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
            )}>
              <slot.icon size={24} />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl">{slot.label} Shift</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{slot.time}</p>

            <div className="mt-6 space-y-2">
              {slot.assigned.length > 0 ? slot.assigned.map((name) => (
                <div key={name} className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  {name}
                </div>
              )) : (
                <p className="text-xs font-bold text-slate-400 italic">No staff assigned</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Badge variant={slot.assigned.length > 0 ? 'success' : 'warning'} size="sm" className="font-black">
                {slot.assigned.length} Assigned
              </Badge>
              <Button variant="ghost" size="sm" className="text-blue-500 font-black text-[10px] uppercase" onClick={() => setIsModalOpen(true)}>
                + Add
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Activity className="text-blue-600" size={22} />
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Today's Shift Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                {['Attendant', 'Shift', 'Hours', 'Fuel Dispensed', 'Status'].map((h) => (
                  <th key={h} className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeShifts.map((s, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-5 px-6 font-black text-slate-900 dark:text-white text-sm">{s.name}</td>
                  <td className="py-5 px-6 text-sm font-bold text-slate-500">{s.shift}</td>
                  <td className="py-5 px-6 text-sm font-bold text-slate-500">{s.time}</td>
                  <td className="py-5 px-6 font-black text-blue-600 dark:text-blue-400">{s.pumped}</td>
                  <td className="py-5 px-6">
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : 'info'} size="sm" className="font-black">
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Staff Shift" size="lg">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Staff Member</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                <option>Ousman Bah</option>
                <option>Fatima Jallow</option>
                <option>Ebrima Sanneh</option>
                <option>Musa Faal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Shift Slot</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                <option>Morning (06:00–14:00)</option>
                <option>Evening (14:00–22:00)</option>
                <option>Night (22:00–06:00)</option>
              </select>
            </div>
            <Input label="Start Date" type="date" />
            <Input label="End Date (optional)" type="date" />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsModalOpen(false)}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
