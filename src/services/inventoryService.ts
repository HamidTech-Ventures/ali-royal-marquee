import api from './api';
import type { InventoryItem } from '../types';

export const inventoryService = {

  getInventoryItemById: async (id: string): Promise<InventoryItem> => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  addInventoryReservation: async (data: any): Promise<string> => {
    const response = await api.post('/inventory/reservations', data);
    return response.data;
  },

  addInventoryMovement: async (data: any): Promise<string> => {
    const response = await api.post('/inventory/movements', data);
    return response.data;
  },

  updateInventoryItemDetails: async (id: string, data: any): Promise<void> => {
    await api.put(`/inventory/${id}/details`, data);
  },
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
