import { createClient } from '@/utils/supabase/client';
import { Station, PaginatedResponse, FuelType } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

const supabase = createClient();

export const stationsService = {
  async getStations(params: {
    page?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Station>> {
    const page = params.page || 1;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('stations')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,location.ilike.%${params.search}%`);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, count, error } = await query
      .order('name', { ascending: true })
      .range(from, to);

    if (error) throw error;

    const formattedData: Station[] = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      stationCode: item.station_code,
      location: item.location,
      fuelTypes: item.fuel_types as FuelType[],
      petrolStock: Number(item.petrol_stock),
      dieselStock: Number(item.diesel_stock),
      lowStockThreshold: Number(item.low_stock_threshold),
      status: item.status,
      createdAt: item.created_at,
    }));

    return {
      data: formattedData,
      total: count || 0,
      page,
      limit: PAGE_SIZE,
      totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    };
  },

  async getStationById(id: string): Promise<Station> {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      stationCode: data.station_code,
      location: data.location,
      fuelTypes: data.fuel_types as FuelType[],
      petrolStock: Number(data.petrol_stock),
      dieselStock: Number(data.diesel_stock),
      lowStockThreshold: Number(data.low_stock_threshold),
      status: data.status,
      createdAt: data.created_at,
    };
  },

  async createStation(data: Partial<Station>): Promise<Station> {
    const { data: newStation, error } = await supabase
      .from('stations')
      .insert({
        name: data.name,
        station_code: data.stationCode,
        location: data.location,
        fuel_types: data.fuelTypes,
        low_stock_threshold: data.lowStockThreshold,
        status: data.status || 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: newStation.id,
      name: newStation.name,
      stationCode: newStation.station_code,
      location: newStation.location,
      fuelTypes: newStation.fuel_types as FuelType[],
      petrolStock: Number(newStation.petrol_stock),
      dieselStock: Number(newStation.diesel_stock),
      lowStockThreshold: Number(newStation.low_stock_threshold),
      status: newStation.status,
      createdAt: newStation.created_at,
    };
  },

  async updateStation(id: string, updates: Partial<Station>): Promise<Station> {
    const { data: updatedStation, error } = await supabase
      .from('stations')
      .update({
        name: updates.name,
        station_code: updates.stationCode,
        location: updates.location,
        fuel_types: updates.fuelTypes,
        low_stock_threshold: updates.lowStockThreshold,
        status: updates.status,
        petrol_stock: updates.petrolStock,
        diesel_stock: updates.dieselStock,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: updatedStation.id,
      name: updatedStation.name,
      stationCode: updatedStation.station_code,
      location: updatedStation.location,
      fuelTypes: updatedStation.fuel_types as FuelType[],
      petrolStock: Number(updatedStation.petrol_stock),
      dieselStock: Number(updatedStation.diesel_stock),
      lowStockThreshold: Number(updatedStation.low_stock_threshold),
      status: updatedStation.status,
      createdAt: updatedStation.created_at,
    };
  },
};
