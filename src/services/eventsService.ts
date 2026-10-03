import api from './api';

export const eventsService = {
  createFromBooking: async (bookingId: string) => {
    const response = await api.post(`/events/from-booking/${bookingId}`);
    return response.data;
  },

  getEvents: async () => {
    const response = await api.get('/events');
    return response.data; // List of EventDto
  },

  getEventById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data; // EventDetailsDto
  },

  updateEvent: async (id: string, title: string, managerId: string, staffRequired: number) => {
    const response = await api.put(`/events/${id}`, { id, title, managerId, staffRequired });
    return response.data;
  },

  addTask: async (id: string, title: string, assignee: string, dueTime: string) => {
    const response = await api.post(`/events/${id}/tasks`, { eventId: id, title, assignee, dueTime });
    return response.data;
  },

  updateTaskStatus: async (eventId: string, taskId: string, status: string, progress: number) => {
    const response = await api.put(`/events/${eventId}/tasks/${taskId}`, { taskId, status, progress });
    return response.data;
  },

  addStaff: async (id: string, name: string, role: string, staffMemberId?: string) => {
    const response = await api.post(`/events/${id}/staff`, { eventId: id, name, role, staffMemberId });
    return response.data;
  },

  removeStaff: async (id: string, staffMemberId: string) => {
    const response = await api.delete(`/events/${id}/staff/${staffMemberId}`);
    return response.data;
  },

  addMenuItem: async (id: string, name: string, category: string, quantity: number, notes: string) => {
    const response = await api.post(`/events/${id}/menu`, { eventId: id, name, category, quantity, notes });
    return response.data;
  }
};
