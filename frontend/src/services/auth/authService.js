/**
 * Authentication Service
 * Handle user login, signup, and authentication
 */

import { apiClient, setAuthToken } from '../api/apiClient';

export const authService = {
  login: async (emailOrMobile, password) => {
    const res = await apiClient.post('/auth/login', { emailOrMobile, password });
    if (res?.token) {
      setAuthToken(res.token);
      // console.log('[authService] Token saved to apiClient');
    }
    return res.user;
  },

  signup: async (
    name,
    email,
    password,
    mobile,
    gender,
    address,
    milkFixedPrice,
    dailyMilkQuantity
  ) => {
    const res = await apiClient.post('/auth/signup', {
      name,
      email,
      password,
      mobile,
      gender,
      address,
      milkFixedPrice,
      dailyMilkQuantity,
    });
    return res;
  },

  logout: async () => {
    setAuthToken(null);
  },

  getCurrentUser: async () => {
    // No persistent storage yet; return null in this simple client
    return null;
  },

  forgotPassword: async (mobile) => {
    const res = await apiClient.post('/auth/forgot-password', { mobile });
    return res;
  },

  resetPassword: async (mobile, otp, newPassword) => {
    const res = await apiClient.post('/auth/reset-password', {
      mobile,
      otp,
      newPassword,
    });
    return res;
  },
};

