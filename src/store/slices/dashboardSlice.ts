import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardStats, ChartData, SuperAdminDashboardStats, GovernmentAdminDashboardStats, StationAdminDashboardStats } from '@/types';
import { dashboardService } from '@/services/dashboardService';

interface DashboardState {
  stats: DashboardStats | null;
  superAdminStats: SuperAdminDashboardStats | null;
  governmentAdminStats: GovernmentAdminDashboardStats | null;
  hqAdminStats: StationAdminDashboardStats | null;
  branchAdminStats: StationAdminDashboardStats | null;
  monthlySubsidyTrend: ChartData[];
  paidFuelSalesTrend: ChartData[];
  fuelTypeDistribution: ChartData[];
  stationWiseVolume: ChartData[];
  monthlyFuelUsage: ChartData[];
  budgetVsConsumption: ChartData[];
  subsidyVsCommercial: ChartData[];
  monthlyAllocationTrend: ChartData[];
  departmentBreakdown: ChartData[];
  usageMonitoring: ChartData[];
  dailySalesTrend: ChartData[];
  inventoryLevels: ChartData[];
  transactionTrend: ChartData[];
  liveFeed: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  superAdminStats: null,
  governmentAdminStats: null,
  hqAdminStats: null,
  branchAdminStats: null,
  monthlySubsidyTrend: [],
  paidFuelSalesTrend: [],
  fuelTypeDistribution: [],
  stationWiseVolume: [],
  monthlyFuelUsage: [],
  budgetVsConsumption: [],
  subsidyVsCommercial: [],
  monthlyAllocationTrend: [],
  departmentBreakdown: [],
  usageMonitoring: [],
  dailySalesTrend: [],
  inventoryLevels: [],
  transactionTrend: [],
  liveFeed: [],
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    const response = await dashboardService.getDashboardData();
    return response;
  }
);

export const fetchSuperAdminDashboard = createAsyncThunk(
  'dashboard/fetchSuperAdmin',
  async () => {
    const response = await dashboardService.getSuperAdminDashboard();
    return response;
  }
);

export const fetchGovernmentAdminDashboard = createAsyncThunk(
  'dashboard/fetchGovernmentAdmin',
  async () => {
    const response = await dashboardService.getGovernmentAdminDashboard();
    return response;
  }
);

export const fetchHQDashboard = createAsyncThunk(
  'dashboard/fetchHQ',
  async () => {
    const response = await dashboardService.getHQDashboard();
    return response;
  }
);

export const fetchBranchDashboard = createAsyncThunk(
  'dashboard/fetchBranch',
  async () => {
    const response = await dashboardService.getBranchDashboard();
    return response;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addLiveFeedItem: (state, action) => {
      state.liveFeed.unshift(action.payload);
      if (state.liveFeed.length > 50) {
        state.liveFeed = state.liveFeed.slice(0, 50);
      }
    },
    clearLiveFeed: (state) => {
      state.liveFeed = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.monthlySubsidyTrend = action.payload.monthlySubsidyTrend;
        state.paidFuelSalesTrend = action.payload.paidFuelSalesTrend;
        state.fuelTypeDistribution = action.payload.fuelTypeDistribution;
        state.stationWiseVolume = action.payload.stationWiseVolume;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      })
      .addCase(fetchSuperAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuperAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.superAdminStats = action.payload.stats;
        state.monthlyFuelUsage = action.payload.monthlyFuelUsage || [];
        state.budgetVsConsumption = action.payload.budgetVsConsumption || [];
        state.subsidyVsCommercial = action.payload.subsidyVsCommercial || [];
      })
      .addCase(fetchSuperAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch super admin dashboard';
      })
      .addCase(fetchGovernmentAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGovernmentAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.governmentAdminStats = action.payload.stats;
        state.monthlyAllocationTrend = action.payload.monthlyAllocationTrend || [];
        state.departmentBreakdown = action.payload.departmentBreakdown || [];
        state.usageMonitoring = action.payload.usageMonitoring || [];
      })
      .addCase(fetchGovernmentAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch government admin dashboard';
      })
      .addCase(fetchHQDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHQDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.hqAdminStats = action.payload.stats;
        state.dailySalesTrend = action.payload.dailySalesTrend || [];
        state.inventoryLevels = action.payload.inventoryLevels || [];
        state.transactionTrend = action.payload.transactionTrend || [];
      })
      .addCase(fetchHQDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch hq dashboard';
      })
      .addCase(fetchBranchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.branchAdminStats = action.payload.stats;
        state.dailySalesTrend = action.payload.dailySalesTrend || [];
        state.inventoryLevels = action.payload.inventoryLevels || [];
        state.transactionTrend = action.payload.transactionTrend || [];
      })
      .addCase(fetchBranchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch branch dashboard';
      });
  },
});

export const { addLiveFeedItem, clearLiveFeed } = dashboardSlice.actions;
export default dashboardSlice.reducer;
