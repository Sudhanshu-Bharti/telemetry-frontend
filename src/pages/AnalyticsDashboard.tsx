"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  subDays,
  startOfDay,
  endOfDay,
  parseISO,
  format,
  isSameDay,
  differenceInDays,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import {
  analyticsService,
  type TopPageData,
  type ReferrerData,
  type CountryData,
  type RealtimeMetricsData,
  type VisitorsTrendData,
  type BounceRateTrendData,
} from "../services/analytics";

import { DateRangePicker } from "../components/DateRangePickerModern";
import {
  Eye,
  Users,
  AlertTriangle,
  Clock,
  Activity,
  Globe,
  BarChart3,
  Download,
  Search,
  Filter,
  Star,
  StarOff,
  StickyNote,
  Layers,
  GitCompare,
  X,
  Calendar,
} from "lucide-react";
import {
  SimpleLineChart,
  HorizontalBarChart,
  SimpleBarChart,
  StackedBarChart,
} from "../components/charts/SimpleCharts";
import WorldMap from "../components/charts/WorldMap";
import { CountryStats } from "../components/charts/CountryStats";
import { getAlpha3 } from "../lib/alpha2toalpha3";
import { LoadingSpinner } from "../components/ui/Card";
import { useSite } from "../contexts/SiteContext";

// Animation timing constants for consistency
const ANIMATION_TIMING = {
  fast: 200,
  normal: 300,
  slow: 500,
  entrance: 700,
} as const;

interface FilterState {
  device: string;
  country: string;
  customFilters: Record<string, string>;
}

interface FavoriteMetric {
  id: string;
  name: string;
  section: string;
  value: string;
  timestamp: Date;
}

interface Note {
  id: string;
  date: string;
  content: string;
  timestamp: Date;
}

// Helper functions
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
};

const formatChange = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

