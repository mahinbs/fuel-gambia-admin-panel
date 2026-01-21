import { Transaction, PaginatedResponse, TransactionMode, PaymentStatus, FuelType } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

// Mock transactions data
const generateMockTransactions = (count: number): Transaction[] => {
  const modes: TransactionMode[] = [TransactionMode.SUBSIDY, TransactionMode.PAID];
  const statuses: PaymentStatus[] = [PaymentStatus.SUCCESS, PaymentStatus.SUCCESS, PaymentStatus.SUCCESS, PaymentStatus.FAILED];
  const stations = ['Station A', 'Station B', 'Station C', 'Station D'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `txn_${i + 1}`,
    userId: `user_${i + 1}`,
    userName: `User ${i + 1}`,
    userRole: i % 3 === 0 ? 'BENEFICIARY' as any : 'CUSTOMER' as any,
    stationId: `station_${(i % 4) + 1}`,
    stationName: stations[i % stations.length],
    fuelType: i % 2 === 0 ? FuelType.PETROL : FuelType.DIESEL,
    amount: Math.floor(Math.random() * 5000) + 500,
    liters: Math.floor(Math.random() * 50) + 5,
    mode: modes[i % modes.length],
    status: statuses[i % statuses.length],
    attendantId: `att_${i + 1}`,
    attendantName: `Attendant ${i + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

const MOCK_TRANSACTIONS = generateMockTransactions(500);

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
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_TRANSACTIONS];
        
        if (params.startDate) {
          filtered = filtered.filter((t) => new Date(t.createdAt) >= new Date(params.startDate!));
        }
        
        if (params.endDate) {
          filtered = filtered.filter((t) => new Date(t.createdAt) <= new Date(params.endDate!));
        }
        
        if (params.fuelType) {
          filtered = filtered.filter((t) => t.fuelType === params.fuelType);
        }
        
        if (params.mode) {
          filtered = filtered.filter((t) => t.mode === params.mode);
        }
        
        if (params.stationId) {
          filtered = filtered.filter((t) => t.stationId === params.stationId);
        }
        
        if (params.userId) {
          filtered = filtered.filter((t) => t.userId === params.userId);
        }
        
        // Sort by date descending
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
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

  async getTransactionById(id: string): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const transaction = MOCK_TRANSACTIONS.find((t) => t.id === id);
        if (transaction) {
          resolve(transaction);
        } else {
          reject(new Error('Transaction not found'));
        }
      }, 300);
    });
  },
};
