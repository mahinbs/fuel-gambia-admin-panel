import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Station, PaginatedResponse } from '@/types';
import { stationsService } from '@/services/stationsService';

interface StationsState {
  stations: Station[];
  selectedStation: Station | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: StationsState = {
  stations: [],
  selectedStation: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
};

export const fetchStations = createAsyncThunk(
  'stations/fetch',
  async (params: { page?: number; search?: string; status?: string }) => {
    const response = await stationsService.getStations(params);
    return response;
  }
);

export const fetchStationById = createAsyncThunk(
  'stations/fetchById',
  async (id: string) => {
    const response = await stationsService.getStationById(id);
    return response;
  }
);

export const createStation = createAsyncThunk(
  'stations/create',
  async (data: Partial<Station>) => {
    const response = await stationsService.createStation(data);
    return response;
  }
);

export const updateStation = createAsyncThunk(
  'stations/update',
  async (data: { id: string; updates: Partial<Station> }) => {
    const response = await stationsService.updateStation(data.id, data.updates);
    return response;
  }
);

const stationsSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedStation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stations';
      })
      .addCase(fetchStationById.fulfilled, (state, action) => {
        state.selectedStation = action.payload;
      })
      .addCase(createStation.fulfilled, (state, action) => {
        state.stations.unshift(action.payload);
      })
      .addCase(updateStation.fulfilled, (state, action) => {
        const index = state.stations.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.stations[index] = action.payload;
        }
        if (state.selectedStation?.id === action.payload.id) {
          state.selectedStation = action.payload;
        }
      });
  },
});

export const { clearSelected } = stationsSlice.actions;
export default stationsSlice.reducer;
