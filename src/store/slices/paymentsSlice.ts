import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Payment, PaginatedResponse } from '@/types';
import { paymentsService } from '@/services/paymentsService';

interface PaymentsState {
  payments: Payment[];
  selectedPayment: Payment | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  selectedPayment: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  'payments/fetch',
  async (params: {
    page?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await paymentsService.getPayments(params);
    return response;
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payments/fetchById',
  async (id: string) => {
    const response = await paymentsService.getPaymentById(id);
    return response;
  }
);

export const retryPayment = createAsyncThunk(
  'payments/retry',
  async (id: string) => {
    const response = await paymentsService.retryPayment(id);
    return response;
  }
);

export const processRefund = createAsyncThunk(
  'payments/refund',
  async (id: string) => {
    const response = await paymentsService.processRefund(id);
    return response;
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.selectedPayment = action.payload;
      })
      .addCase(retryPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      });
  },
});

export const { clearSelected } = paymentsSlice.actions;
export default paymentsSlice.reducer;
