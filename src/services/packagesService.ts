import api from './api';

export interface Package {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
  minGuests: number;
  profitMarginTarget?: number;
  internalNotes?: string;
  inclusionsJson?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Addon {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  unit: string;
}

export interface PricingRule {
  id: string;
  name: string;
  ruleType: string;
  flatAmount?: number;
  percentageAmount?: number;
}

export const packagesService = {
  getPackages: async (): Promise<Package[]> => {
    const response = await api.get<Package[]>('/packages');
    return response.data;
  },

  createPackage: async (data: Omit<Package, 'id'>): Promise<string> => {
    const response = await api.post<string>('/packages', data);
    return response.data;
  },

  getPackage: async (id: string): Promise<Package> => {
    const response = await api.get<Package>(`/packages/${id}`);
    return response.data;
  },

  updatePackage: async (id: string, data: Package): Promise<void> => {
    await api.put(`/packages/${id}`, data);
  },

  deletePackage: async (id: string): Promise<void> => {
    await api.delete(`/packages/${id}`);
  },

  // --- Menu Items ---
  getMenuItems: async (): Promise<MenuItem[]> => {
    const response = await api.get<MenuItem[]>('/packages/menu-items');
    return response.data;
  },
  createMenuItem: async (data: Omit<MenuItem, 'id'>): Promise<string> => {
    const response = await api.post<string>('/packages/menu-items', data);
    return response.data;
  },
  updateMenuItem: async (id: string, data: MenuItem): Promise<void> => {
    await api.put(`/packages/menu-items/${id}`, data);
  },
  deleteMenuItem: async (id: string): Promise<void> => {
    await api.delete(`/packages/menu-items/${id}`);
  },

  // --- Addons ---
  getAddons: async (): Promise<Addon[]> => {
    const response = await api.get<Addon[]>('/packages/addons');
    return response.data;
  },
  createAddon: async (data: Omit<Addon, 'id'>): Promise<string> => {
    const response = await api.post<string>('/packages/addons', data);
    return response.data;
  },
  updateAddon: async (id: string, data: Addon): Promise<void> => {
    await api.put(`/packages/addons/${id}`, data);
  },
  deleteAddon: async (id: string): Promise<void> => {
    await api.delete(`/packages/addons/${id}`);
  },

  // --- Pricing Rules ---
  getPricingRules: async (): Promise<PricingRule[]> => {
    const response = await api.get<PricingRule[]>('/packages/pricing-rules');
    return response.data;
  },
  createPricingRule: async (data: Omit<PricingRule, 'id'>): Promise<string> => {
    const response = await api.post<string>('/packages/pricing-rules', data);
    return response.data;
  },
  updatePricingRule: async (id: string, data: PricingRule): Promise<void> => {
    await api.put(`/packages/pricing-rules/${id}`, data);
  },
  deletePricingRule: async (id: string): Promise<void> => {
    await api.delete(`/packages/pricing-rules/${id}`);
  }
};
