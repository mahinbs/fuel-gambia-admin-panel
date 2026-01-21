'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Bell, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function SettingsStationManagerPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState({
    name: 'Station Manager',
    email: 'stationmanager@fuelgambia.com',
    phone: '+220 123 4567',
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    lowStockAlerts: true,
    settlementAlerts: true,
  });
  const [lowStockThreshold, setLowStockThreshold] = useState(1000);

  const handleSaveProfile = () => {
    showToast('Profile updated successfully', 'success');
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences saved', 'success');
  };

  const handleSaveThreshold = () => {
    showToast('Low stock threshold updated', 'success');
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_MANAGER}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings - Station Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Profile and station settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Profile Settings">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <Button variant="primary" onClick={handleSaveProfile}>
                <User size={16} className="mr-2" />
                Save Profile
              </Button>
            </div>
          </Card>

          <Card title="Notification Preferences">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Alerts</p>
                  <p className="text-sm text-gray-500">Receive email notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-gray-500">Inventory level warnings</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.lowStockAlerts}
                  onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Settlement Alerts</p>
                  <p className="text-sm text-gray-500">Monthly settlement updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.settlementAlerts}
                  onChange={(e) => setNotifications({ ...notifications, settlementAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <Button variant="primary" onClick={handleSaveNotifications}>
                <Bell size={16} className="mr-2" />
                Save Preferences
              </Button>
            </div>
          </Card>

          <Card title="Inventory Settings">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Low Stock Threshold (Liters)
                </label>
                <Input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                />
              </div>
              <Button variant="primary" onClick={handleSaveThreshold}>
                <AlertTriangle size={16} className="mr-2" />
                Save Threshold
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
