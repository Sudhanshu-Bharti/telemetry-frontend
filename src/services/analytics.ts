import { config } from "../config/config";

export interface PageviewData {
  createdAt: string;
  _count: {
    id: number;
  };
}

export interface TopPageData {
  path: string;
  _count: {
    id: number;
  };
}

export interface ReferrerData {
  referrer: string;
  _count: {
    id: number;
  };
}

export interface BrowserStatsData {
  browsers: Array<{
    browser: string;
    _count: {
      id: number;
    };
  }>;
  devices: Array<{
    device: string;
    _count: {
      id: number;
    };
  }>;
  os: Array<{
    os: string;
    _count: {
      id: number;
    };
  }>;
}

export interface CountryData {
  country: string;
  _count: {
    id: number;
  };
}

export interface UniqueVisitorsData {
  uniqueVisitors: number;
}

export class AnalyticsService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.apiBaseUrl;
  }

  private async fetchWithParams(
    endpoint: string,
    params: Record<string, string>
  ) {
    const url = new URL(`${this.baseUrl}/api/analytics${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    return response.json();
  }

  async getPageviews(
    siteId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PageviewData[]> {
    return this.fetchWithParams("/pageviews", {
      siteId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  async getUniqueVisitors(
    siteId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UniqueVisitorsData> {
    return this.fetchWithParams("/visitors", {
      siteId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  async getTopPages(
    siteId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<TopPageData[]> {
    return this.fetchWithParams("/pages", {
      siteId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: limit.toString(),
    });
  }

  async getReferrers(
    siteId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<ReferrerData[]> {
    return this.fetchWithParams("/referrers", {
      siteId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: limit.toString(),
    });
  }

  async getBrowserStats(
    siteId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BrowserStatsData> {
    return this.fetchWithParams("/browsers", {
      siteId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  async getCountries(
    siteId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CountryData[]> {
    return this.fetchWithParams("/countries", {
      siteId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }
}

export const analyticsService = new AnalyticsService();
