import { Customer, PaginatedResponse } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

// Mock customers data
const generateMockCustomers = (count: number): Customer[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `cust_${i + 1}`,
    phoneNumber: `+220${8000000 + i}`,
    role: 'CUSTOMER' as any,
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    walletBalance: Math.floor(Math.random() * 5000),
    totalSpend: Math.floor(Math.random() * 50000) + 10000,
    status: i % 10 === 0 ? 'SUSPENDED' : 'ACTIVE',
  }));
};

const MOCK_CUSTOMERS = generateMockCustomers(200);

export const customersService = {
  async getCustomers(params: {
    page?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Customer>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_CUSTOMERS];
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.name?.toLowerCase().includes(searchLower) ||
              c.phoneNumber.includes(searchLower) ||
              c.email?.toLowerCase().includes(searchLower)
          );
        }
        
        if (params.status) {
          filtered = filtered.filter((c) => c.status === params.status);
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

  async getCustomerById(id: string): Promise<Customer> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
        if (customer) {
          resolve(customer);
        } else {
          reject(new Error('Customer not found'));
        }
      }, 300);
    });
  },

  async suspendCustomer(id: string): Promise<Customer> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
        if (index !== -1) {
          MOCK_CUSTOMERS[index].status = 'SUSPENDED';
          resolve(MOCK_CUSTOMERS[index]);
        } else {
          reject(new Error('Customer not found'));
        }
      }, 500);
    });
  },

  async activateCustomer(id: string): Promise<Customer> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
        if (index !== -1) {
          MOCK_CUSTOMERS[index].status = 'ACTIVE';
          resolve(MOCK_CUSTOMERS[index]);
        } else {
          reject(new Error('Customer not found'));
        }
      }, 500);
    });
  },
};
