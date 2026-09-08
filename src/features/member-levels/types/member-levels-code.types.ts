export type CodeStatus = 'AVAILABLE' | 'REDEEMED' | 'EXPIRED';

export interface MemberLevelCode {
  id: number;
  code: string;
  memberLevelId: number;
  memberLevelName?: string;
  userId?: number;
  userEmail?: string;
  userDisplayName?: string;
  activatedAt?: string;
  expiredAt?: string;
  status: CodeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MemberLevelCodeRequest {
  code?: string;
  memberLevelId: number;
  expiredAt?: string;
}

export interface MemberLevelCodeBulkGenerateRequest {
  memberLevelId: number;
  count: number;
  prefix?: string;
  expiryDays?: number;
}

export interface MemberLevelCodeFilter {
  memberLevelId?: number;
  code?: string;
  status?: string;
}
