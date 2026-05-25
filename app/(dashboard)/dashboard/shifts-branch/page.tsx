'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Clock, Plus, CheckCircle2, Activity, Sun, Moon, Sunset, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { shiftFunctions, attendantFunctions, stationFunctions } from '@/supabase';
import { useAppSelector } from '@/store/hooks';

export default function ShiftsBranchPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAppSelector((state: any) => state.auth || {});

  const [shifts, setShifts] = useState<any[]>([]);
  const [attendants, setAttendants] = useState<any[]>([]);
  const [pumps, setPumps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    attendantId: '',
    shiftType: 'MORNING' as 'MORNING' | 'AFTERNOON' | 'NIGHT',
    pumpId: '',
    shiftDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadData = useCallback(async () => {
    if (!user?.stationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [shiftsData, attendantsData, stationDetails] = await Promise.all([
        shiftFunctions.getShifts({ stationId: user.stationId }),
        attendantFunctions.getAttendants({ stationId: user.stationId }),
        stationFunctions.getStationById(user.stationId)
      ]);

      const rawAttendants = attendantsData?.data || [];
      setShifts(shiftsData || []);
      setAttendants(rawAttendants);
      setPumps(stationDetails?.pumps || []);

      // Autofill default ids if available
      if (rawAttendants.length > 0) {
        setFormData(prev => ({ ...prev, attendantId: rawAttendants[0].id }));
      }
      if (stationDetails?.pumps && stationDetails.pumps.length > 0) {
        setFormData(prev => ({ ...prev, pumpId: stationDetails.pumps[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load shifts details');
    } finally {
      setLoading(false);
    }
  }, [user?.stationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.attendantId || !formData.pumpId) {
      alert('Please select an attendant and a pump.');
      return;
    }
    setSubmitting(true);
    try {
      // Find or create open shift for the selected date and type
      let shift = shifts.find(
        s => s.shift_date === formData.shiftDate && s.shift_type === formData.shiftType && s.status === 'OPEN'
      );
      if (!shift) {
        shift = await shiftFunctions.createShift({
          stationId: user.stationId,
          shiftDate: formData.shiftDate,
          shiftType: formData.shiftType,
          createdBy: user.id,
          notes: formData.notes || undefined
        });
      }

      await shiftFunctions.assignPump({
        shiftId: shift.id,
        pumpId: formData.pumpId,
        attendantId: formData.attendantId,
        assignedBy: user.id
      });

      await loadData();
      setIsModalOpen(false);
      setFormData({
        attendantId: attendants[0]?.id || '',
        shiftType: 'MORNING',
        pumpId: pumps[0]?.id || '',
        shiftDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to assign shift');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayShifts = shifts.filter(s => s.shift_date === todayStr);

  const getAssignedNames = (type: 'MORNING' | 'AFTERNOON' | 'NIGHT') => {
    const shift = todayShifts.find(s => s.shift_type === type);
    if (!shift || !shift.pump_assignments) return [];
    return shift.pump_assignments.map((pa: any) => pa.attendant?.profiles?.name || 'Attendant');
  };

  const shiftSlots = [
    { label: 'Morning', type: 'MORNING' as const, icon: Sun, time: '06:00 – 14:00', color: 'amber', assigned: getAssignedNames('MORNING') },
    { label: 'Evening', type: 'AFTERNOON' as const, icon: Sunset, time: '14:00 – 22:00', color: 'blue', assigned: getAssignedNames('AFTERNOON') },
    { label: 'Night', type: 'NIGHT' as const, icon: Moon, time: '22:00 – 06:00', color: 'purple', assigned: getAssignedNames('NIGHT') },
  ];

  const activeAssignments = todayShifts.flatMap(s => 
    (s.pump_assignments || []).map((pa: any) => ({
      name: pa.attendant?.profiles?.name || pa.attendant?.id || 'Attendant',
      shift: s.shift_type,
      time: s.shift_type === 'MORNING' ? '06:00–14:00' : s.shift_type === 'AFTERNOON' ? '14:00–22:00' : '22:00–06:00',
      status: s.status === 'OPEN' ? 'ACTIVE' : 'CLOSED',
      pumpLabel: pa.pump?.pump_label || 'Pump',
      fuelType: pa.pump?.fuel_type || 'ALL',
      id: pa.id
    }))
  );

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_BRANCH}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Shift Management</h1>
            <p className="text-slate-500 font-medium mt-2">Schedule and monitor all pump attendant shifts</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={loadData} disabled={loading}>
              <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
              Refresh
            </Button>
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
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <AlertCircle className="text-rose-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shiftSlots.map((slot) => (
                <Card key={slot.label} className="p-8 border-none shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden bg-white dark:bg-slate-900">
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
                    {slot.assigned.length > 0 ? slot.assigned.map((name: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
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
                    <Button variant="ghost" size="sm" className="text-blue-500 font-black text-[10px] uppercase" onClick={() => {
                      setFormData(prev => ({ ...prev, shiftType: slot.type }));
                      setIsModalOpen(true);
                    }}>
                      + Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Activity className="text-blue-600" size={22} />
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Today's Shift Overview</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr>
                      {['Attendant', 'Shift', 'Hours', 'Assigned Pump', 'Status'].map((h) => (
                        <th key={h} className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeAssignments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm font-bold text-slate-400">No shifts scheduled for today</td>
                      </tr>
                    ) : (
                      activeAssignments.map((s, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-5 px-6 font-black text-slate-900 dark:text-white text-sm">{s.name}</td>
                          <td className="py-5 px-6 text-sm font-bold text-slate-500 uppercase">{s.shift}</td>
                          <td className="py-5 px-6 text-sm font-bold text-slate-500">{s.time}</td>
                          <td className="py-5 px-6 font-black text-blue-600 dark:text-blue-400">{s.pumpLabel} ({s.fuelType})</td>
                          <td className="py-5 px-6">
                            <Badge variant={s.status === 'ACTIVE' ? 'success' : 'info'} size="sm" className="font-black">
                              {s.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Staff Shift" size="lg">
          <form onSubmit={handleAssign} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Staff Member</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  value={formData.attendantId}
                  onChange={(e) => setFormData({ ...formData, attendantId: e.target.value })}
                  required
                >
                  {attendants.length === 0 ? (
                    <option value="">No attendants available</option>
                  ) : (
                    attendants.map((a: any) => (
                      <option key={a.id} value={a.id}>{a.profile?.name || a.id}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Shift Slot</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as any })}
                  required
                >
                  <option value="MORNING">Morning (06:00–14:00)</option>
                  <option value="AFTERNOON">Evening (14:00–22:00)</option>
                  <option value="NIGHT">Night (22:00–06:00)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Station Pump</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  value={formData.pumpId}
                  onChange={(e) => setFormData({ ...formData, pumpId: e.target.value })}
                  required
                >
                  {pumps.length === 0 ? (
                    <option value="">No pumps available</option>
                  ) : (
                    pumps.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.pump_label} ({p.fuel_type})</option>
                    ))
                  )}
                </select>
              </div>
              <Input 
                label="Shift Date" 
                type="date" 
                value={formData.shiftDate}
                onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                required
              />
              <div className="md:col-span-2">
                <Input 
                  label="Notes" 
                  placeholder="Additional instructions..." 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 py-4" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin mr-2 inline" size={18} /> : null}
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
