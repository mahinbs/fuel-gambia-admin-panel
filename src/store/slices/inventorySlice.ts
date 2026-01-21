import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Inventory } from '@/types';
import { inventoryService } from '@/services/inventoryService';

interface InventoryState {
  inventories: Inventory[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  inventories: [],
  loading: false,
  error: null,
};

export const fetchInventories = createAsyncThunk(
  'inventory/fetch',
  async () => {
    const response = await inventoryService.getInventories();
    return response;
  }
);

export const updateInventory = createAsyncThunk(
  'inventory/update',
  async (data: { stationId: string; fuelType: string; quantity: number; action: string }) => {
    const response = await inventoryService.updateInventory(
      data.stationId,
      data.fuelType,
      data.quantity,
      data.action
    );
    return response;
  }
);

export const syncInventory = createAsyncThunk(
  'inventory/sync',
  async (stationId: string) => {
    const response = await inventoryService.syncInventory(stationId);
    return response;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventories.fulfilled, (state, action) => {
        state.loading = false;
        state.inventories = action.payload;
      })
      .addCase(fetchInventories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventories';
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        const index = state.inventories.findIndex((i) => i.stationId === action.payload.stationId);
        if (index !== -1) {
          state.inventories[index] = action.payload;
        }
      })
      .addCase(syncInventory.fulfilled, (state, action) => {
        const index = state.inventories.findIndex((i) => i.stationId === action.payload.stationId);
        if (index !== -1) {
          state.inventories[index] = action.payload;
        }
      });
  },
});

export default inventorySlice.reducer;
