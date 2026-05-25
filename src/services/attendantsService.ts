import { createClient } from '@/utils/supabase/client';
import { Attendant, PaginatedResponse } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

const supabase = createClient();

export const attendantsService = {
  async getAttendants(params: {
    page?: number;
    search?: string;
    stationId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Attendant>> {
    const page = params.page || 1;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('profiles')
      .select(`
        *,
        attendant:attendants!attendants_id_fkey(*, station:stations(name))
      `, { count: 'exact' })
      .eq('role', 'ATTENDANT');

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,phone_number.ilike.%${params.search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedData: Attendant[] = (data || []).map(item => {
      const a = (item as any).attendant;
      return {
        id: item.id,
        phoneNumber: item.phone_number,
        role: item.role as any,
        name: item.name,
        email: item.email,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        stationId: a?.station_id,
        stationName: a?.station?.name || 'Unknown',
        status: a?.status || 'ACTIVE',
      };
    });

    return {
      data: formattedData,
      total: count || 0,
      page,
      limit: PAGE_SIZE,
      totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    };
  },

  async getAttendantById(id: string): Promise<Attendant> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        attendant:attendants!attendants_id_fkey(*, station:stations(name))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const a = (data as any).attendant;
    return {
      id: data.id,
      phoneNumber: data.phone_number,
      role: data.role as any,
      name: data.name,
      email: data.email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      stationId: a?.station_id,
      stationName: a?.station?.name || 'Unknown',
      status: a?.status || 'ACTIVE',
    };
  },

  async suspendAttendant(id: string): Promise<Attendant> {
    const { error } = await supabase
      .from('attendants')
      .update({ status: 'SUSPENDED' })
      .eq('id', id);

    if (error) throw error;
    return this.getAttendantById(id);
  },

  async createAttendant(data: {
    name: string;
    phoneNumber: string;
    email?: string;
    stationId: string;
  }): Promise<Attendant> {
    // Note: Creating an attendant usually involves creating an auth user too.
    // This part should ideally call a Supabase Edge Function or be handled by the UI signup flow.
    // For now, we'll assume the profile already exists or is created elsewhere.
    const { data: newAttendant, error } = await supabase
      .from('attendants')
      .insert({
        id: (data as any).id, // Assuming ID is passed from a created auth user
        station_id: data.stationId,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw error;
    return this.getAttendantById(newAttendant.id);
  },

  async deleteAttendant(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async bindDevice(id: string, deviceId: string): Promise<Attendant> {
    // In a real app, you'd store this in the attendants table
    const { error } = await supabase
      .from('attendants')
      .update({ device_id: deviceId }) // If column exists
      .eq('id', id);

    if (error) throw error;
    return this.getAttendantById(id);
  },
};
