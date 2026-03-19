import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
    error: 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400',
    warning: 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
    default: 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] uppercase tracking-wider font-black',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg shadow-sm',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
