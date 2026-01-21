import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Transaction, PaginatedResponse } from '@/types';
import { transactionsService } from '@/services/transactionsService';

interface TransactionsState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  selectedTransaction: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetch',
  async (params: {
    page?: number;
    startDate?: string;
    endDate?: string;
    fuelType?: string;
    mode?: string;
    stationId?: string;
    userId?: string;
  }) => {
    const response = await transactionsService.getTransactions(params);
    return response;
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchById',
  async (id: string) => {
    const response = await transactionsService.getTransactionById(id);
    return response;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.selectedTransaction = action.payload;
      });
  },
});

export const { clearSelected } = transactionsSlice.actions;
export default transactionsSlice.reducer;
