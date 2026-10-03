import api from './api';

export const customersService = {
  getCustomers: async () => {
    const response = await api.get(`/customers?t=${new Date().getTime()}`);
    return response.data;
  },

  getCustomerById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data: { name: string; phone: string; email: string }) => {
    const response = await api.post('/customers', data);
    return response.data; // { id: string }
  },

  updateCustomer: async (id: string, data: { id: string, name: string; phone: string; email?: string; tier: string }) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    await api.delete(`/customers/${id}`);
  }
};