// Export functions
const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Notes management using localStorage
const loadNotesFromStorage = (): Note[] => {
  try {
    const stored = localStorage.getItem("analytics-notes");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveNotesToStorage = (notes: Note[]) => {
  try {
    localStorage.setItem("analytics-notes", JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to save notes:", error);
  }
};

// Favorites management using localStorage
const loadFavoritesFromStorage = (): FavoriteMetric[] => {
  try {
    const stored = localStorage.getItem("analytics-favorites");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavoritesToStorage = (favorites: FavoriteMetric[]) => {
  try {
    localStorage.setItem("analytics-favorites", JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to save favorites:", error);
  }
};

// Enhanced data filtering functions
const filterData = (data: any[], query: string, fields: string[]) => {
  if (!query) return data;
  const lowercaseQuery = query.toLowerCase();
  return data.filter((item) =>
    fields.some(
      (field) =>
        item[field] &&
        item[field].toString().toLowerCase().includes(lowercaseQuery)
    )
  );
};

// Skeleton loader component
const SkeletonLoader = ({
  className = "h-4 bg-slate-200 animate-pulse",
}: {
  className?: string;
}) => <div className={className}></div>;

// Empty state component
const EmptyState = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="p-4 bg-slate-100 border border-slate-200 mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-600 max-w-sm">{description}</p>
  </div>
);

interface SimpleTabsProps {
  tabs: any[];
  initialTab?: string;
  value?: string;
  onChange?: (tabId: string) => void;
}

function SimpleTabs({ tabs, initialTab, value, onChange }: SimpleTabsProps) {
  const [internalTab, setInternalTab] = useState(initialTab || tabs[0]?.id);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (tabId: string) => {
    if (onChange) onChange(tabId);
    if (value === undefined) setInternalTab(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div>
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-10" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative py-4 px-1 text-sm font-bold transition-all border-b-2 uppercase tracking-widest hover:scale-105 animate-in fade-in-0 slide-in-from-top-2 ${
                tab.id === activeTab
                  ? "text-slate-900 border-slate-900 shadow-sm"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-400"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: `${ANIMATION_TIMING.slow}ms`,
                transitionDuration: `${ANIMATION_TIMING.normal}ms`,
              }}
            >
              <span
                className="relative z-10 transition-all group-hover:transform group-hover:-translate-y-0.5"
                style={{ transitionDuration: `${ANIMATION_TIMING.normal}ms` }}
              >
                {tab.label}
              </span>

              {tab.id === activeTab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 transition-all animate-in slide-in-from-left-full"
                  style={{ transitionDuration: `${ANIMATION_TIMING.normal}ms` }}
                />
              )}

              {/* Hover effect background */}
              <div
                className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-20 transition-opacity -z-10"
                style={{ transitionDuration: `${ANIMATION_TIMING.normal}ms` }}
              ></div>

              {/* Active state glow */}
              {tab.id === activeTab && (
                <div
                  className="absolute inset-0 bg-slate-900 opacity-5 transition-opacity"
                  style={{ transitionDuration: `${ANIMATION_TIMING.normal}ms` }}
                ></div>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div
        className="pt-10 transition-all ease-in-out animate-in fade-in-0 slide-in-from-bottom-2"
        style={{ transitionDuration: `${ANIMATION_TIMING.slow}ms` }}
      >
        {activeContent}
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const { currentSiteId, loading: siteLoading } = useSite();
  // State for date range
  const [startDate, setStartDate] = useState(() =>
    startOfDay(subDays(new Date(), 7))
  );
  const [endDate, setEndDate] = useState(() => endOfDay(new Date()));

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [pageviewData, setPageviewData] = useState<any[]>([]);

  // Interaction states
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [realtime, setRealtime] = useState<RealtimeMetricsData | null>(null);

  // Data states for current and previous periods
  const [currentData, setCurrentData] = useState<any>({});
  const [previousData, setPreviousData] = useState<any>({});

  // Metric selector state
  const [selectedMetric, setSelectedMetric] = useState<
    "pageviews" | "visitors" | "bounceRate"
  >("pageviews");
  const [trendLoading, setTrendLoading] = useState(false);
  const [visitorsTrend, setVisitorsTrend] = useState<VisitorsTrendData[]>([]);
  const [bounceRateTrend, setBounceRateTrend] = useState<BounceRateTrendData[]>(
    []
  );

  // Enhanced loading and interaction states
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "error"
  >("connected");

  // New feature states
  const [comparisonMode, setComparisonMode] = useState(false);
  const [dataDensity, setDataDensity] = useState<"compact" | "detailed">(
    "detailed"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<FavoriteMetric[]>(() =>
    loadFavoritesFromStorage()
  );
  const [notes, setNotes] = useState<Note[]>(() => loadNotesFromStorage());
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    device: "",
    country: "",
    customFilters: {},
  });

  // Save favorites to localStorage when they change
  useEffect(() => {
    saveFavoritesToStorage(favorites);
  }, [favorites]);

  // Save notes to localStorage when they change
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  // URL state management
  const updateUrlState = useCallback((params: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Load state from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateFrom = urlParams.get("from");
    const dateTo = urlParams.get("to");
    const comparison = urlParams.get("comparison") === "true";
    const density =
      (urlParams.get("density") as "compact" | "detailed") || "detailed";
    const device = urlParams.get("device") || "";
    const country = urlParams.get("country") || "";

    if (dateFrom && dateTo) {
      setStartDate(parseISO(dateFrom));
      setEndDate(parseISO(dateTo));
    }
    setComparisonMode(comparison);
    setDataDensity(density);
    setFilters((prev) => ({ ...prev, device, country }));
  }, []);

  // Update URL when state changes
  useEffect(() => {
    updateUrlState({
      from: format(startDate, "yyyy-MM-dd"),
      to: format(endDate, "yyyy-MM-dd"),
      comparison: comparisonMode ? "true" : "",
      density: dataDensity,
      device: filters.device,
      country: filters.country,
    });
  }, [
    startDate,
    endDate,
    comparisonMode,
    dataDensity,
    filters,
    updateUrlState,
  ]);

  // Favorites management
  const toggleFavorite = useCallback(
    (metric: Omit<FavoriteMetric, "timestamp">) => {
      setFavorites((prev) => {
        const exists = prev.find((f) => f.id === metric.id);
        if (exists) {
          return prev.filter((f) => f.id !== metric.id);
        } else {
          return [...prev, { ...metric, timestamp: new Date() }];
        }
      });
    },
    []
  );

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  // Notes management
  const addNote = useCallback((date: string, content: string) => {
    const newNote: Note = {
      id: `${date}-${Date.now()}`,
      date,
      content,
      timestamp: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchRealtime = async () => {
      try {
        setConnectionStatus("connecting");
        const data = await analyticsService.getRealtimeMetrics(currentSiteId);
        setRealtime(data);
        setConnectionStatus("connected");
        setLastUpdated(new Date());
      } catch (err) {
        setConnectionStatus("error");
      }
    };
    fetchRealtime();
    interval = setInterval(fetchRealtime, 10000);
    return () => clearInterval(interval);
  }, [currentSiteId]);

  useEffect(() => {
    if (siteLoading || !currentSiteId) return;
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Calculate previous period
        const diff = endDate.getTime() - startDate.getTime();
        const prevEndDate = new Date(startDate.getTime() - 1);
        const prevStartDate = new Date(prevEndDate.getTime() - diff);
        const [
          pageviews,
          prevPageviews,
          visitors,
          prevVisitors,
          bounceRate,
          prevBounceRate,
          avgSessionDuration,
          prevAvgSessionDuration,
          pages,
          referrers,
          browsers,
          countries,
        ] = await Promise.all([
          analyticsService.getPageviews(currentSiteId, startDate, endDate),
          analyticsService.getPageviews(
            currentSiteId,
            prevStartDate,
            prevEndDate
          ),
          analyticsService.getUniqueVisitors(currentSiteId, startDate, endDate),
          analyticsService.getUniqueVisitors(
            currentSiteId,
            prevStartDate,
            prevEndDate
          ),
          analyticsService.getBounceRate(currentSiteId, startDate, endDate),
          analyticsService.getBounceRate(
            currentSiteId,
            prevStartDate,
            prevEndDate
          ),
          analyticsService.getAvgSessionDuration(
            currentSiteId,
            startDate,
            endDate
          ),
          analyticsService.getAvgSessionDuration(
            currentSiteId,
            prevStartDate,
            prevEndDate
          ),
          analyticsService.getTopPages(currentSiteId, startDate, endDate, 10),
          analyticsService.getReferrers(currentSiteId, startDate, endDate, 10),
          analyticsService.getBrowserStats(currentSiteId, startDate, endDate),
          analyticsService.getCountries(currentSiteId, startDate, endDate),
        ]);
        setPageviewData(pageviews);
        setCurrentData({
          pageviews,
          visitors,
          bounceRate,
          avgSessionDuration,
          pages,
          referrers,
          browsers,
          countries,
        });
        setPreviousData({
          pageviews: prevPageviews,
          visitors: prevVisitors,
          bounceRate: prevBounceRate,
          avgSessionDuration: prevAvgSessionDuration,
          pages: [],
          referrers: [],
          browsers: { browsers: [], os: [], devices: [] },
          countries: [],
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [startDate, endDate, currentSiteId, siteLoading]);

  // Memoized calculations for display
  const {
    totalPageviews,
    totalVisitors,
    pageviewsChange,
    visitorsChange,
    bounceRateValue,
    bounceRateChange,
    avgSessionDurationValue,
    avgSessionDurationChange,
    topPages,
    referrers,
    browserStats,
    countries,
    prevTotalPageviews,
    prevTotalVisitors,
    prevBounceRateValue,
    prevAvgSessionDurationValue,
  } = useMemo(() => {
    const currentViews =
      currentData.pageviews?.reduce(
        (sum: number, item: any) => sum + item._count.id,
        0
      ) || 0;
    const prevViews =
      previousData.pageviews?.reduce(
        (sum: number, item: any) => sum + item._count.id,
        0
      ) || 0;
    const currentVisitors = currentData.visitors?.uniqueVisitors || 0;
    const prevVisitors = previousData.visitors?.uniqueVisitors || 0;
    const currentBounce = currentData.bounceRate?.bounceRate;
    const prevBounce = previousData.bounceRate?.bounceRate;
    // Convert ms to s for session duration
    const currentSession =
      typeof currentData.avgSessionDuration?.averageSessionDuration === "number"
        ? currentData.avgSessionDuration.averageSessionDuration / 1000
        : undefined;
    const prevSession =
      typeof previousData.avgSessionDuration?.averageSessionDuration ===
      "number"
        ? previousData.avgSessionDuration.averageSessionDuration / 1000
        : undefined;
    return {
      totalPageviews: currentViews,
      totalVisitors: currentVisitors,
      pageviewsChange:
        prevViews === 0 ? 0 : ((currentViews - prevViews) / prevViews) * 100,
      visitorsChange:
        prevVisitors === 0
          ? 0
          : ((currentVisitors - prevVisitors) / prevVisitors) * 100,
      bounceRateValue:
        typeof currentBounce === "number" ? currentBounce : undefined,
      bounceRateChange:
        typeof currentBounce === "number" &&
        typeof prevBounce === "number" &&
        prevBounce !== 0
          ? ((currentBounce - prevBounce) / prevBounce) * 100
          : undefined,
      avgSessionDurationValue: currentSession,
      avgSessionDurationChange:
        typeof currentSession === "number" &&
        typeof prevSession === "number" &&
        prevSession !== 0
          ? ((currentSession - prevSession) / prevSession) * 100
          : undefined,
      topPages: currentData.pages || [],
      referrers: currentData.referrers || [],
      browserStats: currentData.browsers || {
        browsers: [],
        os: [],
        devices: [],
      },
      countries: currentData.countries || [],
      // Previous period data for comparison
      prevTotalPageviews: prevViews,
      prevTotalVisitors: prevVisitors,
      prevBounceRateValue:
        typeof prevBounce === "number" ? prevBounce : undefined,
      prevAvgSessionDurationValue: prevSession,
    };
  }, [currentData, previousData]);

  // Prepare chart data with smart aggregation for large date ranges
  const lineChartData = useMemo(() => {
    let data: { date: Date; value: number }[] = [];
    const daysDiff = differenceInDays(endDate, startDate);

    if (isSameDay(startDate, endDate)) {
      // Single day: group by hour
      const groupedByHour: Record<string, { date: Date; value: number }> = {};
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = String(hour).padStart(2, "0");
        groupedByHour[hourStr] = {
          date: new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            hour
          ),
          value: 0,
        };
      }
      pageviewData.forEach((item) => {
        const hour = format(parseISO(item.createdAt), "HH");
        groupedByHour[hour].value += item._count.id;
      });
      data = Object.values(groupedByHour);
    } else if (daysDiff <= 90) {
      // Up to 90 days: group by day
      const groupedByDay: Record<string, { date: Date; value: number }> = {};
      pageviewData.forEach((item) => {
        const day = format(parseISO(item.createdAt), "yyyy-MM-dd");
        if (!groupedByDay[day]) {
          groupedByDay[day] = { date: parseISO(item.createdAt), value: 0 };
        }
        groupedByDay[day].value += item._count.id;
      });
      data = Object.values(groupedByDay);
    } else if (daysDiff <= 365) {
      // 90+ days to 365 days: group by week
      const groupedByWeek: Record<string, { date: Date; value: number }> = {};
      pageviewData.forEach((item) => {
        const date = parseISO(item.createdAt);
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
        const weekKey = format(weekStart, "yyyy-MM-dd");
        if (!groupedByWeek[weekKey]) {
          groupedByWeek[weekKey] = { date: weekStart, value: 0 };
        }
        groupedByWeek[weekKey].value += item._count.id;
      });
      data = Object.values(groupedByWeek);
    } else {
      // 365+ days: group by month
      const groupedByMonth: Record<string, { date: Date; value: number }> = {};
      pageviewData.forEach((item) => {
        const date = parseISO(item.createdAt);
        const monthStart = startOfMonth(date);
        const monthKey = format(monthStart, "yyyy-MM");
        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = { date: monthStart, value: 0 };
        }
        groupedByMonth[monthKey].value += item._count.id;
      });
      data = Object.values(groupedByMonth);
    }

    return data.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [pageviewData, startDate, endDate]);

  const topPagesChartData = useMemo(() => {
    let data = topPages.map((item: TopPageData) => ({
      name: item.path,
      value: item._count.id,
      percentage: `${((item._count.id / totalPageviews) * 100).toFixed(1)}`,
    }));
    return filterData(data, searchQuery, ["name"]);
  }, [topPages, totalPageviews, searchQuery]);

  const referrersChartData = useMemo(() => {
    let data = referrers.map((item: ReferrerData) => ({
      name: item.referrer,
      value: item._count.id,
      percentage: `${((item._count.id / totalPageviews) * 100).toFixed(1)}`,
    }));
    return filterData(data, searchQuery, ["name"]);
  }, [referrers, totalPageviews, searchQuery]);

  const browsersChartData = useMemo(() => {
    let data = browserStats.browsers.map(
      (item: { browser: string; _count: { id: number } }) => ({
        name: item.browser || "Unknown",
        value: item._count.id,
      })
    );
    return filterData(data, searchQuery, ["name"]);
  }, [browserStats.browsers, searchQuery]);

  const osChartData = useMemo(() => {
    let data = browserStats.os.map(
      (item: { os: string; _count: { id: number } }) => ({
        name: item.os || "Unknown",
        value: item._count.id,
      })
    );
    return filterData(data, searchQuery, ["name"]);
  }, [browserStats.os, searchQuery]);

  const devicesChartData = useMemo(() => {
    let data = browserStats.devices.map(
      (item: { device: string; _count: { id: number } }) => ({
        name: item.device || "Unknown",
        value: item._count.id,
      })
    );
    return filterData(data, searchQuery, ["name"]);
  }, [browserStats.devices, searchQuery]);

  const countryMapData = useMemo(
    () =>
      countries
        .map((item: CountryData) => {
          const alpha3 = getAlpha3(item.country);
          if (!alpha3) return null;
          return {
            alpha_3: alpha3,
            name: item.country,
            visitors: item._count.id,
            code: alpha3,
          };
        })
        .filter(
          (
            item: any
          ): item is {
            alpha_3: string;
            name: string;
            visitors: number;
            code: string;
          } => item !== null
        ),
    [countries]
  );

  const countryStatsData = useMemo(() => {
    let data = countries.map((item: CountryData) => ({
      name: item.country,
      value: item._count.id,
      percentage: ((item._count.id / totalPageviews) * 100).toFixed(1),
    }));
    data = filterData(data, searchQuery, ["name"]);
    if (filters.country) {
      data = data.filter((item: any) => item.name === filters.country);
    }
    return data;
  }, [countries, totalPageviews, searchQuery, filters.country]);

  // Fetch visitors and bounce rate trend when metric or date range changes
  useEffect(() => {
    if (selectedMetric === "visitors" || selectedMetric === "bounceRate") {
      setTrendLoading(true);
      const fetchTrend = async () => {
        try {
          const interval = isSameDay(startDate, endDate) ? "hour" : "day";
          if (selectedMetric === "visitors") {
            const data = await analyticsService.getVisitorsTrend(
              currentSiteId,
              startDate,
              endDate,
              interval
            );
            setVisitorsTrend(data);
          } else if (selectedMetric === "bounceRate") {
            const data = await analyticsService.getBounceRateTrend(
              currentSiteId,
              startDate,
              endDate,
              interval
            );
            setBounceRateTrend(data);
            console.log("Bounce Rate Trend Data:", data);
          }
        } catch (err) {
          // Optionally handle error
        } finally {
          setTrendLoading(false);
        }
      };
      fetchTrend();
    }
  }, [selectedMetric, startDate, endDate, currentSiteId]);

  // Prepare chart data for each metric
  const pageviewsChartData = useMemo(() => lineChartData, [lineChartData]);
  const visitorsChartData = useMemo(() => {
    return (visitorsTrend as any[])
      .map((item) => ({
        date: new Date(item.date),
        value: item.uniqueVisitors ?? item.count ?? 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [visitorsTrend]);
  const bounceRateStackedBarData = useMemo(() => {
    if (isSameDay(startDate, endDate)) {
      // Group by hour for single day
      const groupedByHour: {
        [hour: string]: { date: Date; bounce: number; nonBounce: number };
      } = {};
      for (let hour = 0; hour < 24; hour++) {
        const hourLabel = `${hour}:00`;
        groupedByHour[hourLabel] = {
          date: new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            hour
          ),
          bounce: 0,
          nonBounce: 0,
        };
      }
      bounceRateTrend.forEach((item) => {
        const hour = new Date(item.date).getHours();
        const hourLabel = `${hour}:00`;
        if (groupedByHour[hourLabel]) {
          groupedByHour[hourLabel].bounce += item.bounceSessions;
          groupedByHour[hourLabel].nonBounce +=
            item.totalSessions - item.bounceSessions;
        }
      });
      return Object.values(groupedByHour);
    } else {
      const result = bounceRateTrend.map((item) => ({
        date: new Date(item.date),
        bounce: item.bounceSessions,
        nonBounce: item.totalSessions - item.bounceSessions,
      }));
      return result;
    }
  }, [bounceRateTrend, startDate, endDate]);

  useEffect(() => {
    if (selectedMetric === "visitors") {
      console.log("Visitors trend data:", visitorsTrend);
    }
  }, [visitorsTrend, selectedMetric]);

  // Tab icon helpers with consistent styling
  const metricTabIcons = {
    pageviews: <Eye size={16} className="mr-3 text-slate-600" />,
    visitors: <Users size={16} className="mr-3 text-slate-600" />,
    bounceRate: <AlertTriangle size={16} className="mr-3 text-slate-600" />,
  };
  const secondaryTabIcons = {
    pages: <Eye size={16} className="mr-3 text-slate-600" />,
    referrers: <Users size={16} className="mr-3 text-slate-600" />,
    audience: <Clock size={16} className="mr-3 text-slate-600" />,
  };

  // Export handlers
  const handleExportPages = () => {
    setIsExporting(true);
    exportToCSV(topPagesChartData, "top-pages");
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleExportReferrers = () => {
    setIsExporting(true);
    exportToCSV(referrersChartData, "referrers");
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleExportCountries = () => {
    setIsExporting(true);
    exportToCSV(countryStatsData, "countries");
    setTimeout(() => setIsExporting(false), 1000);
  };

  // Main metric chart tabs
  const METRIC_TABS = [
    {
      id: "pageviews",
      label: (
        <span className="flex items-center font-bold tracking-wide uppercase text-xs text-slate-700">
          {metricTabIcons.pageviews}Pageviews
        </span>
      ),
      content:
        loading || trendLoading ? (
          <div className="h-80 flex items-center justify-center bg-slate-50 border border-slate-200">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : (
          <SimpleLineChart data={pageviewsChartData} title="Page Views" />
        ),
    },
    {
      id: "visitors",
      label: (
        <span className="flex items-center font-bold tracking-wide uppercase text-xs text-slate-700">
          {metricTabIcons.visitors}Visitors
        </span>
      ),
      content:
        loading || trendLoading ? (
          <div className="h-80 flex items-center justify-center bg-slate-50 border border-slate-200">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : (
          <SimpleLineChart data={visitorsChartData} title="Visitors" />
        ),
    },
    {
      id: "bounceRate",
      label: (
        <span className="flex items-center font-bold tracking-wide uppercase text-xs text-slate-700">
          {metricTabIcons.bounceRate}Bounce Rate
        </span>
      ),
      content:
        loading || trendLoading ? (
          <div className="h-80 flex items-center justify-center bg-slate-50 border border-slate-200">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : (
          <StackedBarChart
            data={bounceRateStackedBarData}
            title="Bounce vs Non-Bounce Sessions"
          />
        ),
    },
  ];

  const TABS = [
    {
      id: "pages",
      label: (
        <span className="flex items-center font-bold tracking-wide uppercase text-xs text-slate-700">
          {secondaryTabIcons.pages}Top Pages
        </span>
      ),
      content:
        topPagesChartData.length > 0 ? (
          <div className="relative">
            <div className="absolute top-0 right-0 z-10">
              <button
                onClick={handleExportPages}
                disabled={isExporting}
                className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1 disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
            <HorizontalBarChart data={topPagesChartData} title="Top Pages" />
          </div>
        ) : (
          <EmptyState
            title="No Page Data"
            description="No page views recorded for the selected date range"
            icon={<Eye className="w-6 h-6 text-slate-400" />}
          />
        ),
    },
    {
      id: "referrers",
      label: (
        <span className="flex items-center font-bold tracking-wide uppercase text-xs text-slate-700">
          {secondaryTabIcons.referrers}Referrers
        </span>
      ),
      content:
        referrersChartData.length > 0 ? (
          <div className="relative">
            <div className="absolute top-0 right-0 z-10 flex gap-2">
              <div className="relative group">
                <button className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Export
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 min-w-32">
                  <button
                    onClick={handleExportReferrers}
                    disabled={isExporting}
                    className="block w-full px-3 py-2 text-xs text-left hover:bg-slate-50 disabled:opacity-50"
                  >
                    CSV Data
                  </button>
                </div>
              </div>
            </div>
            <div id="referrers-chart">
              <HorizontalBarChart data={referrersChartData} title="Referrers" />
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Referrer Data"
            description="No referrer information available for the selected period"
            icon={<Users className="w-6 h-6 text-slate-400" />}
          />
        ),
    },
    {
      id: "audience",
      label: (
        <span className="flex items-center font-bold tracking-wide uppercase text-xs text-slate-700">
          {secondaryTabIcons.audience}Audience
        </span>
      ),
      content:
        browsersChartData.length > 0 ||
        osChartData.length > 0 ||
        devicesChartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SimpleBarChart data={browsersChartData} title="Browsers" />
            <SimpleBarChart data={osChartData} title="Operating Systems" />
            <SimpleBarChart data={devicesChartData} title="Devices" />
          </div>
        ) : (
          <EmptyState
            title="No Audience Data"
            description="No browser, OS, or device information available"
            icon={<Clock className="w-6 h-6 text-slate-400" />}
          />
        ),
    },
  ];

  if (error) {
    return (
      <div className="p-8 text-red-500 font-semibold text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header
        className="bg-white border-b border-slate-200 animate-in slide-in-from-top-4"
        style={{ animationDuration: `${ANIMATION_TIMING.entrance}ms` }}
      >
        <div className="px-10 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div
                className="animate-in fade-in-0 slide-in-from-left-4"
                style={{ animationDuration: `${ANIMATION_TIMING.entrance}ms` }}
              >
                <h1
                  className="text-4xl font-black text-slate-900 tracking-tight hover:text-slate-700 transition-colors cursor-default"
                  style={{ transitionDuration: `${ANIMATION_TIMING.normal}ms` }}
                >
                  Analytics Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Realtime status and last updated */}

                {realtime ? (
                  <div
                    className="group relative flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold transition-all hover:bg-emerald-700 hover:scale-105 hover:shadow-lg animate-in zoom-in-50"
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                      animationDelay: "300ms",
                    }}
                  >
                    <div
                      className={`w-2 h-2 bg-emerald-200 rounded-full ${
                        connectionStatus === "connected"
                          ? "animate-pulse group-hover:animate-ping"
                          : connectionStatus === "connecting"
                          ? "animate-bounce"
                          : "bg-red-300"
                      }`}
                    ></div>
                    <span
                      className="animate-in fade-in-0"
                      style={{
                        animationDuration: `${ANIMATION_TIMING.normal}ms`,
                      }}
                    >
                      {typeof realtime.activeVisitors === "number"
                        ? realtime.activeVisitors
                        : "—"}{" "}
                      active
                    </span>

                    {/* Connection status indicator */}
                    {connectionStatus === "error" && (
                      <span className="text-xs opacity-75">• Offline</span>
                    )}

                    {/* Subtle glow effect */}
                    <div
                      className="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity blur-sm -z-10"
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-slate-200 text-slate-500 text-sm font-bold animate-pulse">
                    <span className="inline-flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      Loading...
                    </span>
                  </div>
                )}

                {/* Last updated indicator */}
                {lastUpdated && (
                  <div
                    className="text-xs text-slate-500 px-3 py-1 bg-slate-100 border border-slate-200 animate-in fade-in-0"
                    style={{ animationDelay: "400ms" }}
                  >
                    Updated{" "}
                    {new Date(lastUpdated).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex-shrink-0 animate-in slide-in-from-right-4"
              style={{
                animationDuration: `${ANIMATION_TIMING.entrance}ms`,
                animationDelay: "200ms",
              }}
            >
              <div className="group">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={handleDateChange}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Advanced Toolbar */}
      {/* <div className="bg-white border-b border-slate-200 px-10 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search pages, referrers, countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filters.device}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, device: e.target.value }))
                }
                className="px-3 py-2 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Devices</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>

              <select
                value={filters.country}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, country: e.target.value }))
                }
                className="px-3 py-2 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Countries</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border transition-all duration-200 ${
                comparisonMode
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <GitCompare className="w-4 h-4" />
              Compare
            </button>

            <button
              onClick={() =>
                setDataDensity(
                  dataDensity === "compact" ? "detailed" : "compact"
                )
              }
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-all duration-200"
            >
              <Layers className="w-4 h-4" />
              {dataDensity === "compact" ? "Detailed" : "Compact"}
            </button>

            <button
              onClick={() => setShowNotesPanel(!showNotesPanel)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border transition-all duration-200 ${
                showNotesPanel
                  ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <StickyNote className="w-4 h-4" />
              Notes
              {notes.length > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notes.length}
                </span>
              )}
            </button>

            {(searchQuery || filters.device || filters.country) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ device: "", country: "", customFilters: {} });
                }}
                className="px-3 py-2 text-sm font-medium bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200 transition-all duration-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {comparisonMode && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Comparing {format(startDate, "MMM d")} - {format(endDate, "MMM d")}{" "}
            with previous period
          </div>
        )}
      </div>

      {showNotesPanel && (
        <div className="bg-amber-50 border-b border-amber-200 px-10 py-4">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-amber-800">
                Notes & Annotations
              </h3>
              <button
                onClick={() => setShowNotesPanel(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-amber-600 text-sm">
                  No notes yet. Add notes to track important events and
                  insights.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-3 p-2 bg-white border border-amber-200 text-sm"
                  >
                    <Calendar className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-amber-800">
                        {note.date}
                      </div>
                      <div className="text-amber-700">{note.content}</div>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-amber-500 hover:text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

            <div className="mt-3 flex gap-2">
              <input
                type="date"
                className="px-3 py-2 border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                id="note-date"
              />
              <input
                type="text"
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                id="note-content"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const dateInput = document.getElementById(
                      "note-date"
                    ) as HTMLInputElement;
                    const contentInput = document.getElementById(
                      "note-content"
                    ) as HTMLInputElement;
                    if (contentInput.value.trim()) {
                      addNote(dateInput.value, contentInput.value);
                      contentInput.value = "";
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const dateInput = document.getElementById(
                    "note-date"
                  ) as HTMLInputElement;
                  const contentInput = document.getElementById(
                    "note-content"
                  ) as HTMLInputElement;
                  if (contentInput.value.trim()) {
                    addNote(dateInput.value, contentInput.value);
                    contentInput.value = "";
                  }
                }}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-10 py-4">
          <div className="flex items-center gap-4 mb-3">
            <Star className="w-5 h-5 text-amber-600 fill-current" />
            <h3 className="font-semibold text-amber-800">Favorite Metrics</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 text-sm"
              >
                <span className="font-medium text-amber-800">
                  {favorite.name}:
                </span>
                <span className="text-amber-700">{favorite.value}</span>
                <button
                  onClick={() => toggleFavorite(favorite)}
                  className="text-amber-500 hover:text-amber-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <main
        className={`px-10 ${
          dataDensity === "compact" ? "py-6 space-y-6" : "py-12 space-y-12"
        }`}
      >
        {/* Stat Cards */}
        <section
          className="animate-in fade-in-0"
          style={{ animationDuration: `${ANIMATION_TIMING.entrance}ms` }}
        >
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 ${
              dataDensity === "compact" ? "gap-2 lg:gap-4" : "gap-4 lg:gap-8"
            }`}
          >
            {/* Views Card */}
            <div
              className="group bg-white border-l-4 border-l-emerald-500 border-r border-t border-b border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all hover:-translate-y-1 cursor-pointer animate-in slide-in-from-bottom-4"
              style={{
                animationDuration: `${ANIMATION_TIMING.slow}ms`,
                animationDelay: "100ms",
              }}
            >
              <div
                className={`${
                  dataDensity === "compact" ? "p-4" : "p-7"
                } h-full relative overflow-hidden`}
              >
                {/* Subtle background pattern on hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/0 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: `${ANIMATION_TIMING.slow}ms` }}
                ></div>

                <div
                  className={`flex items-start justify-between ${
                    dataDensity === "compact" ? "mb-3" : "mb-6"
                  } relative z-10`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`${
                        dataDensity === "compact" ? "p-2" : "p-3"
                      } bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-all group-hover:scale-110 group-hover:rotate-1`}
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                      }}
                    >
                      <Eye
                        size={dataDensity === "compact" ? 18 : 22}
                        className="text-emerald-600 group-hover:text-emerald-700 transition-colors"
                        style={{
                          transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                        }}
                      />
                    </div>
                    <button
                      onClick={() =>
                        toggleFavorite({
                          id: "pageviews",
                          name: "Page Views",
                          section: "metrics",
                          value: totalPageviews.toLocaleString(),
                        })
                      }
                      className="p-1 hover:bg-emerald-100 transition-colors opacity-0 group-hover:opacity-100"
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.fast}ms`,
                      }}
                    >
                      {isFavorite("pageviews") ? (
                        <Star className="w-4 h-4 text-emerald-600 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    {pageviewsChange !== 0 && (
                      <span
                        className={`${
                          dataDensity === "compact"
                            ? "text-xs px-2 py-1"
                            : "text-xs px-3 py-1.5"
                        } font-bold transition-all hover:scale-110 ${
                          pageviewsChange >= 0
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                            : "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
                        }`}
                        style={{
                          transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                        }}
                      >
                        {formatChange(pageviewsChange)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3
                    className={`font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-600 transition-colors ${
                      dataDensity === "compact"
                        ? "text-xs mb-1"
                        : "text-xs mb-3"
                    }`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    Views
                  </h3>
                  <p
                    className={`font-black text-slate-900 tracking-tight leading-none group-hover:text-emerald-900 transition-colors ${
                      dataDensity === "compact" ? "text-xl" : "text-3xl"
                    }`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    {loading ? (
                      <SkeletonLoader
                        className={`${
                          dataDensity === "compact" ? "h-6 w-20" : "h-8 w-24"
                        } bg-slate-200 animate-pulse`}
                      />
                    ) : (
                      <span
                        className="inline-block animate-in fade-in-0"
                        style={{
                          animationDuration: `${ANIMATION_TIMING.slow}ms`,
                        }}
                      >
                        {typeof totalPageviews === "number"
                          ? totalPageviews.toLocaleString()
                          : "—"}
                      </span>
                    )}
                  </p>

                  {/* Comparison data */}
                  {comparisonMode && !loading && (
                    <div
                      className={`${
                        dataDensity === "compact" ? "mt-1" : "mt-2"
                      } text-slate-500`}
                    >
                      <p
                        className={`${
                          dataDensity === "compact" ? "text-xs" : "text-sm"
                        } font-medium`}
                      >
                        Previous:{" "}
                        {typeof prevTotalPageviews === "number"
                          ? prevTotalPageviews.toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visitors Card */}
            <div
              className="group bg-white border-l-4 border-l-blue-500 border-r border-t border-b border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all hover:-translate-y-1 cursor-pointer animate-in slide-in-from-bottom-4"
              style={{
                animationDuration: `${ANIMATION_TIMING.slow}ms`,
                animationDelay: "200ms",
              }}
            >
              <div
                className={`${
                  dataDensity === "compact" ? "p-4" : "p-7"
                } h-full relative overflow-hidden`}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: `${ANIMATION_TIMING.slow}ms` }}
                ></div>

                <div
                  className={`flex items-start justify-between ${
                    dataDensity === "compact" ? "mb-3" : "mb-6"
                  } relative z-10`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`${
                        dataDensity === "compact" ? "p-2" : "p-3"
                      } bg-blue-50 border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-all group-hover:scale-110 group-hover:rotate-1`}
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                      }}
                    >
                      <Users
                        size={dataDensity === "compact" ? 18 : 22}
                        className="text-blue-600 group-hover:text-blue-700 transition-colors"
                        style={{
                          transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                        }}
                      />
                    </div>
                    <button
                      onClick={() =>
                        toggleFavorite({
                          id: "visitors",
                          name: "Visitors",
                          section: "metrics",
                          value: totalVisitors.toLocaleString(),
                        })
                      }
                      className="p-1 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.fast}ms`,
                      }}
                    >
                      {isFavorite("visitors") ? (
                        <Star className="w-4 h-4 text-blue-600 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    {visitorsChange !== 0 && (
                      <span
                        className={`${
                          dataDensity === "compact"
                            ? "text-xs px-2 py-1"
                            : "text-xs px-3 py-1.5"
                        } font-bold transition-all hover:scale-110 ${
                          visitorsChange >= 0
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                            : "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
                        }`}
                        style={{
                          transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                        }}
                      >
                        {formatChange(visitorsChange)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3
                    className={`font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-600 transition-colors ${
                      dataDensity === "compact"
                        ? "text-xs mb-1"
                        : "text-xs mb-3"
                    }`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    Visitors
                  </h3>
                  <p
                    className={`font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-900 transition-colors ${
                      dataDensity === "compact" ? "text-xl" : "text-3xl"
                    }`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    {loading ? (
                      <SkeletonLoader
                        className={`${
                          dataDensity === "compact" ? "h-6 w-20" : "h-8 w-24"
                        } bg-slate-200 animate-pulse`}
                      />
                    ) : (
                      <span
                        className="inline-block animate-in fade-in-0"
                        style={{
                          animationDuration: `${ANIMATION_TIMING.slow}ms`,
                        }}
                      >
                        {typeof totalVisitors === "number"
                          ? totalVisitors.toLocaleString()
                          : "—"}
                      </span>
                    )}
                  </p>

                  {/* Comparison data */}
                  {comparisonMode && !loading && (
                    <div
                      className={`${
                        dataDensity === "compact" ? "mt-1" : "mt-2"
                      } text-slate-500`}
                    >
                      <p
                        className={`${
                          dataDensity === "compact" ? "text-xs" : "text-sm"
                        } font-medium`}
                      >
                        Previous:{" "}
                        {typeof prevTotalVisitors === "number"
                          ? prevTotalVisitors.toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bounce Rate Card */}
            <div
              className="group bg-white border-l-4 border-l-amber-500 border-r border-t border-b border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-amber-100/50 transition-all hover:-translate-y-1 cursor-pointer animate-in slide-in-from-bottom-4"
              style={{
                animationDuration: `${ANIMATION_TIMING.slow}ms`,
                animationDelay: "300ms",
              }}
            >
              <div
                className={`${
                  dataDensity === "compact" ? "p-4" : "p-7"
                } h-full relative overflow-hidden`}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-amber-50/0 via-amber-50/0 to-amber-50/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: `${ANIMATION_TIMING.slow}ms` }}
                ></div>

                <div
                  className={`flex items-start justify-between ${
                    dataDensity === "compact" ? "mb-3" : "mb-6"
                  } relative z-10`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`${
                        dataDensity === "compact" ? "p-2" : "p-3"
                      } bg-amber-50 border border-amber-100 group-hover:bg-amber-100 group-hover:border-amber-200 transition-all group-hover:scale-110 group-hover:rotate-1`}
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                      }}
                    >
                      <AlertTriangle
                        size={dataDensity === "compact" ? 18 : 22}
                        className="text-amber-600 group-hover:text-amber-700 transition-colors"
                        style={{
                          transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                        }}
                      />
                    </div>
                    <button
                      onClick={() =>
                        toggleFavorite({
                          id: "bounceRate",
                          name: "Bounce Rate",
                          section: "metrics",
                          value:
                            typeof bounceRateValue === "number"
                              ? `${bounceRateValue.toFixed(1)}%`
                              : "—",
                        })
                      }
                      className="p-1 hover:bg-amber-100 transition-colors opacity-0 group-hover:opacity-100"
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.fast}ms`,
                      }}
                    >
                      {isFavorite("bounceRate") ? (
                        <Star className="w-4 h-4 text-amber-600 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    {bounceRateChange !== undefined && (
                      <span
                        className={`${
                          dataDensity === "compact"
                            ? "text-xs px-2 py-1"
                            : "text-xs px-3 py-1.5"
                        } font-bold transition-all hover:scale-110 ${
                          bounceRateChange >= 0
                            ? "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
                            : "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                        }`}
                        style={{
                          transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                        }}
                      >
                        {formatChange(bounceRateChange)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3
                    className={`font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-600 transition-colors ${
                      dataDensity === "compact"
                        ? "text-xs mb-1"
                        : "text-xs mb-3"
                    }`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    Bounce Rate
                  </h3>
                  <p
                    className={`font-black text-slate-900 tracking-tight leading-none group-hover:text-amber-900 transition-colors ${
                      dataDensity === "compact" ? "text-xl" : "text-3xl"
                    }`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    {loading ? (
                      <SkeletonLoader
                        className={`${
                          dataDensity === "compact" ? "h-6 w-20" : "h-8 w-24"
                        } bg-slate-200 animate-pulse`}
                      />
                    ) : (
                      <span
                        className="inline-block animate-in fade-in-0"
                        style={{
                          animationDuration: `${ANIMATION_TIMING.slow}ms`,
                        }}
                      >
                        {typeof bounceRateValue === "number" &&
                        !isNaN(bounceRateValue)
                          ? `${bounceRateValue.toFixed(1)}%`
                          : "—"}
                      </span>
                    )}
                  </p>

                  {/* Comparison data */}
                  {comparisonMode && !loading && (
                    <div
                      className={`${
                        dataDensity === "compact" ? "mt-1" : "mt-2"
                      } text-slate-500`}
                    >
                      <p
                        className={`${
                          dataDensity === "compact" ? "text-xs" : "text-sm"
                        } font-medium`}
                      >
                        Previous:{" "}
                        {typeof prevBounceRateValue === "number"
                          ? `${prevBounceRateValue.toFixed(1)}%`
                          : "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Avg Session Card */}
            <div
              className="group bg-white border-l-4 border-l-purple-500 border-r border-t border-b border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-purple-100/50 transition-all hover:-translate-y-1 cursor-pointer animate-in slide-in-from-bottom-4"
              style={{
                animationDuration: `${ANIMATION_TIMING.slow}ms`,
                animationDelay: "400ms",
              }}
            >
              <div
                className={`${
                  dataDensity === "compact" ? "p-4" : "p-7"
                } h-full relative overflow-hidden`}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-purple-50/0 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: `${ANIMATION_TIMING.slow}ms` }}
                ></div>

                <div
                  className={`flex items-start justify-between ${
                    dataDensity === "compact" ? "mb-3" : "mb-6"
                  } relative z-10`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`${
                        dataDensity === "compact" ? "p-2" : "p-3"
                      } bg-purple-50 border border-purple-100 group-hover:bg-purple-100 group-hover:border-purple-200 transition-all group-hover:scale-110 group-hover:rotate-1`}
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                      }}
                    >
                      <Clock
                        size={dataDensity === "compact" ? 18 : 22}
                        className="text-purple-600 group-hover:text-purple-700 transition-colors"
                        style={{
                          transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                        }}
                      />
                    </div>
                    <button
                      onClick={() =>
                        toggleFavorite({
                          id: "avgSession",
                          name: "Avg Session",
                          section: "metrics",
                          value:
                            typeof avgSessionDurationValue === "number"
                              ? formatTime(avgSessionDurationValue)
                              : "—",
                        })
                      }
                      className="p-1 hover:bg-purple-100 transition-colors opacity-0 group-hover:opacity-100"
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.fast}ms`,
                      }}
                    >
                      {isFavorite("avgSession") ? (
                        <Star className="w-4 h-4 text-purple-600 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4 text-purple-400" />
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    {avgSessionDurationChange !== undefined && (
                      <span
                        className={`${
                          dataDensity === "compact"
                            ? "text-xs px-2 py-1"
                            : "text-xs px-3 py-1.5"
                        } font-bold transition-all hover:scale-110 ${
                          avgSessionDurationChange >= 0
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                            : "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
                        }`}
                        style={{
                          transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                        }}
                      >
                        {formatChange(avgSessionDurationChange)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3
                    className={`font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-600 transition-colors ${
                      dataDensity === "compact"
                        ? "text-xs mb-1"
                        : "text-xs mb-3"
                    }`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    Avg. Session
                  </h3>
                  <p
                    className={`font-black text-slate-900 tracking-tight leading-none group-hover:text-purple-900 transition-colors ${
                      dataDensity === "compact" ? "text-xl" : "text-3xl"
                    }`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    {loading ? (
                      <SkeletonLoader
                        className={`${
                          dataDensity === "compact" ? "h-6 w-20" : "h-8 w-24"
                        } bg-slate-200 animate-pulse`}
                      />
                    ) : (
                      <span
                        className="inline-block animate-in fade-in-0"
                        style={{
                          animationDuration: `${ANIMATION_TIMING.slow}ms`,
                        }}
                      >
                        {typeof avgSessionDurationValue === "number" &&
                        !isNaN(avgSessionDurationValue)
                          ? formatTime(avgSessionDurationValue)
                          : "—"}
                      </span>
                    )}
                  </p>

                  {/* Comparison data */}
                  {comparisonMode && !loading && (
                    <div
                      className={`${
                        dataDensity === "compact" ? "mt-1" : "mt-2"
                      } text-slate-500`}
                    >
                      <p
                        className={`${
                          dataDensity === "compact" ? "text-xs" : "text-sm"
                        } font-medium`}
                      >
                        Previous:{" "}
                        {typeof prevAvgSessionDurationValue === "number"
                          ? formatTime(prevAvgSessionDurationValue)
                          : "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Metric Chart */}
        <section
          className="animate-in fade-in-0 slide-in-from-bottom-4"
          style={{
            animationDuration: `${ANIMATION_TIMING.entrance}ms`,
            animationDelay: "700ms",
          }}
        >
          <div
            className="bg-white border-l-4 border-l-slate-900 border-r border-t border-b border-slate-200 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1"
            style={{ transitionDuration: `${ANIMATION_TIMING.slow}ms` }}
          >
            <div
              className={`px-8 ${
                dataDensity === "compact" ? "py-4" : "py-7"
              } border-b border-slate-200`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`${
                    dataDensity === "compact" ? "p-2" : "p-3"
                  } bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all hover:scale-110 hover:rotate-2`}
                  style={{ transitionDuration: `${ANIMATION_TIMING.normal}ms` }}
                >
                  <BarChart3
                    className={`${
                      dataDensity === "compact" ? "w-5 h-5" : "w-6 h-6"
                    } text-slate-700 hover:text-slate-900 transition-colors`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  />
                </div>
                <div>
                  <h2
                    className={`font-black text-slate-900 tracking-tight ${
                      dataDensity === "compact" ? "text-xl" : "text-2xl"
                    }`}
                  >
                    Performance Metrics
                  </h2>
                  <p
                    className={`text-slate-600 mt-1 font-medium ${
                      dataDensity === "compact" ? "text-xs" : "text-sm"
                    }`}
                  >
                    Track your website performance over time
                    {comparisonMode && (
                      <span className="ml-2 text-emerald-600">
                        • Comparison Active
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${dataDensity === "compact" ? "p-4" : "p-8"}`}>
              <SimpleTabs
                tabs={METRIC_TABS}
                value={selectedMetric}
                onChange={(tabId) =>
                  setSelectedMetric(
                    tabId as "pageviews" | "visitors" | "bounceRate"
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* Secondary Analytics */}
        <section
          className="animate-in fade-in-0 slide-in-from-bottom-4"
          style={{
            animationDuration: `${ANIMATION_TIMING.entrance}ms`,
            animationDelay: "1000ms",
          }}
        >
          <div
            className="bg-white border-l-4 border-l-slate-900 border-r border-t border-b border-slate-200 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1"
            style={{ transitionDuration: `${ANIMATION_TIMING.slow}ms` }}
          >
            <div
              className={`px-8 ${
                dataDensity === "compact" ? "py-4" : "py-7"
              } border-b border-slate-200`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`${
                    dataDensity === "compact" ? "p-2" : "p-3"
                  } bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all hover:scale-110 hover:rotate-2`}
                  style={{ transitionDuration: `${ANIMATION_TIMING.normal}ms` }}
                >
                  <Activity
                    className={`${
                      dataDensity === "compact" ? "w-5 h-5" : "w-6 h-6"
                    } text-slate-700 hover:text-slate-900 transition-colors`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  />
                </div>
                <div>
                  <h2
                    className={`font-black text-slate-900 tracking-tight ${
                      dataDensity === "compact" ? "text-xl" : "text-2xl"
                    }`}
                  >
                    Traffic Analytics
                  </h2>
                  <p
                    className={`text-slate-600 mt-1 font-medium ${
                      dataDensity === "compact" ? "text-xs" : "text-sm"
                    }`}
                  >
                    Explore traffic sources and user behavior
                  </p>
                </div>
              </div>
            </div>
            <div className={`${dataDensity === "compact" ? "p-4" : "p-8"}`}>
              <SimpleTabs tabs={TABS} />
            </div>
          </div>
        </section>

        {/* Global View */}
        <section
          className="animate-in fade-in-0 slide-in-from-bottom-4"
          style={{
            animationDuration: `${ANIMATION_TIMING.entrance}ms`,
            animationDelay: "1300ms",
          }}
        >
          <div
            className="bg-white border-l-4 border-l-slate-900 border-r border-t border-b border-slate-200 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1"
            style={{ transitionDuration: `${ANIMATION_TIMING.slow}ms` }}
          >
            <div
              className={`px-8 ${
                dataDensity === "compact" ? "py-4" : "py-7"
              } border-b border-slate-200`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-5">
                  <div
                    className={`${
                      dataDensity === "compact" ? "p-2" : "p-3"
                    } bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all hover:scale-110 hover:rotate-2`}
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    <Globe
                      className={`${
                        dataDensity === "compact" ? "w-5 h-5" : "w-6 h-6"
                      } text-slate-700 hover:text-slate-900 transition-colors`}
                      style={{
                        transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                      }}
                    />
                  </div>
                  <div>
                    <h2
                      className={`font-black text-slate-900 tracking-tight ${
                        dataDensity === "compact" ? "text-xl" : "text-2xl"
                      }`}
                    >
                      Global Audience
                    </h2>
                    <p
                      className={`text-slate-600 mt-1 font-medium ${
                        dataDensity === "compact" ? "text-xs" : "text-sm"
                      }`}
                    >
                      See where your visitors are coming from
                    </p>
                  </div>
                </div>

                {/* Export button for countries */}
                {countryStatsData.length > 0 && (
                  <button
                    onClick={handleExportCountries}
                    disabled={isExporting}
                    className={`${
                      dataDensity === "compact"
                        ? "px-3 py-1 text-xs"
                        : "px-4 py-2 text-sm"
                    } font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 disabled:opacity-50`}
                    style={{ transitionDuration: `${ANIMATION_TIMING.fast}ms` }}
                  >
                    {isExporting ? "Exporting..." : "Export Countries"}
                  </button>
                )}
              </div>
            </div>
            <div className={`${dataDensity === "compact" ? "p-4" : "p-8"}`}>
              {loading ? (
                <div
                  className={`${
                    dataDensity === "compact" ? "h-64" : "h-96"
                  } flex items-center justify-center bg-slate-50 border border-slate-200`}
                >
                  <div
                    className="flex flex-col items-center gap-4 animate-in zoom-in-50"
                    style={{ animationDuration: `${ANIMATION_TIMING.slow}ms` }}
                  >
                    <SkeletonLoader
                      className={`${
                        dataDensity === "compact" ? "h-6 w-6" : "h-8 w-8"
                      } bg-slate-300 animate-pulse rounded`}
                    />
                    <p
                      className={`text-slate-500 font-medium ${
                        dataDensity === "compact" ? "text-xs" : "text-sm"
                      }`}
                    >
                      Loading global data...
                    </p>
                  </div>
                </div>
              ) : countryMapData.length > 0 ? (
                <div
                  className={`grid grid-cols-1 lg:grid-cols-3 ${
                    dataDensity === "compact" ? "gap-4" : "gap-8"
                  } animate-in fade-in-0`}
                  style={{ animationDuration: `${ANIMATION_TIMING.slow}ms` }}
                >
                  <div className="lg:col-span-2">
                    <WorldMap
                      data={countryMapData}
                      hoveredCountry={hoveredCountry}
                      onCountryHover={setHoveredCountry}
                      selectedCountry={selectedCountry}
                      onCountrySelect={setSelectedCountry}
                    />
                  </div>
                  <div
                    className="hover:-translate-y-1 transition-transform"
                    style={{
                      transitionDuration: `${ANIMATION_TIMING.normal}ms`,
                    }}
                  >
                    <CountryStats data={countryStatsData} />
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No Geographic Data"
                  description="No visitor location data available for the selected time period"
                  icon={<Globe className="w-8 h-8 text-slate-400" />}
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
