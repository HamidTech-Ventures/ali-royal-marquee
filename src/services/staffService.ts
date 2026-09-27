import api from './api';
import type { Staff } from '../types';

export const staffService = {
  getStaff: async (): Promise<Staff[]> => {
    const response = await api.get('/Staff');
    return response.data;
  },

  createStaff: async (staff: Omit<Staff, 'id'>): Promise<string> => {
    const response = await api.post('/Staff', staff);
    return response.data;
  },

  updateStaff: async (id: string, staff: Staff): Promise<void> => {
    await api.put(`/Staff/${id}`, staff);
  },

  deleteStaff: async (id: string): Promise<void> => {
    await api.delete(`/Staff/${id}`);
  }
};
