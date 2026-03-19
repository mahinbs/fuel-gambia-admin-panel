import React from 'react';
import { cn } from '@/utils/cn';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <thead className={cn('bg-slate-50/50 dark:bg-slate-800/50', className)}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <tbody className={cn('divide-y divide-slate-100 dark:divide-slate-800', className)}>{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <tr
      className={cn(
        'transition-colors duration-200',
        onClick ? 'cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/10' : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/30',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <th
      className={cn(
        'px-8 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest',
        className
      )}
    >
      {children}
    </th>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  colSpan,
}) => {
  return (
    <td 
      className={cn('px-8 py-5 whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-300', className)}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};
