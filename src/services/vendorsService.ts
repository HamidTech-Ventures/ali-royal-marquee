
import api from './api';
import type { Vendor } from '../types';

export const vendorsService = {
  getVendors: async (): Promise<Vendor[]> => {
    const response = await api.get('/Vendors');
    return response.data;
  },

  createVendor: async (data: Omit<Vendor, 'id'>): Promise<string> => {
    const response = await api.post('/Vendors', data);
    return response.data;
  },

  updateVendor: async (id: string, data: Vendor): Promise<void> => {
    await api.put(`/Vendors/${id}`, data);
  },

  deleteVendor: async (id: string): Promise<void> => {
    await api.delete(`/Vendors/${id}`);
  },
};
