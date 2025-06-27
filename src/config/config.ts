export const config = {
  // API configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",

  // Default site ID - you should set this via environment variable
  defaultSiteId: import.meta.env.VITE_DEFAULT_SITE_ID || "default-site-id",

  // Chart configuration
  chartColors: {
    primary: "#3b82f6",
    secondary: "#10b981",
    tertiary: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    cyan: "#06b6d4",
    lime: "#84cc16",
    orange: "#f97316",
  },

  // Date range configuration
  defaultDateRange: 7, // days
  maxDateRange: 365, // days
};
