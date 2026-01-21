import { Attendant, PaginatedResponse } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

// Mock attendants data
const generateMockAttendants = (count: number): Attendant[] => {
  const stations = ['Station A', 'Station B', 'Station C', 'Station D', 'Station E'];
  const stationIds = ['station_1', 'station_2', 'station_3', 'station_4', 'station_5'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `att_${i + 1}`,
    phoneNumber: `+220${9000000 + i}`,
    role: 'ATTENDANT' as any,
    name: `Attendant ${i + 1}`,
    email: `attendant${i + 1}@example.com`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    stationId: stationIds[i % stationIds.length],
    stationName: stations[i % stations.length],
    deviceId: i % 3 === 0 ? `DEVICE_${i + 1}` : undefined,
    lastLogin: i % 2 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    status: i % 10 === 0 ? 'SUSPENDED' : 'ACTIVE',
  }));
};

const MOCK_ATTENDANTS = generateMockAttendants(80);

export const attendantsService = {
  async getAttendants(params: {
    page?: number;
    search?: string;
    stationId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Attendant>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_ATTENDANTS];
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.name?.toLowerCase().includes(searchLower) ||
              a.phoneNumber.includes(searchLower) ||
              a.stationName.toLowerCase().includes(searchLower)
          );
        }
        
        if (params.stationId) {
          filtered = filtered.filter((a) => a.stationId === params.stationId);
        }
        
        if (params.status) {
          filtered = filtered.filter((a) => a.status === params.status);
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

  async getAttendantById(id: string): Promise<Attendant> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const attendant = MOCK_ATTENDANTS.find((a) => a.id === id);
        if (attendant) {
          resolve(attendant);
        } else {
          reject(new Error('Attendant not found'));
        }
      }, 300);
    });
  },


  async suspendAttendant(id: string): Promise<Attendant> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_ATTENDANTS.findIndex((a) => a.id === id);
        if (index !== -1) {
          // Create a new object instead of mutating
          const updatedAttendant: Attendant = {
            ...MOCK_ATTENDANTS[index],
            status: 'SUSPENDED',
            updatedAt: new Date().toISOString(),
          };
          MOCK_ATTENDANTS[index] = updatedAttendant;
          resolve(updatedAttendant);
        } else {
          reject(new Error('Attendant not found'));
        }
      }, 500);
    });
  },

  async createAttendant(data: {
    name: string;
    phoneNumber: string;
    email?: string;
    stationId: string;
    stationName: string;
  }): Promise<Attendant> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAttendant: Attendant = {
          id: `att_${Date.now()}`,
          phoneNumber: data.phoneNumber,
          role: 'ATTENDANT' as any,
          name: data.name,
          email: data.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stationId: data.stationId,
          stationName: data.stationName,
          status: 'ACTIVE',
        };
        MOCK_ATTENDANTS.push(newAttendant);
        resolve(newAttendant);
      }, 500);
    });
  },

  async deleteAttendant(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_ATTENDANTS.findIndex((a) => a.id === id);
        if (index !== -1) {
          MOCK_ATTENDANTS.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Attendant not found'));
        }
      }, 500);
    });
  },

  async bindDevice(id: string, deviceId: string): Promise<Attendant> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_ATTENDANTS.findIndex((a) => a.id === id);
        if (index !== -1) {
          // Create a new object instead of mutating
          const updatedAttendant: Attendant = {
            ...MOCK_ATTENDANTS[index],
            deviceId,
            updatedAt: new Date().toISOString(),
          };
          MOCK_ATTENDANTS[index] = updatedAttendant;
          resolve(updatedAttendant);
        } else {
          reject(new Error('Attendant not found'));
        }
      }, 500);
    });
  },
};
