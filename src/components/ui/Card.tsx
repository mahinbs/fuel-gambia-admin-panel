import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  actions,
}) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-8">
          {title && (
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
          )}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
