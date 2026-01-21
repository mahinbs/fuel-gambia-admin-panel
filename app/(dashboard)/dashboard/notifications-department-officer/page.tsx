'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead } from '@/store/slices/notificationsSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, CheckCheck } from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import { useToast } from '@/components/providers/ToastProvider';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function NotificationsDepartmentOfficerPage() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);
  const { showToast } = useToast();

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

  return (
    <ProtectedRoute requiredRole={AdminRole.DEPARTMENT_OFFICER}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications - Department Officer</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Beneficiary and allocation notifications</p>
          </div>
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck size={16} className="mr-2" />
            Mark All Read
          </Button>
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
              notifications
                .filter((n) => ['VERIFICATION', 'ALLOCATION', 'LOW_BALANCE'].includes(n.type))
                .map((notification) => (
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
      </div>
    </ProtectedRoute>
  );
}
