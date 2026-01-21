import { Inventory, FuelType } from '@/types';

// Mock inventory data
const generateMockInventories = (): Inventory[] => {
  const stations = ['Station A', 'Station B', 'Station C', 'Station D', 'Station E'];
  const stationIds = ['station_1', 'station_2', 'station_3', 'station_4', 'station_5'];
  const syncStatuses: Inventory['syncStatus'][] = ['SYNCED', 'SYNCED', 'PENDING', 'SYNCED', 'FAILED'];
  
  return stationIds.map((id, i) => ({
    stationId: id,
    stationName: stations[i],
    petrolStock: Math.floor(Math.random() * 10000) + 500,
    dieselStock: Math.floor(Math.random() * 10000) + 500,
    lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    syncStatus: syncStatuses[i],
  }));
};

const MOCK_INVENTORIES = generateMockInventories();

export const inventoryService = {
  async getInventories(): Promise<Inventory[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_INVENTORIES);
      }, 300);
    });
  },

  async updateInventory(
    stationId: string,
    fuelType: string,
    quantity: number,
    action: string
  ): Promise<Inventory> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_INVENTORIES.findIndex((i) => i.stationId === stationId);
        if (index !== -1) {
          const inventory = MOCK_INVENTORIES[index];
          // Create a new object instead of mutating the existing one
          const updatedInventory: Inventory = {
            ...inventory,
            petrolStock: fuelType === FuelType.PETROL
              ? action === 'ADD'
                ? inventory.petrolStock + quantity
                : Math.max(0, inventory.petrolStock - quantity)
              : inventory.petrolStock,
            dieselStock: fuelType === FuelType.DIESEL
              ? action === 'ADD'
                ? inventory.dieselStock + quantity
                : Math.max(0, inventory.dieselStock - quantity)
              : inventory.dieselStock,
            lastUpdated: new Date().toISOString(),
            syncStatus: 'PENDING',
          };
          // Replace the old object with the new one
          MOCK_INVENTORIES[index] = updatedInventory;
          resolve(updatedInventory);
        } else {
          reject(new Error('Station not found'));
        }
      }, 500);
    });
  },

  async syncInventory(stationId: string): Promise<Inventory> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_INVENTORIES.findIndex((i) => i.stationId === stationId);
        if (index !== -1) {
          // Create a new object instead of mutating the existing one
          const updatedInventory: Inventory = {
            ...MOCK_INVENTORIES[index],
            syncStatus: 'SYNCED',
            lastUpdated: new Date().toISOString(),
          };
          // Replace the old object with the new one
          MOCK_INVENTORIES[index] = updatedInventory;
          resolve(updatedInventory);
        } else {
          reject(new Error('Station not found'));
        }
      }, 800);
    });
  },
};
