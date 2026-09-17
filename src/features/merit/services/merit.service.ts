import { apiClient } from '../../../services/api-client';
import type { MeritMonthProgram } from '../types/merit.types';

const BASE = '/api/v1/admin/merit/months';

export const adminMeritService = {
  async getMonth(year: number, month: number): Promise<MeritMonthProgram> {
    const response = await apiClient.get<MeritMonthProgram>(`${BASE}/${year}/${month}`);
    return response.data;
  },

  async saveMonth(year: number, month: number, body: MeritMonthProgram): Promise<MeritMonthProgram> {
    const response = await apiClient.put<MeritMonthProgram>(`${BASE}/${year}/${month}`, body);
    return response.data;
  },

  async publish(year: number, month: number, published: boolean): Promise<MeritMonthProgram> {
    const response = await apiClient.post<MeritMonthProgram>(`${BASE}/${year}/${month}/publish`, { published });
    return response.data;
  },

  async copyFrom(year: number, month: number, fromYear: number, fromMonth: number): Promise<MeritMonthProgram> {
    const response = await apiClient.post<MeritMonthProgram>(`${BASE}/${year}/${month}/copy-from`, {
      year: fromYear,
      month: fromMonth,
    });
    return response.data;
  },
};
