'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Palette, Upload, Save, CheckCircle2, Image as ImageIcon } from 'lucide-react';
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
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Platform Customization</h1>
          <p className="text-slate-500 font-medium mt-2">Personalize the visual identity of your administrative panels</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brand Identity */}
          <Card className="p-8 border-none shadow-2xl space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-600">
                <Palette size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Brand Colors</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Primary Theme Color</label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl shadow-xl border-4 border-white dark:border-slate-800 overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="flex-1">
                    <Input 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {['#0a192f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className="h-10 rounded-xl transition-transform hover:scale-110 active:scale-95 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Logo Management */}
          <Card className="p-8 border-none shadow-2xl space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-purple-600/10 p-3 rounded-2xl text-purple-600">
                <Upload size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Logo & Assets</h2>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 bg-slate-50/50 dark:bg-slate-900/50 group hover:border-blue-500/50 transition-colors">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-20 object-contain mb-4" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors mb-4">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Upload New Logo</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SVG, PNG or JPG (max. 2MB)</p>
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

        <div className="flex justify-end gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="px-10 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-xs"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Synchronizing...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                Changes Applied
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={18} />
                Save Preferences
              </span>
            )}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
