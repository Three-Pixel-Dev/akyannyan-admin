export interface MemberLevel {
  id: number;
  name: string;
  description?: string;
  durationDays?: number;
  durationMonths?: number;
  amount?: number;
  currency?: string;
  codeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberLevelRequest {
  name: string;
  description?: string;
  durationDays?: number;
  durationMonths?: number;
  amount?: number;
  currency?: string;
}

export interface MemberLevelFilter {
  search?: string;
}
