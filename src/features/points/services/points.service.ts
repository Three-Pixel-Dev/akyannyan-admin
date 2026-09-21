import { apiClient, type PageAndFilterDTO, type PaginationDTO } from '../../../services/api-client';
import type {
  PointsConfig,
  PointsConfigUpdateRequest,
  TopupCode,
  TopupCodeBulkGenerateRequest,
  PointsTransaction,
} from '../types/points.types';

const BASE_URL = '/api/v1/admin/points';

export const adminPointsService = {
  // Stage Point Configurations
  async getConfigs(): Promise<PointsConfig[]> {
    const response = await apiClient.get<any[]>(`${BASE_URL}/configs`);
    const list = response.data || [];
    return list.map((item: any) => ({
      id: item.id,
      featureKey: item.featureKey,
      featureName: item.featureName,
      costPoints: item.costPoints !== undefined ? item.costPoints : (item.basePointCost ?? 0),
      isEnabled: item.isEnabled !== undefined ? item.isEnabled : (item.isEnable ?? true),
      description: item.description || '',
      category: item.category || (
        item.featureKey?.includes('TAROT') ? 'TAROT' :
        item.featureKey?.includes('HORARY') || item.featureKey?.includes('KP') ? 'HORARY' :
        item.featureKey?.includes('DAY') ? 'CALENDAR' :
        item.featureKey?.includes('COMPATIBILITY') ? 'COMPATIBILITY' :
        item.featureKey?.includes('BPZ') ? 'ANALYSIS' :
        item.featureKey?.includes('REMEDY') ? 'REMEDY' :
        'ASTROLOGY'
      ),
      createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
  },

  async updateConfig(key: string, req: PointsConfigUpdateRequest): Promise<PointsConfig> {
    const response = await apiClient.put<any>(`${BASE_URL}/configs/${key}`, req);
    const item = response.data || {};
    return {
      id: item.id,
      featureKey: item.featureKey || key,
      featureName: item.featureName || '',
      costPoints: item.costPoints !== undefined ? item.costPoints : (item.basePointCost ?? req.costPoints),
      isEnabled: item.isEnabled !== undefined ? item.isEnabled : (item.isEnable ?? req.isEnabled),
      description: item.description ?? req.description,
      category: item.category,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    };
  },

  // Topup Voucher Codes
  async getTopupCodes(pageAndFilter?: PageAndFilterDTO<string>): Promise<PaginationDTO<TopupCode>> {
    const response = await apiClient.post<PaginationDTO<TopupCode>>(
      `${BASE_URL}/topup-codes/list`,
      pageAndFilter || {}
    );
    return response.data;
  },

  async bulkGenerateCodes(req: TopupCodeBulkGenerateRequest): Promise<TopupCode[]> {
    const response = await apiClient.post<TopupCode[]>(`${BASE_URL}/topup-codes/generate`, req);
    return response.data || [];
  },

  async deleteTopupCode(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/topup-codes/${id}`);
  },

  // Points Ledger Transactions
  async getTransactions(page = 0, size = 10): Promise<PaginationDTO<PointsTransaction>> {
    const response = await apiClient.get<PaginationDTO<PointsTransaction>>(
      `${BASE_URL}/transactions?page=${page}&size=${size}`
    );
    return response.data;
  },
};
