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
  expiredAt?: string;
  redeemedByUserId?: number;
  assignedUserId?: number;
  redeemedByUsername?: string;
  assignedUserDisplayName?: string;
  redeemedAt?: string;
  activatedAt?: string;
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
  | 'MERIT_REWARD'
  | 'MEMBERSHIP_GRANT'
  | 'READING'
  | 'DAY_PICK';

export interface PointsTransaction {
  id: number;
  userId: number;
  userDisplayName?: string;
  userEmail?: string;
  stageId?: string;
  featureName?: string;
  referenceId?: string;
  source?: PointTransactionType | string;
  transactionType?: PointTransactionType | string;
  amount?: number;
  pointsAmount?: number;
  packagePointsDelta?: number;
  topupPointsDelta?: number;
  balanceAfter?: number;
  note?: string;
  createdAt: string;
}
