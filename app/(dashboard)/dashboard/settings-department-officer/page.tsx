'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Bell } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function SettingsDepartmentOfficerPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState({
    name: 'Department Officer',
    email: 'deptofficer@fuelgambia.com',
    phone: '+220 123 4567',
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    verificationAlerts: true,
    allocationAlerts: true,
  });

  const handleSaveProfile = () => {
    showToast('Profile updated successfully', 'success');
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences saved', 'success');
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.DEPARTMENT_OFFICER}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings - Department Officer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Profile and notification preferences</p>
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
                  <p className="font-medium">Verification Alerts</p>
                  <p className="text-sm text-gray-500">New beneficiary verifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.verificationAlerts}
                  onChange={(e) => setNotifications({ ...notifications, verificationAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allocation Alerts</p>
                  <p className="text-sm text-gray-500">Allocation updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.allocationAlerts}
                  onChange={(e) => setNotifications({ ...notifications, allocationAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <Button variant="primary" onClick={handleSaveNotifications}>
                <Bell size={16} className="mr-2" />
                Save Preferences
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
