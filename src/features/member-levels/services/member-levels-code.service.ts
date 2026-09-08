import { apiClient, type PageAndFilterDTO, type PaginationDTO } from '../../../services/api-client';
import type {
  MemberLevelCode,
  MemberLevelCodeBulkGenerateRequest,
  MemberLevelCodeFilter,
  MemberLevelCodeRequest,
} from '../types/member-levels-code.types';

const BASE_URL = '/api/member-levels-codes';

export const memberLevelsCodeService = {
  async getAll(
    pageAndFilter?: PageAndFilterDTO<MemberLevelCodeFilter>
  ): Promise<PaginationDTO<MemberLevelCode>> {
    const response = await apiClient.post<PaginationDTO<MemberLevelCode>>(`${BASE_URL}/pageable`, pageAndFilter || {});
    return response.data;
  },

  async getById(id: number): Promise<MemberLevelCode> {
    const response = await apiClient.get<MemberLevelCode>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: MemberLevelCodeRequest): Promise<MemberLevelCode> {
    const response = await apiClient.post<MemberLevelCode>(BASE_URL, data);
    return response.data;
  },

  async bulkGenerate(data: MemberLevelCodeBulkGenerateRequest): Promise<MemberLevelCode[]> {
    const response = await apiClient.post<MemberLevelCode[]>(`${BASE_URL}/bulk-generate`, data);
    return response.data;
  },

  async update(id: number, data: MemberLevelCodeRequest): Promise<MemberLevelCode> {
    const response = await apiClient.put<MemberLevelCode>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async getByMemberLevelId(memberLevelId: number): Promise<MemberLevelCode[]> {
    const response = await apiClient.get<MemberLevelCode[]>(`${BASE_URL}/member-levels/${memberLevelId}`);
    return response.data;
  },
};
