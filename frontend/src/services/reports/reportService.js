/**
 * Report Service
 * Handle profit/loss calculations and reports
 */
import { apiClient, API_BASE_URL } from '../api/apiClient';

function buildQueryString(params) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '');
  if (!entries.length) {
    return '';
  }
  return `?${entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')}`;
}

export const reportService = {
  getProfitLossReport: async (startDate, endDate) => {
    // Implement profit/loss calculation logic
    throw new Error('Not implemented');
  },

  getDashboardSummary: async ({ trendPeriod, buyerMobile } = {}) => {
    const query = buildQueryString({ trendPeriod, buyerMobile });
    return apiClient.get(`/reports/dashboard-summary${query}`);
  }
,

  getBuyerConsumptionDownloadUrl: ({ month, year, buyerMobile } = {}) => {
    const query = buildQueryString({ month, year, buyerMobile });
    return `${API_BASE_URL}/reports/buyer-consumption/export${query}`;
  }
};

