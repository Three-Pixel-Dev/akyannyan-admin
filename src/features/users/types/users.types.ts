export interface User {
  id: number;
  email: string;
  phoneNumber?: string;
  displayName: string;
  loginCode?: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
  memberLevelId?: number;
  memberLevelName?: string;
  premiumExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserWithLoginCodeRequest {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  loginCode?: string;
  memberLevelId?: number;
}

export interface CreateBulkUsersWithLoginCodeRequest {
  quantity?: number;
  prefix?: string;
  customCodes?: string[];
  memberLevelId?: number;
}

export interface UserFilter {
  search?: string;
  memberLevelId?: number;
  role?: string;
  active?: boolean;
}
