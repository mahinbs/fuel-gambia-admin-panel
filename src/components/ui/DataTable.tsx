import React, { useState, useMemo } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from './Table';
import { cn } from '@/utils/cn';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { Input } from './Input';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  className,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  return (
    <div className={cn('space-y-4', className)}>
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl h-12 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHead className="bg-slate-50/50 dark:bg-slate-800/30">
            <TableRow className="hover:bg-transparent border-none">
              {columns.map((column) => (
                <TableHeader 
                  key={String(column.key)}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                  className={cn(
                    'py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors',
                    column.sortable && 'cursor-pointer hover:text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp size={12} className="text-blue-600" />
                          ) : (
                            <ChevronDown size={12} className="text-blue-600" />
                          )
                        ) : (
                          <ChevronsUpDown size={12} className="text-slate-300" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-20">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-300">
                      <Search size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">No matches found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search terms</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'group transition-colors border-slate-100 dark:border-slate-800',
                    onRowClick && 'cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-500/5'
                  )}
                >
                  {columns.map((column) => {
                    const value = row[column.key as keyof T];
                    return (
                      <TableCell key={String(column.key)} className="py-5 px-6">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {column.render ? column.render(value, row) : String(value ?? '')}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
