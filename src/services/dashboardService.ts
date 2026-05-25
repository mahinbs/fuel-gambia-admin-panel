import { dashboardFunctions } from '@/supabase';
import {
  DashboardStats,
  ChartData,
  SuperAdminDashboardStats,
  GovernmentAdminDashboardStats,
  StationAdminDashboardStats,
} from '@/types';

/** Map raw monthly transaction data to chart series by month */
function buildMonthlyTrend(transactions: Array<{ fuel_type: string; liters: number; created_at: string }>, key: string): ChartData[] {
  const months: Record<string, number> = {};
  transactions.forEach((t) => {
    const month = t.created_at.slice(0, 7); // YYYY-MM
    months[month] = (months[month] || 0) + Number(t.liters);
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

export const dashboardService = {
  async getDashboardData(): Promise<{
    stats: DashboardStats;
    monthlySubsidyTrend: ChartData[];
    paidFuelSalesTrend: ChartData[];
    fuelTypeDistribution: ChartData[];
    stationWiseVolume: ChartData[];
  }> {
    const stats = await dashboardFunctions.getStats('SUPER_ADMIN');
    const trend = await dashboardFunctions.getMonthlyFuelTrend();
    const inventories = await dashboardFunctions.getInventoryLevels();

    const subsidyTrend = buildMonthlyTrend(
      trend.filter((t: any) => t.mode === 'SUBSIDY'),
      'liters'
    );
    const paidTrend = buildMonthlyTrend(
      trend.filter((t: any) => t.mode === 'PAID'),
      'liters'
    );

    // Fuel type distribution
    const petrolTotal = trend.filter((t: any) => t.fuel_type === 'PETROL').reduce((s: number, t: any) => s + Number(t.liters), 0);
    const dieselTotal = trend.filter((t: any) => t.fuel_type === 'DIESEL').reduce((s: number, t: any) => s + Number(t.liters), 0);

    const stationVolume: ChartData[] = inventories.map((s: any) => ({
      label: s.name,
      value: Number(s.petrol_stock) + Number(s.diesel_stock),
    }));

    return {
      stats: stats as DashboardStats,
      monthlySubsidyTrend: subsidyTrend,
      paidFuelSalesTrend: paidTrend,
      fuelTypeDistribution: [
        { label: 'Petrol', value: petrolTotal },
        { label: 'Diesel', value: dieselTotal },
      ],
      stationWiseVolume: stationVolume,
    };
  },

  async getSuperAdminDashboard(): Promise<{
    stats: SuperAdminDashboardStats;
    monthlyFuelUsage: ChartData[];
    budgetVsConsumption: ChartData[];
    subsidyVsCommercial: ChartData[];
  }> {
    const raw = await dashboardFunctions.getStats('SUPER_ADMIN');
    const trend = await dashboardFunctions.getMonthlyFuelTrend();

    return {
      stats: {
        totalNationalBudget: (raw as any).total_subsidy_value || 0,
        totalFuelDispensed: 0,
        monthlySubsidyUtilization: 0,
        activeFuelStations: (raw as any).active_stations || 0,
        fraudAlerts: 0,
        pendingStationRequests: 0,
        totalBeneficiaries: (raw as any).total_beneficiaries || 0,
        totalDepartmentOfficers: 0,
        totalStationManagers: 0,
        totalMobileUsers: (raw as any).total_customers || 0,
        totalBranchUsers: 0,
        totalHQUsers: 0,
        totalDeptUsers: 0,
        totalCouponsUsed: 0,
      } as SuperAdminDashboardStats,
      monthlyFuelUsage: buildMonthlyTrend(trend as any, 'liters'),
      budgetVsConsumption: [],
      subsidyVsCommercial: [],
    };
  },

  async getGovernmentAdminDashboard(): Promise<{
    stats: GovernmentAdminDashboardStats;
    monthlyAllocationTrend: ChartData[];
    departmentBreakdown: ChartData[];
    usageMonitoring: ChartData[];
  }> {
    const raw = await dashboardFunctions.getStats('GOVERNMENT_ADMIN');

    return {
      stats: {
        totalBeneficiaries: (raw as any).total_beneficiaries || 0,
        monthlyAllocatedFuel: (raw as any).total_allocated_liters || 0,
        usedFuel: (raw as any).total_used_liters || 0,
        remainingFuel: ((raw as any).total_allocated_liters || 0) - ((raw as any).total_used_liters || 0),
        pendingVerifications: (raw as any).pending_verifications || 0,
        activeCoupons: (raw as any).active_coupons || 0,
        expiredCoupons: 0,
        totalAllocations: (raw as any).total_allocations || 0,
      } as GovernmentAdminDashboardStats,
      monthlyAllocationTrend: [],
      departmentBreakdown: [],
      usageMonitoring: [],
    };
  },

  async getHQDashboard(): Promise<{
    stats: StationAdminDashboardStats;
    dailySalesTrend: ChartData[];
    inventoryLevels: ChartData[];
    transactionTrend: ChartData[];
  }> {
    const raw = await dashboardFunctions.getStats('STATION_HQ');
    const inventories = await dashboardFunctions.getInventoryLevels();

    return {
      stats: {
        todaySales: (raw as any).today_revenue || 0,
        monthlyFuelDispensed: 0,
        petrolStock: inventories.reduce((s: number, i: any) => s + Number(i.petrol_stock), 0),
        dieselStock: inventories.reduce((s: number, i: any) => s + Number(i.diesel_stock), 0),
        lowStockAlerts: (raw as any).low_stock_stations || 0,
        pendingReimbursements: 0,
        todayTransactions: (raw as any).today_transactions || 0,
        activeAttendants: (raw as any).total_attendants || 0,
      } as StationAdminDashboardStats,
      dailySalesTrend: [],
      inventoryLevels: inventories.map((i: any) => ({
        label: i.name,
        value: Number(i.petrol_stock) + Number(i.diesel_stock),
      })),
      transactionTrend: [],
    };
  },

  async getBranchDashboard(): Promise<{
    stats: StationAdminDashboardStats;
    dailySalesTrend: ChartData[];
    inventoryLevels: ChartData[];
    transactionTrend: ChartData[];
  }> {
    const raw = await dashboardFunctions.getStats('STATION_BRANCH');
    const inventories = await dashboardFunctions.getInventoryLevels();

    return {
      stats: {
        todaySales: (raw as any).today_revenue || 0,
        monthlyFuelDispensed: 0,
        petrolStock: (raw as any).petrol_stock || 0,
        dieselStock: (raw as any).diesel_stock || 0,
        lowStockAlerts: 0,
        pendingReimbursements: (raw as any).pending_reconciliations || 0,
        todayTransactions: (raw as any).today_transactions || 0,
        activeAttendants: (raw as any).active_attendants || 0,
      } as StationAdminDashboardStats,
      dailySalesTrend: [],
      inventoryLevels: inventories.map((i: any) => ({
        label: i.name,
        value: Number(i.petrol_stock) + Number(i.diesel_stock),
      })),
      transactionTrend: [],
    };
  },
};
