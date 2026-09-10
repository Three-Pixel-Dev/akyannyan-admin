export interface PointsConfig {
  id: number;
  featureKey: string;
  featureName: string;
  costPoints: number;
  isEnabled: boolean;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointsConfigUpdateRequest {
  costPoints: number;
  isEnabled: boolean;
  description?: string;
}

export interface TopupCode {
  id: number;
  code: string;
  points: number;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
  expiresAt?: string;
  redeemedByUserId?: number;
  redeemedByUsername?: string;
  redeemedAt?: string;
  createdAt: string;
}

export interface TopupCodeBulkGenerateRequest {
  points: number;
  count: number;
  prefix?: string;
  expiryDays?: number;
}

export type PointTransactionType =
  | 'TOP_UP'
  | 'STAGE_DEDUCT'
  | 'REFUND'
  | 'PROMOTION'
  | 'ADMIN_ADJUST'
  | 'MERIT_REWARD';

export interface PointsTransaction {
  id: number;
  userId: number;
  userDisplayName?: string;
  userEmail?: string;
  stageId?: string;
  featureName?: string;
  transactionType: PointTransactionType;
  pointsAmount: number;
  packagePointsDelta: number;
  topupPointsDelta: number;
  balanceAfter: number;
  note?: string;
  createdAt: string;
}

export interface PointsAdjustRequest {
  targetUserId: number;
  amount: number;
  note: string;
}
