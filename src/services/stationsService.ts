import { Station, PaginatedResponse, FuelType } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

// Mock stations data
const generateMockStations = (count: number): Station[] => {
  const locations = ['Banjul', 'Serrekunda', 'Brikama', 'Basse', 'Farafenni'];
  const statuses: Station['status'][] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'MAINTENANCE'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `station_${i + 1}`,
    name: `Station ${String.fromCharCode(65 + i)}`,
    location: locations[i % locations.length],
    managerId: `mgr_${i + 1}`,
    managerName: `Manager ${i + 1}`,
    fuelTypes: [FuelType.PETROL, FuelType.DIESEL],
    petrolStock: Math.floor(Math.random() * 10000) + 1000,
    dieselStock: Math.floor(Math.random() * 10000) + 1000,
    lowStockThreshold: 1000,
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastSync: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const MOCK_STATIONS = generateMockStations(30);

export const stationsService = {
  async getStations(params: {
    page?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Station>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_STATIONS];
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter(
            (s) =>
              s.name.toLowerCase().includes(searchLower) ||
              s.location.toLowerCase().includes(searchLower)
          );
        }
        
        if (params.status) {
          filtered = filtered.filter((s) => s.status === params.status);
        }
        
        const page = params.page || 1;
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        
        resolve({
          data: filtered.slice(start, end),
          total: filtered.length,
          page,
          limit: PAGE_SIZE,
          totalPages: Math.ceil(filtered.length / PAGE_SIZE),
        });
      }, 500);
    });
  },

  async getStationById(id: string): Promise<Station> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const station = MOCK_STATIONS.find((s) => s.id === id);
        if (station) {
          resolve(station);
        } else {
          reject(new Error('Station not found'));
        }
      }, 300);
    });
  },

  async createStation(data: Partial<Station>): Promise<Station> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStation: Station = {
          id: `station_${MOCK_STATIONS.length + 1}`,
          name: data.name || 'New Station',
          location: data.location || '',
          fuelTypes: data.fuelTypes || [FuelType.PETROL, FuelType.DIESEL],
          petrolStock: 0,
          dieselStock: 0,
          lowStockThreshold: data.lowStockThreshold || 1000,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          ...data,
        };
        MOCK_STATIONS.push(newStation);
        resolve(newStation);
      }, 500);
    });
  },

  async updateStation(id: string, updates: Partial<Station>): Promise<Station> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_STATIONS.findIndex((s) => s.id === id);
        if (index !== -1) {
          MOCK_STATIONS[index] = { ...MOCK_STATIONS[index], ...updates };
          resolve(MOCK_STATIONS[index]);
        } else {
          reject(new Error('Station not found'));
        }
      }, 500);
    });
  },
};
