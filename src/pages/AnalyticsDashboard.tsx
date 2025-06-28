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
import { useSite } from "../contexts/SiteContext";

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
  const { currentSiteId, currentSite, loading: siteLoading } = useSite();
  // State for date range
  const [startDate, setStartDate] = useState(() => startOfDay(subDays(new Date(), 7)));
  const [endDate, setEndDate] = useState(() => endOfDay(new Date()));

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
        const data = await analyticsService.getRealtimeMetrics(currentSiteId);
        setRealtime(data);
      } catch (err) {
        // ignore
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
          pageviews, prevPageviews,
          visitors, prevVisitors,
          bounceRate, prevBounceRate,
          avgSessionDuration, prevAvgSessionDuration,
          pages, referrers, browsers, countries
        ] = await Promise.all([
          analyticsService.getPageviews(currentSiteId, startDate, endDate),
          analyticsService.getPageviews(currentSiteId, prevStartDate, prevEndDate),
          analyticsService.getUniqueVisitors(currentSiteId, startDate, endDate),
          analyticsService.getUniqueVisitors(currentSiteId, prevStartDate, prevEndDate),
          analyticsService.getBounceRate(currentSiteId, startDate, endDate),
          analyticsService.getBounceRate(currentSiteId, prevStartDate, prevEndDate),
          analyticsService.getAvgSessionDuration(currentSiteId, startDate, endDate),
          analyticsService.getAvgSessionDuration(currentSiteId, prevStartDate, prevEndDate),
          analyticsService.getTopPages(currentSiteId, startDate, endDate, 10),
          analyticsService.getReferrers(currentSiteId, startDate, endDate, 10),
          analyticsService.getBrowserStats(currentSiteId, startDate, endDate),
          analyticsService.getCountries(currentSiteId, startDate, endDate),
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
            const data = await analyticsService.getVisitorsTrend(currentSiteId, startDate, endDate, interval);
            setVisitorsTrend(data);
          } else if (selectedMetric === 'bounceRate') {
            const data = await analyticsService.getBounceRateTrend(currentSiteId, startDate, endDate, interval);
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
  }, [selectedMetric, startDate, endDate, currentSiteId]);

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

  // Tab icon helpers
  const metricTabIcons = {
    pageviews: <Eye size={18} className="mr-2 text-indigo-500" />,
    visitors: <Users size={18} className="mr-2 text-teal-500" />,
    bounceRate: <AlertTriangle size={18} className="mr-2 text-purple-500" />,
  };
  const secondaryTabIcons = {
    pages: <Eye size={15} className="mr-2 text-indigo-400" />,
    referrers: <Users size={15} className="mr-2 text-teal-400" />,
    audience: <Clock size={15} className="mr-2 text-purple-400" />,
  };

  // Main metric chart tabs
  const METRIC_TABS = [
    {
      id: 'pageviews',
      label: <span className="flex items-center font-semibold tracking-tight uppercase text-xs">{metricTabIcons.pageviews}Pageviews</span>,
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
      label: <span className="flex items-center font-semibold tracking-tight uppercase text-xs">{metricTabIcons.visitors}Visitors</span>,
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
      label: <span className="flex items-center font-semibold tracking-tight uppercase text-xs">{metricTabIcons.bounceRate}Bounce Rate</span>,
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
    { id: 'pages', label: <span className="flex items-center font-semibold tracking-tight uppercase text-xs">{secondaryTabIcons.pages}Top Pages</span>, content: <HorizontalBarChart data={topPagesChartData} title="Top Pages" /> },
    { id: 'referrers', label: <span className="flex items-center font-semibold tracking-tight uppercase text-xs">{secondaryTabIcons.referrers}Referrers</span>, content: <HorizontalBarChart data={referrersChartData} title="Referrers" /> },
    { id: 'audience', label: <span className="flex items-center font-semibold tracking-tight uppercase text-xs">{secondaryTabIcons.audience}Audience</span>, content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SimpleBarChart data={browsersChartData} title="Browsers" />
        <SimpleBarChart data={osChartData} title="Operating Systems" />
        <SimpleBarChart data={devicesChartData} title="Devices" />
      </div>
    )},
  ];

  if (error) {
    return <div className="p-8 text-red-500 font-semibold text-lg">Error: {error}</div>;
  }

  return (
    <div className="p-10 bg-white min-h-screen font-sans">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
        <div className="flex items-center gap-5">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          {realtime ? (
            <span className="ml-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold shadow-sm border border-teal-100">
              {typeof realtime.activeVisitors === 'number' ? realtime.activeVisitors : '—'} active
            </span>
          ) : (
            <span className="ml-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-400 text-sm font-semibold animate-pulse border border-gray-200 shadow-sm">
              ...
            </span>
          )}
        </div>
        <div className="flex-shrink-0">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
        </div>
      </header>

      <main>
        {/* Stat Cards */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard title="Views" value={loading ? "..." : (typeof totalPageviews === 'number' ? totalPageviews.toLocaleString() : '—')} change={formatChange(pageviewsChange)} trend={pageviewsChange >= 0 ? "up" : "down"} icon={<Eye size={20} className="text-indigo-500" />} />
            <StatCard title="Visitors" value={loading ? "..." : (typeof totalVisitors === 'number' ? totalVisitors.toLocaleString() : '—')} change={formatChange(visitorsChange)} trend={visitorsChange >= 0 ? "up" : "down"} icon={<Users size={20} className="text-teal-500" />} />
            <StatCard title="Bounce Rate" value={loading ? "..." : (typeof bounceRateValue === 'number' && !isNaN(bounceRateValue) ? `${bounceRateValue.toFixed(1)}%` : '—')} icon={<AlertTriangle size={20} className="text-purple-500" />} />
            <StatCard title="Avg. Session" value={loading ? "..." : (typeof avgSessionDurationValue === 'number' && !isNaN(avgSessionDurationValue) ? formatTime(avgSessionDurationValue) : '—')} icon={<Clock size={20} className="text-gray-700" />} />
          </div>
        </section>

        {/* Main Metric Tabs + Chart */}
        <section className="mb-12">
          <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 shadow-md">
            <SimpleTabs tabs={METRIC_TABS} value={selectedMetric} onChange={(tabId) => setSelectedMetric(tabId as 'pageviews' | 'visitors' | 'bounceRate')} />
          </div>
        </section>

        {/* Secondary Analytics Tabs */}
        <section className="mb-12">
          <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 shadow-md">
            <SimpleTabs tabs={TABS} />
          </div>
        </section>

        {/* Global View */}
        <section>
          <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Global View</h3>
            {loading ? <div className="h-96 flex items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div> : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
        </section>
      </main>
    </div>
  );
} 