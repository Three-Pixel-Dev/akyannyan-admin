export interface MemberLevel {
  id: number;
  name: string;
  description?: string;
  durationDays?: number;
  durationMonths?: number;
  amount?: number;
  currency?: string;
  /** Package points granted when a code for this tier is first activated. */
  initialCreditPoints?: number;
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
  initialCreditPoints?: number;
}

export interface MemberLevelFilter {
  search?: string;
}
