import { apiClient, type PaginationDTO } from '../../../services/api-client';
import type { ContentItem, ContentItemRequest, ContentKind, StorageUploadResult } from '../types/content.types';

const BASE_URL = '/api/v1/admin/content';
const STORAGE_URL = '/api/v1/admin/storage';

export const adminContentService = {
  async list(params?: {
    kind?: ContentKind | 'ALL';
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginationDTO<ContentItem>> {
    const qs = new URLSearchParams();
    if (params?.kind && params.kind !== 'ALL') qs.set('kind', params.kind);
    if (params?.search?.trim()) qs.set('search', params.search.trim());
    qs.set('page', String(params?.page ?? 0));
    qs.set('size', String(params?.size ?? 50));
    const response = await apiClient.get<PaginationDTO<ContentItem>>(`${BASE_URL}?${qs.toString()}`);
    return response.data;
  },

  async get(id: number): Promise<ContentItem> {
    const response = await apiClient.get<ContentItem>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(req: ContentItemRequest): Promise<ContentItem> {
    const response = await apiClient.post<ContentItem>(BASE_URL, req);
    return response.data;
  },

  async update(id: number, req: ContentItemRequest): Promise<ContentItem> {
    const response = await apiClient.put<ContentItem>(`${BASE_URL}/${id}`, req);
    return response.data;
  },

  async publish(id: number, published: boolean): Promise<ContentItem> {
    const response = await apiClient.patch<ContentItem>(`${BASE_URL}/${id}/publish`, { published });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async upload(file: File, purpose: 'cover' | 'video' | 'audio'): Promise<StorageUploadResult> {
    const response = await apiClient.upload<StorageUploadResult>(`${STORAGE_URL}/upload`, file, purpose);
    return response.data;
  },
};
