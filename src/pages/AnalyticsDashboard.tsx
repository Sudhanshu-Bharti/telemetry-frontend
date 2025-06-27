import { useState, useEffect, useMemo } from "react";
import { subDays, startOfDay, endOfDay, parseISO, format, isSameDay } from "date-fns";
import { config } from "../config/config";
import {
  analyticsService,
  type PageviewData,
  type UniqueVisitorsData,
  type TopPageData,
  type ReferrerData,
  type CountryData,
  type RealtimeMetricsData,
  type VisitorsTrendData,
  type BounceRateTrendData,
} from "../services/analytics";

import { DateRangePicker } from "../components/DateRangePickerModern";
import { StatCard } from "../components/ui/StatCard";
import { Eye, Users, AlertTriangle, Clock } from "lucide-react";
import { Tabs } from "../components/ui/Tabs";
import { SimpleLineChart, HorizontalBarChart, SimpleBarChart, StackedBarChart } from "../components/charts/SimpleCharts";
import WorldMap from "../components/charts/WorldMap";
import { CountryStats } from "../components/charts/CountryStats";
import { getAlpha3 } from "../lib/alpha2toalpha3";
import { LoadingSpinner } from "../components/ui/Card";

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
};

// Helper functions
const formatChange = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

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

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                (tab.id === activeTab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300') +
                ' whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-6">
        {activeContent}
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  // State for date range
  const [startDate, setStartDate] = useState(() => startOfDay(subDays(new Date(), 7)));
  const [endDate, setEndDate] = useState(() => endOfDay(new Date()));

  // State for site ID
  const [siteId] = useState(config.defaultSiteId);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [pageviewData, setPageviewData] = useState<PageviewData[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState<UniqueVisitorsData>({ uniqueVisitors: 0 });

  // Interaction states
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [realtime, setRealtime] = useState<RealtimeMetricsData | null>(null);

  // Data states for current and previous periods
  const [currentData, setCurrentData] = useState<any>({});
  const [previousData, setPreviousData] = useState<any>({});

  // Metric selector state
  const [selectedMetric, setSelectedMetric] = useState<'pageviews' | 'visitors' | 'bounceRate'>('pageviews');
  const [trendLoading, setTrendLoading] = useState(false);
  const [visitorsTrend, setVisitorsTrend] = useState<VisitorsTrendData[]>([]);
  const [bounceRateTrend, setBounceRateTrend] = useState<BounceRateTrendData[]>([]);

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchRealtime = async () => {
      try {
        const data = await analyticsService.getRealtimeMetrics(siteId);
        setRealtime(data);
      } catch (err) {
        // ignore
      }
    };
    fetchRealtime();
    interval = setInterval(fetchRealtime, 10000);
    return () => clearInterval(interval);
  }, [siteId]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Calculate previous period
        const diff = endDate.getTime() - startDate.getTime();
        const prevEndDate = new Date(startDate.getTime() - 1);
        const prevStartDate = new Date(prevEndDate.getTime() - diff);
        const [
          pageviews, prevPageviews,
          visitors, prevVisitors,
          bounceRate, prevBounceRate,
          avgSessionDuration, prevAvgSessionDuration,
          pages, referrers, browsers, countries
        ] = await Promise.all([
          analyticsService.getPageviews(siteId, startDate, endDate),
          analyticsService.getPageviews(siteId, prevStartDate, prevEndDate),
          analyticsService.getUniqueVisitors(siteId, startDate, endDate),
          analyticsService.getUniqueVisitors(siteId, prevStartDate, prevEndDate),
          analyticsService.getBounceRate(siteId, startDate, endDate),
          analyticsService.getBounceRate(siteId, prevStartDate, prevEndDate),
          analyticsService.getAvgSessionDuration(siteId, startDate, endDate),
          analyticsService.getAvgSessionDuration(siteId, prevStartDate, prevEndDate),
          analyticsService.getTopPages(siteId, startDate, endDate, 10),
          analyticsService.getReferrers(siteId, startDate, endDate, 10),
          analyticsService.getBrowserStats(siteId, startDate, endDate),
          analyticsService.getCountries(siteId, startDate, endDate),
        ]);
        setPageviewData(pageviews);
        setCurrentData({ pageviews, visitors, bounceRate, avgSessionDuration, pages, referrers, browsers, countries });
        setPreviousData({ pageviews: prevPageviews, visitors: prevVisitors, bounceRate: prevBounceRate, avgSessionDuration: prevAvgSessionDuration });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [startDate, endDate, siteId]);

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
  } = useMemo(() => {
    const currentViews = currentData.pageviews?.reduce((sum:number, item:any) => sum + item._count.id, 0) || 0;
    const prevViews = previousData.pageviews?.reduce((sum:number, item:any) => sum + item._count.id, 0) || 0;
    const currentVisitors = currentData.visitors?.uniqueVisitors || 0;
    const prevVisitors = previousData.visitors?.uniqueVisitors || 0;
    const currentBounce = currentData.bounceRate?.bounceRate;
    const prevBounce = previousData.bounceRate?.bounceRate;
    // Convert ms to s for session duration
    const currentSession = typeof currentData.avgSessionDuration?.averageSessionDuration === 'number' ? currentData.avgSessionDuration.averageSessionDuration / 1000 : undefined;
    const prevSession = typeof previousData.avgSessionDuration?.averageSessionDuration === 'number' ? previousData.avgSessionDuration.averageSessionDuration / 1000 : undefined;
    return {
      totalPageviews: currentViews,
      totalVisitors: currentVisitors,
      pageviewsChange: prevViews === 0 ? 0 : ((currentViews - prevViews) / prevViews) * 100,
      visitorsChange: prevVisitors === 0 ? 0 : ((currentVisitors - prevVisitors) / prevVisitors) * 100,
      bounceRateValue: typeof currentBounce === 'number' ? currentBounce : undefined,
      bounceRateChange: (typeof currentBounce === 'number' && typeof prevBounce === 'number' && prevBounce !== 0) ? ((currentBounce - prevBounce) / prevBounce) * 100 : undefined,
      avgSessionDurationValue: currentSession,
      avgSessionDurationChange: (typeof currentSession === 'number' && typeof prevSession === 'number' && prevSession !== 0) ? ((currentSession - prevSession) / prevSession) * 100 : undefined,
      topPages: currentData.pages || [],
      referrers: currentData.referrers || [],
      browserStats: currentData.browsers || { browsers: [], os: [], devices: [] },
      countries: currentData.countries || [],
    }
  }, [currentData, previousData]);

  // Prepare chart data
  const lineChartData = useMemo(() => {
    let data: { date: Date; value: number }[] = [];
    if (isSameDay(startDate, endDate)) {
      const groupedByHour: Record<string, { date: Date; value: number }> = {};
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = String(hour).padStart(2, '0');
        groupedByHour[hourStr] = { date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), hour), value: 0 };
      }
      pageviewData.forEach(item => {
        const hour = format(parseISO(item.createdAt), 'HH');
        groupedByHour[hour].value += item._count.id;
      });
      data = Object.values(groupedByHour);
    } else {
      const groupedByDay: Record<string, { date: Date; value: number }> = {};
      pageviewData.forEach(item => {
        const day = format(parseISO(item.createdAt), 'yyyy-MM-dd');
        if (!groupedByDay[day]) {
          groupedByDay[day] = { date: parseISO(item.createdAt), value: 0 };
        }
        groupedByDay[day].value += item._count.id;
      });
      data = Object.values(groupedByDay);
    }
    return data.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [pageviewData, startDate, endDate]);

  const topPagesChartData = topPages.map((item: TopPageData) => ({ name: item.path, value: item._count.id, percentage: `${((item._count.id / totalPageviews) * 100).toFixed(1)}` }));
  const referrersChartData = referrers.map((item: ReferrerData) => ({ name: item.referrer, value: item._count.id, percentage: `${((item._count.id / totalPageviews) * 100).toFixed(1)}` }));
  const browsersChartData = browserStats.browsers.map((item: { browser: string; _count: { id: number } }) => ({ name: item.browser || 'Unknown', value: item._count.id }));
  const osChartData = browserStats.os.map((item: { os: string; _count: { id: number } }) => ({ name: item.os || 'Unknown', value: item._count.id }));
  const devicesChartData = browserStats.devices.map((item: { device: string; _count: { id: number } }) => ({ name: item.device || 'Unknown', value: item._count.id }));

  const countryMapData = useMemo(() => countries
    .map((item: CountryData) => {
      const alpha3 = getAlpha3(item.country);
      if (!alpha3) return null;
      return { alpha_3: alpha3, name: item.country, visitors: item._count.id, code: alpha3 };
    })
    // @ts-ignore
    .filter((item): item is { alpha_3: string; name: string; visitors: number; code: string } => item !== null), [countries]);

  const countryStatsData = useMemo(() => countries.map((item: CountryData) => ({
    name: item.country,
    value: item._count.id,
    percentage: ((item._count.id / totalPageviews) * 100).toFixed(1),
  })), [countries, totalPageviews]);

  // Fetch visitors and bounce rate trend when metric or date range changes
  useEffect(() => {
    if (selectedMetric === 'visitors' || selectedMetric === 'bounceRate') {
      setTrendLoading(true);
      const fetchTrend = async () => {
        try {
          const interval = isSameDay(startDate, endDate) ? 'hour' : 'day';
          if (selectedMetric === 'visitors') {
            const data = await analyticsService.getVisitorsTrend(siteId, startDate, endDate, interval);
            setVisitorsTrend(data);
          } else if (selectedMetric === 'bounceRate') {
            const data = await analyticsService.getBounceRateTrend(siteId, startDate, endDate, interval);
            setBounceRateTrend(data);
          }
        } catch (err) {
          // Optionally handle error
        } finally {
          setTrendLoading(false);
        }
      };
      fetchTrend();
    }
  }, [selectedMetric, startDate, endDate, siteId]);

  // Prepare chart data for each metric
  const pageviewsChartData = useMemo(() => lineChartData, [lineChartData]);
  const visitorsChartData = useMemo(() => {
    return (visitorsTrend as any[]).map(item => ({
      date: new Date(item.date),
      value: item.uniqueVisitors ?? item.count ?? 0,
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [visitorsTrend]);
  const bounceRateStackedBarData = useMemo(() => {
    if (isSameDay(startDate, endDate)) {
      // Group by hour for single day
      const groupedByHour: { [hour: string]: { date: Date; bounce: number; nonBounce: number } } = {};
      for (let hour = 0; hour < 24; hour++) {
        const hourLabel = `${hour}:00`;
        groupedByHour[hourLabel] = {
          date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), hour),
          bounce: 0,
          nonBounce: 0,
        };
      }
      bounceRateTrend.forEach(item => {
        const hour = new Date(item.date).getHours();
        const hourLabel = `${hour}:00`;
        if (groupedByHour[hourLabel]) {
          groupedByHour[hourLabel].bounce += item.bounceSessions;
          groupedByHour[hourLabel].nonBounce += (item.totalSessions - item.bounceSessions);
        }
      });
      return Object.values(groupedByHour);
    } else {
      // Group by day for multi-day
      return bounceRateTrend.map(item => ({
        date: new Date(item.date),
        bounce: item.bounceSessions,
        nonBounce: item.totalSessions - item.bounceSessions,
      }));
    }
  }, [bounceRateTrend, startDate, endDate]);

  useEffect(() => {
    if (selectedMetric === 'visitors') {
      console.log('Visitors trend data:', visitorsTrend);
    }
  }, [visitorsTrend, selectedMetric]);

  // Main metric chart tabs
  const METRIC_TABS = [
    {
      id: 'pageviews',
      label: 'Pageviews',
      content: (
        loading || trendLoading ? (
          <div className="h-80 flex items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div>
        ) : (
          <SimpleLineChart data={pageviewsChartData} title="Page Views" />
        )
      ),
    },
    {
      id: 'visitors',
      label: 'Visitors',
      content: (
        loading || trendLoading ? (
          <div className="h-80 flex items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div>
        ) : (
          <SimpleLineChart data={visitorsChartData} title="Visitors" />
        )
      ),
    },
    {
      id: 'bounceRate',
      label: 'Bounce Rate',
      content: (
        loading || trendLoading ? (
          <div className="h-80 flex items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div>
        ) : (
          <StackedBarChart data={bounceRateStackedBarData} title="Bounce vs Non-Bounce Sessions" />
        )
      ),
    },
  ];

  const TABS = [
    // { id: 'overview', label: 'Page Views', content: <SimpleLineChart data={lineChartData} title="Page Views" /> },
    { id: 'pages', label: 'Top Pages', content: <HorizontalBarChart data={topPagesChartData} title="Top Pages" /> },
    { id: 'referrers', label: 'Referrers', content: <HorizontalBarChart data={referrersChartData} title="Referrers" /> },
    { id: 'audience', label: 'Audience', content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SimpleBarChart data={browsersChartData} title="Browsers" />
        <SimpleBarChart data={osChartData} title="Operating Systems" />
        <SimpleBarChart data={devicesChartData} title="Devices" />
      </div>
    )},
  ];

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          {realtime ? (
            <span className="ml-4 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              {typeof realtime.activeVisitors === 'number' ? realtime.activeVisitors : '—'} active
            </span>
          ) : (
            <span className="ml-4 px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-semibold animate-pulse">
              ...
            </span>
          )}
        </div>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </header>

      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Views" value={loading ? "..." : (typeof totalPageviews === 'number' ? totalPageviews.toLocaleString() : '—')} change={formatChange(pageviewsChange)} trend={pageviewsChange >= 0 ? "up" : "down"} icon={<Eye size={16} />} />
          <StatCard title="Visitors" value={loading ? "..." : (typeof totalVisitors === 'number' ? totalVisitors.toLocaleString() : '—')} change={formatChange(visitorsChange)} trend={visitorsChange >= 0 ? "up" : "down"} icon={<Users size={16} />} />
          <StatCard title="Bounce Rate" value={loading ? "..." : (typeof bounceRateValue === 'number' && !isNaN(bounceRateValue) ? `${bounceRateValue.toFixed(1)}%` : '—')} icon={<AlertTriangle size={16} />} />
          <StatCard title="Avg. Session" value={loading ? "..." : (typeof avgSessionDurationValue === 'number' && !isNaN(avgSessionDurationValue) ? formatTime(avgSessionDurationValue) : '—')} icon={<Clock size={16} />} />
        </div>
        
        {/* Main Metric Tabs */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
          <SimpleTabs tabs={METRIC_TABS} value={selectedMetric} onChange={(tabId) => setSelectedMetric(tabId as 'pageviews' | 'visitors' | 'bounceRate')} />
        </div>

        {/* Secondary Analytics Tabs */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
          <SimpleTabs tabs={TABS} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Global View</h3>
          {loading ? <div className="h-96 flex items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div> : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <WorldMap
                  data={countryMapData}
                  hoveredCountry={hoveredCountry}
                  onCountryHover={setHoveredCountry}
                  selectedCountry={selectedCountry}
                  onCountrySelect={setSelectedCountry}
                />
              </div>
              <div>
                <CountryStats data={countryStatsData} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 