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
  getVenues: async (): Promise<VenueDto[]> => {
    const response = await api.get<VenueDto[]>('/venues');
    return response.data;
  },

  getStaff: async (): Promise<StaffDto[]> => {
    const response = await api.get<StaffDto[]>('/users/staff');
    return response.data;
  }
};
