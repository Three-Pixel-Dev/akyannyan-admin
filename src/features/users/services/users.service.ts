import { apiClient, type PageAndFilterDTO, type PaginationDTO } from '../../../services/api-client';
import type {
  CreateBulkUsersWithLoginCodeRequest,
  CreateUserWithLoginCodeRequest,
  User,
  UserFilter,
} from '../types/users.types';

const BASE_URL = '/api/users';

export const usersService = {
  async getAll(pageAndFilter?: PageAndFilterDTO<UserFilter>): Promise<PaginationDTO<User>> {
    const response = await apiClient.post<PaginationDTO<User>>(`${BASE_URL}/pageable`, pageAndFilter || {});
    return response.data;
  },

  async getById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async createUserWithLoginCode(data: CreateUserWithLoginCodeRequest): Promise<User> {
    const response = await apiClient.post<User>(`${BASE_URL}/create-with-login-code`, data);
    return response.data;
  },

  async createBulkUsersWithLoginCode(data: CreateBulkUsersWithLoginCodeRequest): Promise<User[]> {
    const response = await apiClient.post<User[]>(`${BASE_URL}/create-bulk-with-login-code`, data);
    return response.data;
  },

  async updateUser(id: number, data: CreateUserWithLoginCodeRequest): Promise<User> {
    const response = await apiClient.put<User>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
