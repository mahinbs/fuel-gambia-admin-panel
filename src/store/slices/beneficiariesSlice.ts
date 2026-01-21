import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Beneficiary, PaginatedResponse } from '@/types';
import { beneficiariesService } from '@/services/beneficiariesService';

interface BeneficiariesState {
  beneficiaries: Beneficiary[];
  selectedBeneficiary: Beneficiary | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: BeneficiariesState = {
  beneficiaries: [],
  selectedBeneficiary: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
};

export const fetchBeneficiaries = createAsyncThunk(
  'beneficiaries/fetch',
  async (params: { page?: number; search?: string; status?: string; department?: string }) => {
    const response = await beneficiariesService.getBeneficiaries(params);
    return response;
  }
);

export const fetchBeneficiaryById = createAsyncThunk(
  'beneficiaries/fetchById',
  async (id: string) => {
    const response = await beneficiariesService.getBeneficiaryById(id);
    return response;
  }
);

export const verifyBeneficiary = createAsyncThunk(
  'beneficiaries/verify',
  async (data: { id: string; status: string; rejectionReason?: string }) => {
    const response = await beneficiariesService.verifyBeneficiary(data.id, data.status, data.rejectionReason);
    return response;
  }
);

export const updateAllocation = createAsyncThunk(
  'beneficiaries/updateAllocation',
  async (data: { id: string; monthlyAllocation: number; fuelType: string }) => {
    const response = await beneficiariesService.updateAllocation(data.id, data.monthlyAllocation, data.fuelType);
    return response;
  }
);

const beneficiariesSlice = createSlice({
  name: 'beneficiaries',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedBeneficiary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.loading = false;
        state.beneficiaries = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch beneficiaries';
      })
      .addCase(fetchBeneficiaryById.fulfilled, (state, action) => {
        state.selectedBeneficiary = action.payload;
      })
      .addCase(verifyBeneficiary.fulfilled, (state, action) => {
        const index = state.beneficiaries.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.beneficiaries[index] = action.payload;
        }
        if (state.selectedBeneficiary?.id === action.payload.id) {
          state.selectedBeneficiary = action.payload;
        }
      })
      .addCase(updateAllocation.fulfilled, (state, action) => {
        const index = state.beneficiaries.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.beneficiaries[index] = action.payload;
        }
        if (state.selectedBeneficiary?.id === action.payload.id) {
          state.selectedBeneficiary = action.payload;
        }
      });
  },
});

export const { clearSelected } = beneficiariesSlice.actions;
export default beneficiariesSlice.reducer;
