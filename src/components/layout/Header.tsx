'use client';

import React from 'react';
import { Bell, Moon, Sun, Search } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/components/providers/ThemeProvider';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useAppSelector((state) => state.notifications);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge
              variant="error"
              size="sm"
              className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </div>
    </header>
  );
};
