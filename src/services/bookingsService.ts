import api from './api';
import type { Booking, Payment } from '../types';

export const bookingsService = {
  getBookings: async (params?: { searchTerm?: string; status?: string; startDate?: string; endDate?: string; pageNumber?: number; pageSize?: number }) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (data: Partial<Booking>) => {
    const response = await api.post('/bookings', data);
    return response.data; // { id: string }
  },

  updateBooking: async (id: string, data: Partial<Booking>) => {
    const response = await api.put(`/bookings/${id}`, { id, ...data });
    return response.data;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.put(`/bookings/${id}/status`, { id, status });
    return response.data;
  },

  deleteBooking: async (id: string) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  addPayment: async (id: string, data: Partial<Payment>) => {
    const response = await api.post(`/bookings/${id}/payments`, { bookingId: id, ...data });
    return response.data; // { paymentId: string }
  },

  checkAvailability: async (venueId: string, startTime: string, endTime: string) => {
    const response = await api.get('/bookings/availability', { params: { venueId, startTime, endTime } });
    return response.data; // { available: boolean }
  }
};
