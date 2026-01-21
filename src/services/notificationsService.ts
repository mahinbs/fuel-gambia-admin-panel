import { Notification, PaginatedResponse } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

// Mock notifications data
const generateMockNotifications = (count: number): Notification[] => {
  const types: Notification['type'][] = [
    'BROADCAST',
    'USER_SPECIFIC',
    'LOW_BALANCE',
    'ALLOCATION',
    'PAYMENT',
    'VERIFICATION',
    'LOW_STOCK',
  ];
  
  const titles = [
    'System Maintenance',
    'Allocation Credited',
    'Low Balance Alert',
    'Payment Successful',
    'Verification Approved',
    'Low Stock Alert',
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `notif_${i + 1}`,
    userId: i % 3 === 0 ? `user_${i + 1}` : undefined,
    type: types[i % types.length],
    title: titles[i % titles.length],
    message: `This is a notification message ${i + 1}`,
    read: i % 3 !== 0,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const MOCK_NOTIFICATIONS = generateMockNotifications(100);

export const notificationsService = {
  async getNotifications(params: {
    page?: number;
    type?: string;
  }): Promise<PaginatedResponse<Notification>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_NOTIFICATIONS];
        
        if (params.type) {
          filtered = filtered.filter((n) => n.type === params.type);
        }
        
        // Sort by date descending
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const page = params.page || 1;
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        
        resolve({
          data: filtered.slice(start, end),
          total: filtered.length,
          page,
          limit: PAGE_SIZE,
          totalPages: Math.ceil(filtered.length / PAGE_SIZE),
        });
      }, 300);
    });
  },

  async markAsRead(id: string): Promise<Notification> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);
        if (notification) {
          notification.read = true;
          resolve(notification);
        } else {
          reject(new Error('Notification not found'));
        }
      }, 200);
    });
  },

  async markAllAsRead(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_NOTIFICATIONS.forEach((n) => {
          n.read = true;
        });
        resolve();
      }, 300);
    });
  },

  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    userId?: string;
    broadcast: boolean;
  }): Promise<Notification> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notification: Notification = {
          id: `notif_${MOCK_NOTIFICATIONS.length + 1}`,
          userId: data.userId,
          type: data.type as Notification['type'],
          title: data.title,
          message: data.message,
          read: false,
          createdAt: new Date().toISOString(),
        };
        MOCK_NOTIFICATIONS.unshift(notification);
        resolve(notification);
      }, 500);
    });
  },
};
