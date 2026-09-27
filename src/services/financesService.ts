import api from './api';

export const financesService = {
  getOverview: async () => {
    const response = await api.get('/finances/overview');
    return response.data;
  },
  
  getPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  recordPayment: async (data: any) => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  getExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  recordExpense: async (data: any) => {
    const response = await api.post('/expenses', data);
    return response.data;
  }
};
