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
    <thead className={cn('bg-gray-50 dark:bg-gray-900', className)}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <tbody className={className}>{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <tr
      className={cn(
        'border-b border-gray-200 dark:border-gray-700',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
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
        'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
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
      className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100', className)}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};
