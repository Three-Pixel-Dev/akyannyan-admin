package com.expnai.akyannyan.features.oracle;

import type { OraclePromptTemplateDto, OraclePromptTemplateRequest } from '../types/oracle.types';
import { apiClient } from '../../../services/api-client';

const BASE_URL = '/api/v1/admin/oracle/prompts';

export const adminOracleService = {
  async list(): Promise<OraclePromptTemplateDto[]> {
    const response = await apiClient.get<OraclePromptTemplateDto[]>(BASE_URL);
    return response.data ?? [];
  },

  async get(id: number): Promise<OraclePromptTemplateDto> {
    const response = await apiClient.get<OraclePromptTemplateDto>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(req: OraclePromptTemplateRequest): Promise<OraclePromptTemplateDto> {
    const response = await apiClient.post<OraclePromptTemplateDto>(BASE_URL, req);
    return response.data;
  },

  async update(id: number, req: OraclePromptTemplateRequest): Promise<OraclePromptTemplateDto> {
    const response = await apiClient.put<OraclePromptTemplateDto>(`${BASE_URL}/${id}`, req);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
