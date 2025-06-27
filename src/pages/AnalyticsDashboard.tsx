import { useState, useEffect, useMemo } from "react";
import { subDays, startOfDay, endOfDay, parseISO, format, isSameDay } from "date-fns";
import { config } from "../config/config";
import {
  analyticsService,
  type PageviewData,
  type UniqueVisitorsData,
  type TopPageData,
  type ReferrerData,
  type BrowserStatsData,
  type CountryData,
} from "../services/analytics";
import { DateRangePicker } from "../components/DateRangePickerModern";
import { StatCard } from "../components/ui/StatCard";
import { Eye, Users, AlertTriangle, Clock } from "lucide-react";
import { Tabs } from "../components/ui/Tabs";
import { SimpleLineChart, HorizontalBarChart, SimpleBarChart } from "../components/charts/SimpleCharts";
import WorldMap from "../components/charts/WorldMap";
import { CountryStats } from "../components/charts/CountryStats";
import { getAlpha3 } from "../lib/alpha2toalpha3";
import { LoadingSpinner } from "../components/ui/Card";

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
  const [topPages, setTopPages] = useState<TopPageData[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [browserStats, setBrowserStats] = useState<BrowserStatsData>({ browsers: [], devices: [], os: [] });
  const [countries, setCountries] = useState<CountryData[]>([]);

  // Interaction states
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [pageviews, visitors, pages, refs, browsers, countryData] = await Promise.all([
          analyticsService.getPageviews(siteId, startDate, endDate),
          analyticsService.getUniqueVisitors(siteId, startDate, endDate),
          analyticsService.getTopPages(siteId, startDate, endDate, 10),
          analyticsService.getReferrers(siteId, startDate, endDate, 10),
          analyticsService.getBrowserStats(siteId, startDate, endDate),
          analyticsService.getCountries(siteId, startDate, endDate),
        ]);

        setPageviewData(pageviews);
        setUniqueVisitors(visitors);
        setTopPages(pages);
        setReferrers(refs);
        setBrowserStats(browsers);
        setCountries(countryData);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [startDate, endDate, siteId]);

  const totalPageviews = pageviewData.reduce((sum, item) => sum + item._count.id, 0);
  const bounceRate = "36%";
  const avgVisitTime = "56s";

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

  const topPagesChartData = topPages.map(item => ({ name: item.path, value: item._count.id, percentage: `${((item._count.id / totalPageviews) * 100).toFixed(1)}` }));
  const referrersChartData = referrers.map(item => ({ name: item.referrer, value: item._count.id, percentage: `${((item._count.id / totalPageviews) * 100).toFixed(1)}` }));
  const browsersChartData = browserStats.browsers.map(item => ({ name: item.browser || 'Unknown', value: item._count.id }));
  const osChartData = browserStats.os.map(item => ({ name: item.os || 'Unknown', value: item._count.id }));
  const devicesChartData = browserStats.devices.map(item => ({ name: item.device || 'Unknown', value: item._count.id }));

  const countryMapData = useMemo(() => countries
    .map((item) => {
      const alpha3 = getAlpha3(item.country);
      if (!alpha3) return null;
      return { alpha_3: alpha3, name: item.country, visitors: item._count.id, code: alpha3 };
    })
    .filter((item): item is { alpha_3: string; name: string; visitors: number; code: string } => item !== null), [countries]);

  const countryStatsData = useMemo(() => countries.map(item => ({
    name: item.country,
    value: item._count.id,
    percentage: ((item._count.id / totalPageviews) * 100).toFixed(1),
  })), [countries, totalPageviews]);

  const TABS = [
    { id: 'overview', label: 'Page Views', content: <SimpleLineChart data={lineChartData} title="Page Views" /> },
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
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </header>

      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Views" value={loading ? "..." : totalPageviews.toLocaleString()} change="+12.5%" trend="up" icon={<Eye size={16} />} />
          <StatCard title="Visitors" value={loading ? "..." : uniqueVisitors.uniqueVisitors.toLocaleString()} change="+5.2%" trend="up" icon={<Users size={16} />} />
          <StatCard title="Bounce Rate" value={loading ? "..." : bounceRate} change="-2.1%" trend="down" icon={<AlertTriangle size={16} />} />
          <StatCard title="Avg. Visit Time" value={loading ? "..." : avgVisitTime} change="+3.4s" trend="up" icon={<Clock size={16} />} />
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
          {loading ? <div className="h-80 flex items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div> : <Tabs tabs={TABS} />}
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