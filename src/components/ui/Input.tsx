import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={cn(
            'w-full px-4 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-300 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white dark:placeholder:text-slate-600 shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-700',
            error && 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500 group-hover:border-rose-400',
            className
          )}
          {...props}
        />
        <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-focus-within:opacity-100 border border-blue-500/20" />
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-500 flex items-center gap-1.5 ml-0.5">
          <span className="w-1 h-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
};
