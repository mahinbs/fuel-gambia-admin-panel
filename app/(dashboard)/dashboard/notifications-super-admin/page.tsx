'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead, createNotification } from '@/store/slices/notificationsSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import { useToast } from '@/components/providers/ToastProvider';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function NotificationsSuperAdminPage() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);
  const { showToast } = useToast();
  const [createModal, setCreateModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    type: 'BROADCAST',
    title: '',
    message: '',
    broadcast: true,
  });

  useEffect(() => {
    dispatch(fetchNotifications({}));
  }, [dispatch]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
    } catch (error: any) {
      showToast(error.message || 'Failed to mark as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      showToast('All notifications marked as read', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to mark all as read', 'error');
    }
  };

  const handleCreate = async () => {
    try {
      await dispatch(createNotification(notificationForm)).unwrap();
      showToast('Notification created successfully', 'success');
      setCreateModal(false);
      setNotificationForm({ type: 'BROADCAST', title: '', message: '', broadcast: true });
    } catch (error: any) {
      showToast(error.message || 'Failed to create notification', 'error');
    }
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications - Super Admin</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">System-wide notifications and alerts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck size={16} className="mr-2" />
              Mark All Read
            </Button>
            <Button variant="primary" onClick={() => setCreateModal(true)}>
              <Bell size={16} className="mr-2" />
              Create Notification
            </Button>
          </div>
        </div>

        <Card>
          <div className="space-y-4">
            {loading ? (
              <div>Loading...</div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <Badge variant="info" size="sm">
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="error" size="sm">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Modal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          title="Create Notification"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={notificationForm.type}
                onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="BROADCAST">Broadcast</option>
                <option value="FRAUD_ALERT">Fraud Alert</option>
                <option value="POLICY_UPDATE">Policy Update</option>
                <option value="STATION_ALERT">Station Alert</option>
                <option value="SYSTEM_MAINTENANCE">System Maintenance</option>
              </select>
            </div>
            <Input
              label="Title"
              value={notificationForm.title}
              onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                Create
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
