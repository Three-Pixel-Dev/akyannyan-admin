import { apiClient } from '../../../services/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  userId: number;
  email: string;
  displayName: string;
  role: string;
}

export interface LoginResult {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  displayName: string;
  role: string;
}

const USER_KEY = 'akn_admin_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await apiClient.post<LoginResult>('/api/auth/login', credentials);
    const result = response.data;
    apiClient.setToken(result.token);
    this.setUser({
      userId: result.userId,
      email: result.email,
      displayName: result.displayName,
      role: result.role,
    });
    window.dispatchEvent(new Event('auth-change'));
    return result;
  },

  logout(): void {
    apiClient.removeToken();
  },

  getUser(): AdminUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser(user: AdminUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  },

  async fetchCurrentUser(): Promise<AdminUser | null> {
    if (!this.isAuthenticated()) return null;
    try {
      const response = await apiClient.get<AdminUser>('/api/auth/me');
      if (response.data) {
        this.setUser(response.data);
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },
};
