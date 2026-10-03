import api from './api';

export interface VenueDto {
  id: string;
  name: string;
  capacity: number;
  description?: string;
}

export interface StaffDto {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
}

export const referenceService = {
  
  addVenue: async (data: any): Promise<string> => {
    const response = await api.post('/venues', data);
    return response.data;
  },
  updateVenue: async (id: string, data: any): Promise<void> => {
    await api.put(`/venues/${id}`, data);
  },
  getVenues: async (): Promise<VenueDto[]> => {
    const response = await api.get<VenueDto[]>('/venues');
    return response.data;
  },

  getStaff: async (): Promise<StaffDto[]> => {
    const response = await api.get<StaffDto[]>('/users/staff');
    return response.data;
  }
};
