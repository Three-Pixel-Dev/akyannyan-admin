import { apiClient, type PaginationDTO } from '../../../services/api-client';
import type { CreateCampaignPayload, NotificationCampaign } from '../types/notifications.types';

const BASE_URL = '/api/v1/admin/notifications/campaigns';

export const notificationsService = {
  async list(page = 0, size = 30): Promise<PaginationDTO<NotificationCampaign>> {
    const response = await apiClient.post<PaginationDTO<NotificationCampaign>>(`${BASE_URL}/pageable`, {
      page,
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    });
    return response.data;
  },

  async getById(id: number): Promise<NotificationCampaign> {
    const response = await apiClient.get<NotificationCampaign>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(payload: CreateCampaignPayload): Promise<NotificationCampaign> {
    const response = await apiClient.post<NotificationCampaign>(BASE_URL, payload);
    return response.data;
  },

  async cancel(id: number): Promise<NotificationCampaign> {
    const response = await apiClient.post<NotificationCampaign>(`${BASE_URL}/${id}/cancel`);
    return response.data;
  },
};
