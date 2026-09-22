export interface ApiResponse<T = any> {
  success: number;
  code: number;
  meta?: {
    endpoint?: string;
    method?: string;
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
  };
  data: T;
  message: string;
}

export interface PaginationDTO<T> {
  content: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PageAndFilterDTO<F = any> {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  filter?: F;
}

const TOKEN_KEY = 'akn_admin_token';
const USER_KEY = 'akn_admin_user';

/** Production: set VITE_API_BASE_URL=https://api-akn.duolinkmm.com (no trailing slash). Local Vite uses proxy. */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

function apiUrl(endpoint: string): string {
  if (!endpoint.startsWith('/')) return `${API_BASE_URL}/${endpoint}`;
  return `${API_BASE_URL}${endpoint}`;
}

export const apiClient = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('auth-change'));
  },

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(apiUrl(endpoint), {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.removeToken();
        throw new Error('Session expired. Please log in again.');
      }

      if (response.status === 204) {
        return {
          success: 1,
          code: 204,
          data: null as any,
          message: 'Success',
        };
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return json;
    } catch (error: any) {
      throw error;
    }
  },

  get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  },

  post<T = any>(endpoint: string, data?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  },

  put<T = any>(endpoint: string, data?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  },

  patch<T = any>(endpoint: string, data?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  },

  async upload<T = any>(endpoint: string, file: File, purpose: string): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const form = new FormData();
    form.append('file', file);
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await fetch(`${apiUrl(endpoint)}${separator}purpose=${encodeURIComponent(purpose)}`, {
      method: 'POST',
      headers,
      body: form,
    });
    if (response.status === 401) {
      this.removeToken();
      throw new Error('Session expired. Please log in again.');
    }
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(json?.message || `Request failed with status ${response.status}`);
    }
    return json;
  },

  delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  },
};
