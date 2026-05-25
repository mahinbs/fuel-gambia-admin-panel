import {
  inventoryFunctions,
} from '@/supabase';
import { Inventory, FuelType } from '@/types';

export const inventoryService = {
  async getInventories(): Promise<Inventory[]> {
    return await inventoryFunctions.getInventories() as any;
  },

  async getInventoryByStation(stationId: string) {
    return await inventoryFunctions.getInventoryByStation(stationId);
  },

  async updateInventory(
    stationId: string,
    fuelType: string,
    quantity: number,
    action: string
  ): Promise<Inventory> {
    // Get current stock first
    const current = await inventoryFunctions.getInventoryByStation(stationId);
    const currentVal = fuelType === FuelType.PETROL
      ? Number(current.petrol_stock)
      : Number(current.diesel_stock);
    const newQuantity = action === 'ADD' ? currentVal + quantity : Math.max(0, currentVal - quantity);
    const data = await inventoryFunctions.updateStock(stationId, fuelType as 'PETROL' | 'DIESEL', newQuantity);
    return {
      stationId: data.id,
      stationName: data.name,
      petrolStock: Number(data.petrol_stock),
      dieselStock: Number(data.diesel_stock),
      lastUpdated: new Date().toISOString(),
      syncStatus: 'SYNCED',
    };
  },

  async syncInventory(stationId: string): Promise<Inventory> {
    const data = await inventoryFunctions.getInventoryByStation(stationId);
    return {
      stationId: data.id,
      stationName: data.name,
      petrolStock: Number(data.petrol_stock),
      dieselStock: Number(data.diesel_stock),
      lastUpdated: new Date().toISOString(),
      syncStatus: 'SYNCED',
    };
  },

  async processDelivery(payload: {
    stationId: string;
    receivedBy: string;
    fuelType: 'PETROL' | 'DIESEL';
    orderedLiters: number;
    deliveredLiters: number;
    deliveryNote?: string;
    supplierName?: string;
  }) {
    return await inventoryFunctions.processDelivery(payload);
  },

  async getDeliveries(stationId: string, params: { page?: number } = {}) {
    return await inventoryFunctions.getDeliveries(stationId, params);
  },
};
