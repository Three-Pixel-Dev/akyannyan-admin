import { apiClient, type PageAndFilterDTO, type PaginationDTO } from '../../../services/api-client';
import type { MemberLevel, MemberLevelFilter, MemberLevelRequest } from '../types/member-levels.types';

const BASE_URL = '/api/member-levels';

export const memberLevelsService = {
  async getAll(pageAndFilter?: PageAndFilterDTO<MemberLevelFilter>): Promise<PaginationDTO<MemberLevel>> {
    const response = await apiClient.post<PaginationDTO<MemberLevel>>(`${BASE_URL}/pageable`, pageAndFilter || {});
    return response.data;
  },

  async findAllList(): Promise<MemberLevel[]> {
    const response = await apiClient.get<MemberLevel[]>(BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<MemberLevel> {
    const response = await apiClient.get<MemberLevel>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: MemberLevelRequest): Promise<MemberLevel> {
    const response = await apiClient.post<MemberLevel>(BASE_URL, data);
    return response.data;
  },

  async update(id: number, data: MemberLevelRequest): Promise<MemberLevel> {
    const response = await apiClient.put<MemberLevel>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
