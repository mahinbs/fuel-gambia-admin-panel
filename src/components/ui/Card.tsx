import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children?: React.ReactNode;
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
        'bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-10 transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/10 group relative overflow-hidden',
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
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
