/**
 * User Service
 * Handle user-related operations
 */

import { apiClient } from '../api/apiClient';

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  gender?: string;
  address?: string;
  role: number; // 0 = Super Admin, 1 = Admin, 2 = Consumer
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const userService = {
  /**
   * Get users by role
   * @param role - User role (0 = Super Admin, 1 = Admin, 2 = Consumer)
   * @returns Promise<User[]>
   */
  getUsersByRole: async (role: number): Promise<User[]> => {
    const response = await apiClient.get(`/users?role=${role}`);
    return response;
  },
};

