'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Palette,
  Upload,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle,
  Pipette,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { createClient } from '@/lib/supabase';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000000';
const STORAGE_BUCKET = 'brand-assets'; // Use a dedicated public bucket for brand assets

const PRESET_COLORS = [
  '#0a192f',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

export default function SettingsSuperAdminPage() {
  const [appDisplayName, setAppDisplayName] = useState('Fuel Gambia');
  const [primaryColor, setPrimaryColor] = useState('#0a192f');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hexInput, setHexInput] = useState('#0a192f');
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const nativeColorRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', SETTINGS_ID)
          .maybeSingle();

        if (error) {
          console.error('Failed to load settings:', error);
          return;
        }

        if (data) {
          if (data.app_display_name) setAppDisplayName(data.app_display_name);
          if (data.primary_color_hex) {
            setPrimaryColor(data.primary_color_hex);
            setHexInput(data.primary_color_hex);
          }
          if (data.logo_url) {
            setLogoPreview(data.logo_url);
            setCurrentLogoUrl(data.logo_url);
          }
        }
      } catch (err) {
        console.error('Settings load error:', err);
      }
    };
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    setHexInput(color);
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    // Only update primary color if it's a valid hex
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setPrimaryColor(value);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    setLogoFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `brand_logo.${fileExt}`;

    // Try to upload to brand-assets bucket
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      // Fallback: try kyc-documents bucket
      console.warn('brand-assets bucket failed, trying kyc-documents:', error.message);
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from('kyc-documents')
        .upload(`brand/${fileName}`, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600',
        });

      if (fallbackError) {
        throw new Error(`Logo upload failed: ${fallbackError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(`brand/${fileName}`);
      return urlData.publicUrl;
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      let finalLogoUrl = currentLogoUrl;

      // Upload new logo if selected
      if (logoFile) {
        finalLogoUrl = await uploadLogo(logoFile);
        setCurrentLogoUrl(finalLogoUrl);
        setLogoFile(null); // Clear the pending file after upload
      }

      // Upsert settings (works even if row doesn't exist yet)
      const { error: upsertError } = await supabase
        .from('system_settings')
        .upsert(
          {
            id: SETTINGS_ID,
            app_display_name: appDisplayName,
            primary_color_hex: primaryColor,
            logo_url: finalLogoUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (upsertError) {
        throw new Error(`Failed to save settings: ${upsertError.message}`);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute
      requiredRole={[
        AdminRole.SUPER_ADMIN,
        AdminRole.GOVERNMENT_ADMIN,
        AdminRole.STATION_HQ,
        AdminRole.STATION_BRANCH,
      ]}
    >
      <div className="space-y-10 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            System Configuration
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Manage global settings, security protocols, and white-labeling assets
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400">
            <AlertCircle size={20} strokeWidth={2.5} className="shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800/40 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Visual Identity ── */}
          <Card className="p-10 border-none shadow-2xl space-y-10">
            <div className="flex items-center gap-5">
              <div className="bg-blue-600/10 p-4 rounded-2xl text-blue-600 shadow-sm">
                <Palette size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Visual Identity
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Theme Colors &amp; Styles
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Display Name */}
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Application Display Name
                  </label>
                  <Input
                    value={appDisplayName}
                    onChange={(e) => setAppDisplayName(e.target.value)}
                    placeholder="e.g. Fuel Gambia"
                    className="h-14 rounded-2xl font-black uppercase text-slate-900 dark:text-white"
                  />
                </div>

                {/* Brand Color with Color Picker */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Primary Brand HEX
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Color swatch — click to open picker */}
                    <div className="relative" ref={colorPickerRef}>
                      <button
                        onClick={() => setShowColorPicker((v) => !v)}
                        className="w-20 h-14 rounded-2xl shadow-2xl border-4 border-white dark:border-slate-700 shrink-0 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/30 cursor-pointer group"
                        style={{ backgroundColor: primaryColor }}
                        title="Click to open color picker"
                        type="button"
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pipette size={18} className="text-white drop-shadow-lg" />
                        </span>
                      </button>

                      {/* Color Picker Dropdown */}
                      {showColorPicker && (
                        <div className="absolute top-full left-0 mt-3 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 w-72 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                              Color Picker
                            </p>
                            <button
                              onClick={() => setShowColorPicker(false)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              type="button"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Native color input (full spectrum) */}
                          <div className="relative">
                            <input
                              ref={nativeColorRef}
                              type="color"
                              value={primaryColor}
                              onChange={(e) => handleColorChange(e.target.value)}
                              className="w-full h-40 rounded-2xl cursor-pointer border-0 p-0 bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-2xl [&::-webkit-color-swatch]:border-none"
                            />
                          </div>

                          {/* Hex input */}
                          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div
                              className="w-8 h-8 rounded-xl shrink-0 border-2 border-white dark:border-slate-600 shadow"
                              style={{ backgroundColor: primaryColor }}
                            />
                            <input
                              type="text"
                              value={hexInput}
                              onChange={(e) => handleHexInputChange(e.target.value)}
                              placeholder="#000000"
                              className="flex-1 bg-transparent text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none"
                              maxLength={7}
                            />
                          </div>

                          {/* Preset swatches */}
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                              Presets
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    handleColorChange(color);
                                    setShowColorPicker(false);
                                  }}
                                  className={cn(
                                    'w-full aspect-square rounded-xl transition-all hover:scale-110 active:scale-95 shadow-md',
                                    primaryColor === color
                                      ? 'ring-4 ring-blue-500 ring-offset-2 scale-110'
                                      : ''
                                  )}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full rounded-2xl font-black"
                            onClick={() => setShowColorPicker(false)}
                          >
                            Apply Color
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Hex text input */}
                    <div className="flex-1">
                      <Input
                        value={hexInput}
                        onChange={(e) => handleHexInputChange(e.target.value)}
                        placeholder="#000000"
                        className="h-14 rounded-2xl font-black tracking-widest uppercase text-blue-600"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact preset row (outside picker) */}
              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Quick Presets
                </p>
                <div className="flex gap-3">
                  {PRESET_COLORS.slice(0, 5).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={cn(
                        'w-10 h-10 rounded-xl transition-all hover:scale-125 active:scale-95 shadow-lg',
                        primaryColor === color ? 'ring-4 ring-blue-500/30 scale-110' : ''
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Asset Management ── */}
          <Card className="p-10 border-none shadow-2xl space-y-10">
            <div className="flex items-center gap-5">
              <div className="bg-purple-600/10 p-4 rounded-2xl text-purple-600 shadow-sm">
                <Upload size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Asset Management
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Logo &amp; Static Media
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Drop zone */}
              <label
                htmlFor="logo-upload"
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-12 bg-slate-50/50 dark:bg-slate-900/50 group hover:border-purple-500/60 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all cursor-pointer"
              >
                {logoPreview ? (
                  <div className="relative group/preview flex flex-col items-center">
                    <img
                      src={logoPreview}
                      alt="Brand Logo Preview"
                      className="h-28 max-w-[200px] object-contain mb-4 transition-transform group-hover/preview:scale-105 drop-shadow-lg"
                    />
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <div className="flex flex-col items-center gap-1 text-purple-600">
                        <Upload size={24} strokeWidth={2.5} />
                        <span className="text-xs font-black">Replace</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-purple-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10 transition-all mb-4 shadow-sm">
                    <ImageIcon size={40} strokeWidth={1.5} />
                  </div>
                )}

                <div className="text-center mt-2">
                  <p className="text-sm font-black text-slate-900 dark:text-white mb-1">
                    {logoPreview ? 'Click to replace logo' : 'Upload Brand Logo'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    SVG, PNG or JPG — Max 5MB
                  </p>
                </div>

                <input
                  id="logo-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                />
              </label>

              {/* Pending upload indicator */}
              {logoFile && (
                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-800/40 flex items-center justify-center text-purple-600 shrink-0">
                    <ImageIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 dark:text-white truncate">
                      {logoFile.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {(logoFile.size / 1024).toFixed(1)} KB — Ready to upload
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(currentLogoUrl);
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            variant="primary"
            size="lg"
            className="px-12 h-16 rounded-[1.5rem] shadow-2xl shadow-blue-500/30 font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-3">
                <CheckCircle2 size={22} strokeWidth={3} />
                Saved Successfully
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Save size={22} strokeWidth={3} />
                Save Settings
              </span>
            )}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
