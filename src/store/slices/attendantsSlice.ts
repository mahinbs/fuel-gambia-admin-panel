import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Attendant, PaginatedResponse } from '@/types';
import { attendantsService } from '@/services/attendantsService';

interface AttendantsState {
  attendants: Attendant[];
  selectedAttendant: Attendant | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: AttendantsState = {
  attendants: [],
  selectedAttendant: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
};

export const fetchAttendants = createAsyncThunk(
  'attendants/fetch',
  async (params: { page?: number; search?: string; stationId?: string; status?: string }) => {
    const response = await attendantsService.getAttendants(params);
    return response;
  }
);

export const fetchAttendantById = createAsyncThunk(
  'attendants/fetchById',
  async (id: string) => {
    const response = await attendantsService.getAttendantById(id);
    return response;
  }
);

export const bindDevice = createAsyncThunk(
  'attendants/bindDevice',
  async (data: { id: string; deviceId: string }) => {
    const response = await attendantsService.bindDevice(data.id, data.deviceId);
    return response;
  }
);

export const suspendAttendant = createAsyncThunk(
  'attendants/suspend',
  async (id: string) => {
    const response = await attendantsService.suspendAttendant(id);
    return response;
  }
);

export const createAttendant = createAsyncThunk(
  'attendants/create',
  async (data: { name: string; phoneNumber: string; email?: string; stationId: string; stationName: string }) => {
    const response = await attendantsService.createAttendant(data);
    return response;
  }
);

export const deleteAttendant = createAsyncThunk(
  'attendants/delete',
  async (id: string) => {
    await attendantsService.deleteAttendant(id);
    return id;
  }
);

const attendantsSlice = createSlice({
  name: 'attendants',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedAttendant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendants.fulfilled, (state, action) => {
        state.loading = false;
        state.attendants = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchAttendants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch attendants';
      })
      .addCase(fetchAttendantById.fulfilled, (state, action) => {
        state.selectedAttendant = action.payload;
      })
      .addCase(bindDevice.fulfilled, (state, action) => {
        const index = state.attendants.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.attendants[index] = action.payload;
        }
      })
      .addCase(suspendAttendant.fulfilled, (state, action) => {
        const index = state.attendants.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.attendants[index] = action.payload;
        }
      })
      .addCase(createAttendant.fulfilled, (state, action) => {
        state.attendants.unshift(action.payload);
        state.total += 1;
      })
      .addCase(deleteAttendant.fulfilled, (state, action) => {
        state.attendants = state.attendants.filter((a) => a.id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearSelected } = attendantsSlice.actions;
export default attendantsSlice.reducer;
