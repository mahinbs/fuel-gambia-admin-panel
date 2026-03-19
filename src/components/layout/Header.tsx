import React from 'react';
import { Bell, Moon, Sun, Search, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/components/providers/ThemeProvider';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search transactions, users, or reports..."
            className="w-full pl-12 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-400 font-semibold"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
          
          <button className="relative p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm hover:shadow-md active:scale-95">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[8px] font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-end">
            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{user?.role?.replace('_', ' ') || 'Super Admin'}</p>
          </div>
          <div className="relative group">
            <button className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md">
              <UserIcon size={20} strokeWidth={2.5} />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <UserIcon size={18} />
                Profile Settings
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
