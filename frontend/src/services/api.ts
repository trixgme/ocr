import axios from 'axios';
import type {
  OCRResultResponse,
  HistoryListResponse,
  StructureResultResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// OCR API
export const ocrApi = {
  // Process image with OCR
  processImage: async (file: File): Promise<OCRResultResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<OCRResultResponse>('/ocr/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Process PDF with OCR
  processPdf: async (file: File): Promise<OCRResultResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<OCRResultResponse>('/ocr/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for PDF processing
    });
    return response.data;
  },

  // Analyze document structure
  analyzeStructure: async (file: File): Promise<StructureResultResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<StructureResultResponse>('/ocr/structure', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get OCR result by ID
  getResult: async (id: string): Promise<OCRResultResponse> => {
    const response = await api.get<OCRResultResponse>(`/ocr/result/${id}`);
    return response.data;
  },
};

// History API
export const historyApi = {
  // List history with pagination
  list: async (
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<HistoryListResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (status) {
      params.append('status', status);
    }

    const response = await api.get<HistoryListResponse>(`/history?${params.toString()}`);
    return response.data;
  },

  // Get history detail
  getDetail: async (id: string): Promise<OCRResultResponse> => {
    const response = await api.get<OCRResultResponse>(`/history/${id}`);
    return response.data;
  },

  // Delete history item
  delete: async (id: string): Promise<void> => {
    await api.delete(`/history/${id}`);
  },

  // Delete all history
  deleteAll: async (): Promise<void> => {
    await api.delete('/history');
  },
};

export default api;
