export type ContentKind = 'GAHTAR' | 'VIDEO' | 'ARTICLE';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ContentItem {
  id: number;
  kind: ContentKind;
  category: string;
  status: ContentStatus;
  title: string;
  body: string;
  glyph: string;
  isFree: boolean;
  published: boolean;
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  isMorningRitual?: boolean;
  meaning?: string | null;
  publishedAt?: string | null;
  updatedAt?: string;
  createdAt?: string;
}

export interface ContentItemRequest {
  kind: ContentKind;
  title: string;
  body: string;
  glyph?: string;
  isFree: boolean;
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  published: boolean;
  isMorningRitual?: boolean;
  meaning?: string | null;
}

export interface StorageUploadResult {
  url: string;
  key: string;
  contentType: string;
  storageType: string;
}
