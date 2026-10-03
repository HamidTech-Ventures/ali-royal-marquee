import api from './api';
import type { 
  Enquiry, 
  EnquiryDetail, 
  EnquiryStatus, 
  EnquiryActivityType, 
  FollowUpType,
  CreateEnquiryRequest,
  UpdateEnquiryRequest,
  EnquiryStatsDto,
  EnquiryLifecycleDto
} from '../types';

export interface GetEnquiriesParams {
  searchTerm?: string;
  status?: EnquiryStatus;

  eventType?: string;
  venueId?: string;
  assignedToId?: string;
  preferredDate?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface GetEnquiriesResponse {
  items: Enquiry[];
  totalCount: number;
}

export const enquiriesService = {
  getEnquiries: async (params?: GetEnquiriesParams) => {
    const response = await api.get<GetEnquiriesResponse>('/enquiries', { params });
    return response.data;
  },

  getEnquiryById: async (id: string) => {
    const response = await api.get<EnquiryDetail>(`/enquiries/${id}`);
    return response.data;
  },

  createEnquiry: async (data: CreateEnquiryRequest) => {
    const response = await api.post('/enquiries', data);
    return response.data;
  },

  updateEnquiry: async (id: string, data: UpdateEnquiryRequest) => {
    const response = await api.put(`/enquiries/${id}`, data);
    return response.data;
  },

  deleteEnquiry: async (id: string) => {
    const response = await api.delete(`/enquiries/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: EnquiryStatus) => {
    const response = await api.put(`/enquiries/${id}/status`, { status });
    return response.data;
  },

  markLost: async (id: string, reason: string) => {
    const response = await api.post(`/enquiries/${id}/mark-lost`, { reason });
    return response.data;
  },

  convertToBooking: async (id: string, data: any) => {
    const response = await api.post(`/enquiries/${id}/convert-to-booking`, data);
    return response.data;
  },

  createFollowUp: async (id: string, data: { dueDate: string; dueTime?: string; type: FollowUpType; notes?: string; assignedToId?: string }) => {
    const response = await api.post(`/enquiries/${id}/followups`, data);
    return response.data;
  },

  completeFollowUp: async (id: string, followUpId: string, result?: string) => {
    const response = await api.post(`/enquiries/${id}/followups/${followUpId}/complete`, { result });
    return response.data;
  },

  createActivity: async (id: string, data: { type: EnquiryActivityType; description: string }) => {
    const response = await api.post(`/enquiries/${id}/activities`, data);
    return response.data;
  },

  createQuotation: async (id: string, data: any) => {
    const response = await api.post(`/enquiries/${id}/quotations`, data);
    return response.data;
  },

  createQuotationRevision: async (id: string, quotationId: string, data: Partial<any>) => {
    const response = await api.post(`/enquiries/${id}/quotations/${quotationId}/revision`, data);
    return response.data;
  },

  deleteQuotation: async (id: string, quotationId: string) => {
    const response = await api.delete(`/enquiries/${id}/quotations/${quotationId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<EnquiryStatsDto>('/enquiries/stats');
    return response.data;
  },

  getLifecycle: async (scope: string) => {
    const response = await api.get<EnquiryLifecycleDto>(`/enquiries/lifecycle?scope=${scope}`);
    return response.data;
  },

  exportReportPdf: async (params?: GetEnquiriesParams) => {
    const response = await api.get('/enquiries/export/pdf', {
      params,
      responseType: 'blob', // To handle file download
    });
    return response.data;
  },

  exportQuotationPdf: async (id: string, quotationId: string) => {
    const response = await api.get(`/enquiries/${id}/quotations/${quotationId}/pdf`, {
      responseType: 'blob', // To handle file download
    });
    return response.data;
  }
};
