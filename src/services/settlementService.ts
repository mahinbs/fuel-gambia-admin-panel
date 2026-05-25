import { reconciliationFunctions } from '@/supabase';
import { MonthlySettlement, PaginatedResponse } from '@/types';

export const settlementService = {
  async getSettlements(params?: {
    stationId?: string;
    month?: string;
    status?: string;
    year?: number;
  }): Promise<PaginatedResponse<MonthlySettlement>> {
    if (!params?.stationId) {
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }

    const data = await reconciliationFunctions.getReconciliations({
      stationId: params.stationId,
      year: params.year,
      status: params.status,
    });

    const mapped: MonthlySettlement[] = (data || []).map((item: any) => ({
      id: item.id,
      stationId: item.station_id,
      reconciledBy: item.reconciled_by_profile?.name || 'Unknown',
      periodMonth: item.period_month,
      periodYear: item.period_year,
      fuelType: item.fuel_type,
      openingStock: Number(item.opening_stock),
      totalOrdered: Number(item.total_ordered),
      totalSold: Number(item.total_sold),
      theoreticalClosing: Number(item.closing_stock_theoretical),
      physicalClosing: Number(item.closing_stock_physical || 0),
      shortageLiters: Number(item.shortage_liters || 0),
      shortageThreshold: Number(item.shortage_threshold),
      shortagePayable: item.shortage_payable,
      cashSales: Number(item.cash_sales),
      couponSales: Number(item.coupon_sales),
      mobileMoneySales: Number(item.mobile_money_sales),
      totalCashCollected: Number(item.total_cash_collected),
      bankDepositAmount: Number(item.bank_deposit_amount),
      status: item.status,
      approvedBy: item.approved_by_profile?.name,
      approvedAt: item.approved_at,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return {
      data: mapped,
      total: mapped.length,
      page: 1,
      limit: 20,
      totalPages: Math.ceil(mapped.length / 20),
    };
  },

  async getSettlement(id: string): Promise<MonthlySettlement> {
    throw new Error('Use getSettlements with stationId filter');
  },

  async submitSettlement(payload: {
    stationId: string;
    periodMonth: number;
    periodYear: number;
    fuelType: 'PETROL' | 'DIESEL';
    closingStockPhysical: number;
    reconciledBy: string;
  }): Promise<MonthlySettlement> {
    const result = await reconciliationFunctions.calculateReconciliation({
      stationId: payload.stationId,
      periodMonth: payload.periodMonth,
      periodYear: payload.periodYear,
      fuelType: payload.fuelType,
      closingStockPhysical: payload.closingStockPhysical,
      reconciledBy: payload.reconciledBy,
    });
    return result as unknown as MonthlySettlement;
  },

  async approveSettlement(id: string, approvedBy: string): Promise<MonthlySettlement> {
    const data = await reconciliationFunctions.approveReconciliation(id, approvedBy);
    return data as unknown as MonthlySettlement;
  },

  async rejectSettlement(id: string, notes: string): Promise<MonthlySettlement> {
    const data = await reconciliationFunctions.rejectReconciliation(id, notes);
    return data as unknown as MonthlySettlement;
  },

  async generateReport(month: string, stationId: string): Promise<Blob> {
    // Generate report as a JSON blob for now
    const [year, m] = month.split('-').map(Number);
    const data = await reconciliationFunctions.getReconciliations({ stationId, year });
    const report = JSON.stringify(data, null, 2);
    return new Blob([report], { type: 'application/json' });
  },
};
