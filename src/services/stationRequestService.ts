import { stationOrderFunctions } from '@/supabase';
import { StationOrder, PaginatedResponse } from '@/types';

export const stationRequestService = {
  async getOrders(params: {
    stationId?: string;
    status?: string;
    page?: number;
  } = {}): Promise<PaginatedResponse<StationOrder>> {
    const result = await stationOrderFunctions.getOrders(params);

    return {
      data: (result.data || []).map((item: any) => ({
        id: item.id,
        stationId: item.station_id,
        stationName: item.station?.name || 'Unknown',
        orderedBy: item.ordered_by_profile?.name || 'Unknown',
        fuelType: item.fuel_type,
        orderedLiters: Number(item.ordered_liters),
        unitPrice: Number(item.unit_price || 0),
        totalCost: Number(item.total_cost || 0),
        supplierName: item.supplier_name,
        expectedDeliveryDate: item.expected_delivery_date,
        actualDeliveryDate: item.actual_delivery_date,
        status: item.status,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) as StationOrder[],
      total: result.total,
      page: result.page,
      limit: 20,
      totalPages: result.totalPages,
    };
  },

  async createOrder(payload: {
    stationId: string;
    fuelType: 'PETROL' | 'DIESEL';
    orderedLiters: number;
    unitPrice: number;
    supplierName?: string;
    expectedDeliveryDate?: string;
  }): Promise<StationOrder> {
    const data = await stationOrderFunctions.createOrder(payload) as any;
    return {
      id: data.id,
      stationId: data.station_id,
      fuelType: data.fuel_type,
      orderedLiters: Number(data.ordered_liters),
      unitPrice: Number(data.unit_price || 0),
      totalCost: Number(data.total_cost || 0),
      supplierName: data.supplier_name,
      expectedDeliveryDate: data.expected_delivery_date,
      status: data.status,
      createdAt: data.created_at,
    } as StationOrder;
  },

  async updateOrderStatus(id: string, status: string): Promise<StationOrder> {
    const data = await stationOrderFunctions.updateOrderStatus(id, status) as any;
    return {
      id: data.id,
      stationId: data.station_id,
      fuelType: data.fuel_type,
      orderedLiters: Number(data.ordered_liters),
      status: data.status,
      createdAt: data.created_at,
    } as StationOrder;
  },
};
