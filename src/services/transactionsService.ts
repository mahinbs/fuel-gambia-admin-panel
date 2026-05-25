import { createClient } from '@/utils/supabase/client';
import { Transaction, PaginatedResponse, FuelType, TransactionMode, PaymentStatus } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

const supabase = createClient();

export const transactionsService = {
  async getTransactions(params: {
    page?: number;
    startDate?: string;
    endDate?: string;
    fuelType?: string;
    mode?: string;
    stationId?: string;
    userId?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const page = params.page || 1;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('transactions')
      .select(`
        *,
        user:profiles!transactions_user_id_fkey(name, role),
        station:stations(name),
        attendant:profiles!transactions_attendant_id_fkey(name)
      `, { count: 'exact' });

    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }
    if (params.fuelType) {
      query = query.eq('fuel_type', params.fuelType);
    }
    if (params.mode) {
      query = query.eq('mode', params.mode);
    }
    if (params.stationId) {
      query = query.eq('station_id', params.stationId);
    }
    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedData: Transaction[] = (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      userName: (item as any).user?.name || 'Unknown',
      userRole: (item as any).user?.role || 'CUSTOMER',
      stationId: item.station_id,
      stationName: (item as any).station?.name || 'Unknown',
      fuelType: item.fuel_type as FuelType,
      amount: Number(item.amount),
      liters: Number(item.liters),
      mode: item.mode as TransactionMode,
      status: item.status as PaymentStatus,
      attendantId: item.attendant_id,
      attendantName: (item as any).attendant?.name || 'Unknown',
      createdAt: item.created_at,
      updatedAt: item.created_at,
    }));

    return {
      data: formattedData,
      total: count || 0,
      page,
      limit: PAGE_SIZE,
      totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    };
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user:profiles!transactions_user_id_fkey(name, role),
        station:stations(name),
        attendant:profiles!transactions_attendant_id_fkey(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      userName: (data as any).user?.name || 'Unknown',
      userRole: (data as any).user?.role || 'CUSTOMER',
      stationId: data.station_id,
      stationName: (data as any).station?.name || 'Unknown',
      fuelType: data.fuel_type as FuelType,
      amount: Number(data.amount),
      liters: Number(data.liters),
      mode: data.mode as TransactionMode,
      status: data.status as PaymentStatus,
      attendantId: data.attendant_id,
      attendantName: (data as any).attendant?.name || 'Unknown',
      createdAt: data.created_at,
      updatedAt: data.created_at,
    };
  },
};
