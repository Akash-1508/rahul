/**
 * Buyer Service
 * Handle buyer operations
 */

import { apiClient } from '../api/apiClient';

export const buyerService = {
  getBuyers: async () => {
    const response = await apiClient.get('/buyers');
    return response.map((buyer) => ({
      ...buyer,
      id: buyer._id || buyer.id,
    }));
  },
};

