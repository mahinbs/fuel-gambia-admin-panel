import { Payment, PaginatedResponse, PaymentStatus, FuelType } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

// Mock payments data
const generateMockPayments = (count: number): Payment[] => {
  const statuses: PaymentStatus[] = [PaymentStatus.SUCCESS, PaymentStatus.SUCCESS, PaymentStatus.PENDING, PaymentStatus.FAILED];
  const paymentMethods = ['Mobile Money', 'Card', 'Bank Transfer'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `pay_${i + 1}`,
    userId: `user_${i + 1}`,
    userName: `User ${i + 1}`,
    transactionId: `txn_${i + 1}`,
    amount: Math.floor(Math.random() * 5000) + 500,
    fuelType: i % 2 === 0 ? FuelType.PETROL : FuelType.DIESEL,
    status: statuses[i % statuses.length],
    paymentMethod: paymentMethods[i % paymentMethods.length],
    gatewayResponse: { id: `gateway_${i + 1}`, status: statuses[i % statuses.length] },
    retryCount: i % 10 === 0 ? 2 : 0,
    refunded: false,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

const MOCK_PAYMENTS = generateMockPayments(300);

export const paymentsService = {
  async getPayments(params: {
    page?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Payment>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_PAYMENTS];
        
        if (params.status) {
          filtered = filtered.filter((p) => p.status === params.status);
        }
        
        if (params.startDate) {
          filtered = filtered.filter((p) => new Date(p.createdAt) >= new Date(params.startDate!));
        }
        
        if (params.endDate) {
          filtered = filtered.filter((p) => new Date(p.createdAt) <= new Date(params.endDate!));
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

  async getPaymentById(id: string): Promise<Payment> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const payment = MOCK_PAYMENTS.find((p) => p.id === id);
        if (payment) {
          resolve(payment);
        } else {
          reject(new Error('Payment not found'));
        }
      }, 300);
    });
  },

  async retryPayment(id: string): Promise<Payment> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_PAYMENTS.findIndex((p) => p.id === id);
        if (index !== -1) {
          MOCK_PAYMENTS[index].status = PaymentStatus.SUCCESS;
          MOCK_PAYMENTS[index].retryCount += 1;
          MOCK_PAYMENTS[index].updatedAt = new Date().toISOString();
          resolve(MOCK_PAYMENTS[index]);
        } else {
          reject(new Error('Payment not found'));
        }
      }, 800);
    });
  },

  async processRefund(id: string): Promise<Payment> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_PAYMENTS.findIndex((p) => p.id === id);
        if (index !== -1) {
          MOCK_PAYMENTS[index].status = PaymentStatus.REFUNDED;
          MOCK_PAYMENTS[index].refunded = true;
          MOCK_PAYMENTS[index].updatedAt = new Date().toISOString();
          resolve(MOCK_PAYMENTS[index]);
        } else {
          reject(new Error('Payment not found'));
        }
      }, 800);
    });
  },
};
