'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Palette, Upload, Save, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function SettingsSuperAdminPage() {
  const [primaryColor, setPrimaryColor] = useState('#0a192f'); // Light navy blue
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ProtectedRoute requiredRole={[AdminRole.SUPER_ADMIN, AdminRole.GOVERNMENT_ADMIN, AdminRole.STATION_HQ, AdminRole.STATION_BRANCH]}>
      <div className="space-y-10 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Configuration</h1>
          <p className="text-slate-500 font-medium mt-2">Manage global settings, security protocols, and white-labeling assets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Brand Identity */}
          <Card className="p-10 border-none shadow-2xl space-y-10">
            <div className="flex items-center gap-5">
              <div className="bg-blue-600/10 p-4 rounded-2xl text-blue-600 shadow-sm">
                <Palette size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Visual Identity</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Theme Colors & Styles</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Application Display Name</label>
                  <Input 
                    placeholder="e.g. Fuel Gambia"
                    className="h-14 rounded-2xl font-black uppercase text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary Brand HEX</label>
                  <div className="flex items-center gap-6">
                    <div 
                      className="w-20 h-20 rounded-[1.5rem] shadow-2xl border-4 border-white dark:border-slate-800 shrink-0 transition-transform hover:scale-105"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="flex-1">
                      <Input 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#000000"
                        className="h-14 rounded-2xl font-black tracking-widest uppercase text-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presets</p>
                <div className="flex gap-3">
                  {['#0a192f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                    <button 
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all hover:scale-125 active:scale-95 shadow-lg",
                        primaryColor === color ? "ring-4 ring-blue-500/20 scale-110" : ""
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Logo Management */}
          <Card className="p-10 border-none shadow-2xl space-y-10">
            <div className="flex items-center gap-5">
              <div className="bg-purple-600/10 p-4 rounded-2xl text-purple-600 shadow-sm">
                <Upload size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Asset Management</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Logo & Static Media</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 bg-slate-50/50 dark:bg-slate-900/50 group hover:border-blue-500/50 transition-all cursor-pointer">
                {logoPreview ? (
                  <div className="relative group/preview">
                    <img src={logoPreview} alt="Logo" className="h-24 object-contain mb-4 transition-transform group-hover/preview:scale-105" />
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <Save size={20} className="text-blue-600" />
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all mb-4 shadow-sm">
                    <ImageIcon size={40} strokeWidth={1.5} />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Synchronize Brand Asset</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">High Resolution SVG or PNG</p>
                </div>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleLogoUpload}
                  accept="image/*"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="px-12 h-18 rounded-[1.5rem] shadow-2xl shadow-blue-500/30 font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                Synchronizing...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-3">
                <CheckCircle2 size={22} strokeWidth={3} />
                Prefs Saved
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Save size={22} strokeWidth={3} />
                Deploy Config
              </span>
            )}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
