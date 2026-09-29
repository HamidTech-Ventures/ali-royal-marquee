import api from './api';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

export const settingsApi = {
  getSettings: async (): Promise<SystemSetting[]> => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settings: SystemSetting[]): Promise<void> => {
    await api.put('/settings', settings);
  }
};
