'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Users, DollarSign, Key, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function SettingsSuperAdminPage() {
  const { showToast } = useToast();
  const [priceConfig, setPriceConfig] = useState({ petrol: 65, diesel: 68 });
  const [fraudThreshold, setFraudThreshold] = useState(5);

  const handleSavePrices = () => {
    showToast('Fuel prices updated', 'success');
  };

  const handleSaveFraudSettings = () => {
    showToast('Fraud detection settings updated', 'success');
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings - Super Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">System-wide configuration and controls</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Fuel Price Configuration">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Petrol Price (GMD/Liter)
                </label>
                <Input
                  type="number"
                  value={priceConfig.petrol}
                  onChange={(e) => setPriceConfig({ ...priceConfig, petrol: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diesel Price (GMD/Liter)
                </label>
                <Input
                  type="number"
                  value={priceConfig.diesel}
                  onChange={(e) => setPriceConfig({ ...priceConfig, diesel: Number(e.target.value) })}
                />
              </div>
              <Button variant="primary" onClick={handleSavePrices}>
                Save Prices
              </Button>
            </div>
          </Card>

          <Card title="Fraud Detection Settings">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alert Threshold (duplicate scans)
                </label>
                <Input
                  type="number"
                  value={fraudThreshold}
                  onChange={(e) => setFraudThreshold(Number(e.target.value))}
                />
              </div>
              <Button variant="primary" onClick={handleSaveFraudSettings}>
                Save Settings
              </Button>
            </div>
          </Card>

          <Card title="Admin User Management">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Super Admin</p>
                  <p className="text-sm text-gray-500">superadmin@fuelgambia.com</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <Button variant="outline" className="w-full">
                <Users size={16} className="mr-2" />
                Add Admin User
              </Button>
            </div>
          </Card>

          <Card title="Security Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-gray-500">Manage API access keys</p>
                </div>
                <Button variant="outline" size="sm">
                  <Key size={16} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Device Whitelisting</p>
                  <p className="text-sm text-gray-500">Manage authorized devices</p>
                </div>
                <Button variant="outline" size="sm">
                  <Shield size={16} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
