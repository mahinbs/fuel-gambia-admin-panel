import { Beneficiary, PaginatedResponse, VerificationStatus, FuelType } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

// Mock beneficiaries data
const generateMockBeneficiaries = (count: number): Beneficiary[] => {
  const departments = ['Health', 'Education', 'Finance', 'Transport', 'Agriculture'];
  const statuses: VerificationStatus[] = [VerificationStatus.PENDING, VerificationStatus.APPROVED, VerificationStatus.REJECTED];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `ben_${i + 1}`,
    phoneNumber: `+220${7000000 + i}`,
    role: 'BENEFICIARY' as any,
    name: `Beneficiary ${i + 1}`,
    email: `beneficiary${i + 1}@example.com`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    governmentId: `GOV${1000 + i}`,
    departmentName: departments[i % departments.length],
    verificationStatus: statuses[i % statuses.length],
    monthlyAllocation: [200, 300, 400, 500][i % 4],
    remainingBalance: Math.floor(Math.random() * 500),
    fuelType: i % 2 === 0 ? FuelType.PETROL : FuelType.DIESEL,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [],
  }));
};

const MOCK_BENEFICIARIES = generateMockBeneficiaries(150);

export const beneficiariesService = {
  async getBeneficiaries(params: {
    page?: number;
    search?: string;
    status?: string;
    department?: string;
  }): Promise<PaginatedResponse<Beneficiary>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_BENEFICIARIES];
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter(
            (b) =>
              b.name?.toLowerCase().includes(searchLower) ||
              b.phoneNumber.includes(searchLower) ||
              b.departmentName?.toLowerCase().includes(searchLower)
          );
        }
        
        if (params.status) {
          filtered = filtered.filter((b) => b.verificationStatus === params.status);
        }
        
        if (params.department) {
          filtered = filtered.filter((b) => b.departmentName === params.department);
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

  async getBeneficiaryById(id: string): Promise<Beneficiary> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const beneficiary = MOCK_BENEFICIARIES.find((b) => b.id === id);
        if (beneficiary) {
          resolve(beneficiary);
        } else {
          reject(new Error('Beneficiary not found'));
        }
      }, 300);
    });
  },

  async verifyBeneficiary(id: string, status: string, rejectionReason?: string): Promise<Beneficiary> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_BENEFICIARIES.findIndex((b) => b.id === id);
        if (index !== -1) {
          // Create a new object instead of mutating the existing one
          const updatedBeneficiary: Beneficiary = {
            ...MOCK_BENEFICIARIES[index],
            verificationStatus: status as VerificationStatus,
            rejectionReason: rejectionReason || undefined,
            updatedAt: new Date().toISOString(),
          };
          // Replace the old object with the new one
          MOCK_BENEFICIARIES[index] = updatedBeneficiary;
          resolve(updatedBeneficiary);
        } else {
          reject(new Error('Beneficiary not found'));
        }
      }, 500);
    });
  },

  async updateAllocation(id: string, monthlyAllocation: number, fuelType: string): Promise<Beneficiary> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_BENEFICIARIES.findIndex((b) => b.id === id);
        if (index !== -1) {
          // Create a new object instead of mutating the existing one
          const updatedBeneficiary: Beneficiary = {
            ...MOCK_BENEFICIARIES[index],
            monthlyAllocation,
            fuelType: fuelType as FuelType,
            updatedAt: new Date().toISOString(),
          };
          // Replace the old object with the new one
          MOCK_BENEFICIARIES[index] = updatedBeneficiary;
          resolve(updatedBeneficiary);
        } else {
          reject(new Error('Beneficiary not found'));
        }
      }, 500);
    });
  },
};
