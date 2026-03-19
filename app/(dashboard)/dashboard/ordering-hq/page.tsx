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

export default function OrderingHQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const orders = [
    { id: '1', date: '2026-03-15', petrol: 10000, diesel: 5000, status: 'DELIVERED', total: 'GMD 450,000' },
    { id: '2', date: '2026-03-16', petrol: 15000, diesel: 10000, status: 'IN_TRANSIT', total: 'GMD 725,000' },
    { id: '3', date: '2026-03-14', petrol: 5000, diesel: 5000, status: 'DELIVERED', total: 'GMD 310,000' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Fuel Bulk Ordering</h1>
          <p className="text-slate-500 font-medium mt-2">Manage and track high-volume fuel procurement</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" />
          Create Bulk Order
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <Package size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">New Batch Order</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Procurement Details</p>
            </div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Petrol Quantity (Liters)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300" 
                  placeholder="0.00" 
                />
                <Droplets className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={24} />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Diesel Quantity (Liters)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300" 
                  placeholder="0.00" 
                />
                <Droplets className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={24} />
              </div>
            </div>
            <div className="md:col-span-2 pt-4">
              <Button type="submit" variant="primary" className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-blue-500/20 group">
                Initiate Procurement Flow
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white relative overflow-hidden group">
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform">
                <Truck size={32} strokeWidth={2.5} className="text-blue-400" />
              </div>
              <Badge variant="info" className="bg-blue-500/20 text-blue-400 border-none">1 Active</Badge>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight leading-none">In Transit</h3>
              <p className="text-blue-400/60 text-xs font-black uppercase tracking-widest">Current Batch Status</p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-400">Est. Delivery</span>
                <span>Tomorrow, 10:00 AM</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[65%] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              </div>
              <p className="text-[10px] text-center font-bold text-slate-500 uppercase tracking-widest">Batch reaching Banjul Distribution Center</p>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-48 h-48 text-blue-500/10 -rotate-12 translate-x-12 -translate-y-12 pointer-events-none group-hover:scale-110 transition-transform">
             <Truck size={192} />
          </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-2xl space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <History size={24} className="text-slate-400" />
            Procurement History
          </h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Order Reference</TableHeader>
                <TableHeader>Submission Date</TableHeader>
                <TableHeader>Fuel Volume (L)</TableHeader>
                <TableHeader>Procurement Total</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-black text-slate-900 dark:text-white">ORD-{o.id}B-2026</TableCell>
                  <TableCell className="text-slate-500 font-bold">{o.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Petrol</span>
                        <span className="font-bold">{formatLiters(o.petrol)}</span>
                      </div>
                      <div className="w-px h-6 bg-slate-100 dark:bg-slate-800" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diesel</span>
                        <span className="font-bold">{formatLiters(o.diesel)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-blue-600">{o.total}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={o.status === 'DELIVERED' ? 'success' : 'info'} 
                      size="sm"
                      className="font-black"
                    >
                      {o.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-500/5">
                      Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initiate Bulk Procurement"
        size="lg"
      >
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Input label="Petrol Volume (L)" type="number" placeholder="5000" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current HQ Stock: 14,200L</p>
            </div>
            <div className="space-y-4">
              <Input label="Diesel Volume (L)" type="number" placeholder="3000" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current HQ Stock: 8,450L</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribution Center</label>
            <select className="w-full h-14 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-black focus:outline-none appearance-none">
              <option>Banjul Main Depot</option>
              <option>Serrekunda South Hub</option>
              <option>Basse East Terminal</option>
            </select>
          </div>

          <div className="p-6 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl border border-blue-100/50 dark:border-blue-500/10 flex gap-4">
            <Info className="text-blue-600 shrink-0" size={24} />
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
              Bulk orders are processed within 24 hours. Inventory will be updated automatically across the HQ dashboard upon carrier dispatch.
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
              Discard
            </Button>
            <Button variant="primary" className="flex-1 py-4 rounded-xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
              Confirm Procurement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
