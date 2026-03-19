import { DashboardStats, ChartData, SuperAdminDashboardStats, GovernmentAdminDashboardStats, StationAdminDashboardStats } from '@/types';

// Mock data generators
const generateMockStats = (): DashboardStats => ({
  totalBeneficiaries: 1250,
  pendingVerifications: 45,
  totalSubsidyIssued: 2500000,
  totalCommercialRevenue: 1850000,
  todayTransactions: 342,
  activeStations: 28,
  lowInventoryAlerts: 5,
  failedQRScans: 12,
  paymentFailures: 8,
});

const generateSuperAdminStats = (): SuperAdminDashboardStats => ({
  totalNationalBudget: 50000000,
  totalFuelDispensed: 1250000,
  monthlySubsidyUtilization: 68,
  activeFuelStations: 28,
  fraudAlerts: 12,
  pendingStationRequests: 5,
  totalBeneficiaries: 1250,
  totalDepartmentOfficers: 15,
  totalStationManagers: 28,
});

const generateGovernmentAdminStats = (): GovernmentAdminDashboardStats => ({
  totalBeneficiaries: 450,
  monthlyAllocatedFuel: 45000,
  usedFuel: 32000,
  remainingFuel: 13000,
  pendingVerifications: 23,
  activeCoupons: 380,
  expiredCoupons: 12,
  totalAllocations: 450,
});

const generateStationAdminStats = (): StationAdminDashboardStats => ({
  todaySales: 125000,
  monthlyFuelDispensed: 85000,
  petrolStock: 12000,
  dieselStock: 15000,
  lowStockAlerts: 2,
  pendingReimbursements: 450000,
  todayTransactions: 85,
  activeAttendants: 6,
});

const generateMonthlyTrend = (): ChartData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month) => ({
    name: month,
    value: Math.floor(Math.random() * 500000) + 100000,
  }));
};

const generateSalesTrend = (): ChartData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month) => ({
    name: month,
    value: Math.floor(Math.random() * 300000) + 50000,
  }));
};

const generateFuelDistribution = (): ChartData[] => [
  { name: 'Petrol', value: 65 },
  { name: 'Diesel', value: 35 },
];

const generateStationVolume = (): ChartData[] => {
  const stations = ['Station A', 'Station B', 'Station C', 'Station D', 'Station E'];
  return stations.map((station) => ({
    name: station,
    value: Math.floor(Math.random() * 50000) + 10000,
  }));
};

const generateMonthlyFuelUsage = (): ChartData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    name: month,
    subsidy: Math.floor(Math.random() * 200000) + 100000,
    commercial: Math.floor(Math.random() * 150000) + 50000,
  }));
};

const generateBudgetVsConsumption = (): ChartData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    name: month,
    budget: Math.floor(Math.random() * 5000000) + 3000000,
    consumption: Math.floor(Math.random() * 4500000) + 2500000,
  }));
};

const generateSubsidyVsCommercial = (): ChartData[] => [
  { name: 'Subsidy', value: 68 },
  { name: 'Commercial', value: 32 },
];

const generateMonthlyAllocationTrend = (): ChartData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    name: month,
    allocated: Math.floor(Math.random() * 50000) + 30000,
    used: Math.floor(Math.random() * 40000) + 20000,
  }));
};

const generateDepartmentBreakdown = (): ChartData[] => {
  const departments = ['Health', 'Education', 'Transport', 'Agriculture'];
  return departments.map((dept) => ({
    name: dept,
    allocated: Math.floor(Math.random() * 15000) + 10000,
    used: Math.floor(Math.random() * 12000) + 8000,
  }));
};

const generateUsageMonitoring = (): ChartData[] => {
  const beneficiaries = ['Beneficiary A', 'Beneficiary B', 'Beneficiary C', 'Beneficiary D'];
  return beneficiaries.map((ben) => ({
    name: ben,
    value: Math.floor(Math.random() * 500) + 200,
  }));
};

const generateDailySalesTrend = (): ChartData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    name: day,
    sales: Math.floor(Math.random() * 200000) + 100000,
  }));
};

const generateInventoryLevels = (): ChartData[] => [
  { name: 'Petrol', current: 12000, threshold: 5000 },
  { name: 'Diesel', current: 15000, threshold: 5000 },
];

const generateTransactionTrend = (): ChartData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    name: day,
    subsidy: Math.floor(Math.random() * 50) + 20,
    commercial: Math.floor(Math.random() * 40) + 15,
  }));
};

export const dashboardService = {
  async getDashboardData(): Promise<{
    stats: DashboardStats;
    monthlySubsidyTrend: ChartData[];
    paidFuelSalesTrend: ChartData[];
    fuelTypeDistribution: ChartData[];
    stationWiseVolume: ChartData[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: generateMockStats(),
          monthlySubsidyTrend: generateMonthlyTrend(),
          paidFuelSalesTrend: generateSalesTrend(),
          fuelTypeDistribution: generateFuelDistribution(),
          stationWiseVolume: generateStationVolume(),
        });
      }, 500);
    });
  },

  async getSuperAdminDashboard(): Promise<{
    stats: SuperAdminDashboardStats;
    monthlyFuelUsage: ChartData[];
    budgetVsConsumption: ChartData[];
    subsidyVsCommercial: ChartData[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: generateSuperAdminStats(),
          monthlyFuelUsage: generateMonthlyFuelUsage(),
          budgetVsConsumption: generateBudgetVsConsumption(),
          subsidyVsCommercial: generateSubsidyVsCommercial(),
        });
      }, 500);
    });
  },

  async getGovernmentAdminDashboard(): Promise<{
    stats: GovernmentAdminDashboardStats;
    monthlyAllocationTrend: ChartData[];
    departmentBreakdown: ChartData[];
    usageMonitoring: ChartData[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: generateGovernmentAdminStats(),
          monthlyAllocationTrend: generateMonthlyAllocationTrend(),
          departmentBreakdown: generateDepartmentBreakdown(),
          usageMonitoring: generateUsageMonitoring(),
        });
      }, 500);
    });
  },

  async getHQDashboard(): Promise<{
    stats: StationAdminDashboardStats;
    dailySalesTrend: ChartData[];
    inventoryLevels: ChartData[];
    transactionTrend: ChartData[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: generateStationAdminStats(),
          dailySalesTrend: generateDailySalesTrend(),
          inventoryLevels: generateInventoryLevels(),
          transactionTrend: generateTransactionTrend(),
        });
      }, 500);
    });
  },

  async getBranchDashboard(): Promise<{
    stats: StationAdminDashboardStats;
    dailySalesTrend: ChartData[];
    inventoryLevels: ChartData[];
    transactionTrend: ChartData[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: generateStationAdminStats(),
          dailySalesTrend: generateDailySalesTrend(),
          inventoryLevels: generateInventoryLevels(),
          transactionTrend: generateTransactionTrend(),
        });
      }, 500);
    });
  },
};
