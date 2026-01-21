import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Customer, PaginatedResponse } from '@/types';
import { customersService } from '@/services/customersService';

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  'customers/fetch',
  async (params: { page?: number; search?: string; status?: string }) => {
    const response = await customersService.getCustomers(params);
    return response;
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (id: string) => {
    const response = await customersService.getCustomerById(id);
    return response;
  }
);

export const suspendCustomer = createAsyncThunk(
  'customers/suspend',
  async (id: string) => {
    const response = await customersService.suspendCustomer(id);
    return response;
  }
);

export const activateCustomer = createAsyncThunk(
  'customers/activate',
  async (id: string) => {
    const response = await customersService.activateCustomer(id);
    return response;
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.selectedCustomer = action.payload;
      })
      .addCase(suspendCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(activateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      });
  },
});

export const { clearSelected } = customersSlice.actions;
export default customersSlice.reducer;
