import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GM', {
    style: 'currency',
    currency: 'GMD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-GM').format(num);
};

export const formatLiters = (liters: number): string => {
  return `${formatNumber(liters)} L`;
};
