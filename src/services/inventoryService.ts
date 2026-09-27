import api from './api';
import type { InventoryItem } from '../types';

export const inventoryService = {
  getInventoryItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory');
    return response.data;
  },

  createInventoryItem: async (data: Omit<InventoryItem, 'id' | 'status'>): Promise<string> => {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  updateInventoryItem: async (id: string, data: Omit<InventoryItem, 'id' | 'status'>): Promise<void> => {
    await api.put(`/inventory/${id}`, { id, ...data });
  },

  deleteInventoryItem: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  }
};
