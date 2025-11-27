/**
 * Seller Service
 * Handle seller operations
 */

import { apiClient } from '../api/apiClient';

export const sellerService = {
  getSellers: async () => {
    const response = await apiClient.get('/sellers');
    return response.map((seller) => ({
      ...seller,
      id: seller._id || seller.id,
    }));
  },
};
