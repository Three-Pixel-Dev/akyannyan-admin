export type OraclePromptCategory = 'SYSTEM' | 'QUOTA' | 'SAFETY' | 'DIVINATION';

export interface OraclePromptTemplateDto {
  id: number;
  code: string;
  category: OraclePromptCategory | string;
  icon?: string;
  title: string;
  model: string;
  temperature: number;
  maxTokens: number;
  description?: string;
  content: string;
  active: boolean;
  updatedAt?: string;
}

export interface OraclePromptTemplateRequest {
  code?: string;
  category: string;
  icon?: string;
  title: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  description?: string;
  content: string;
  active?: boolean;
}

/** UI-facing alias used by OracleView */
export type OracleTemplate = OraclePromptTemplateDto & {
  icon: string;
  isActive: boolean;
};

export function toOracleTemplate(dto: OraclePromptTemplateDto): OracleTemplate {
  return {
    ...dto,
    icon: dto.icon || '📝',
    isActive: dto.active,
  };
}
