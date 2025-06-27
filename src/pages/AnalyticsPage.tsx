import { useState, useEffect } from "react";
import {
  subDays,
  startOfDay,
  endOfDay,
  parseISO,
  format,
  isSameDay,
} from "date-fns";
import { config } from "../config/config";
import {
  analyticsService,
  type PageviewData,
  type TopPageData,
  type ReferrerData,
  type BrowserStatsData,
  type CountryData,
  type UniqueVisitorsData,
} from "../services/analytics";
import { DateRangePicker } from "../components/DateRangePickerModern";
import { StatCard, ErrorMessage, LoadingSpinner } from "../components/ui/Card";
import {
  SimpleLineChart,
  SimpleBarChart,
  HorizontalBarChart,
} from "../components/charts/SimpleCharts";
import WorldMap from "../components/charts/WorldMap";
import { CountryStats } from "../components/charts/CountryStats";
import { Layout } from "../components/ui/Layout";
import { getAlpha3 } from "../lib/alpha2toalpha3";

export function AnalyticsPage() {
  // State for date range
  const [startDate, setStartDate] = useState(() =>
    startOfDay(subDays(new Date(), 7))
  );
  const [endDate, setEndDate] = useState(() => endOfDay(new Date()));

  // State for site ID (you can make this configurable)
  const [siteId] = useState(config.defaultSiteId);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [pageviewData, setPageviewData] = useState<PageviewData[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState<UniqueVisitorsData>({
    uniqueVisitors: 0,
  });
  const [topPages, setTopPages] = useState<TopPageData[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [browserStats, setBrowserStats] = useState<BrowserStatsData>({
    browsers: [],
    devices: [],
    os: [],
  });
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pageviews, visitors, pages, refs, browsers, countryData] =
        await Promise.all([
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
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate, siteId]);

  // Debug: Log fetched countries and warn for missing alpha_3
  useEffect(() => {
    if (!loading) {
      console.log("Fetched countries from backend:", countries);
    }
  }, [loading, countries]);

  // Calculate total pageviews
  const totalPageviews = pageviewData.reduce(
    (sum, item) => sum + item._count.id,
    0
  );

  // Calculate bounce rate (mock calculation)
  const bounceRate = "36%";

  // Calculate average visit time (mock calculation)
  const avgVisitTime = "56s";

  // Group pageviewData by hour if single day, else by day
  let lineChartData: { date: Date; value: number }[] = [];
  if (isSameDay(startDate, endDate)) {
    // Group by hour
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
      if (!groupedByHour[hour]) {
        groupedByHour[hour] = { date: parseISO(item.createdAt), value: 0 };
      }
      groupedByHour[hour].value += item._count.id;
    });
    lineChartData = Object.values(groupedByHour).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  } else {
    // Group by day
    const groupedPageviews: Record<string, { date: Date; value: number }> = {};
    pageviewData.forEach((item) => {
      const day = format(parseISO(item.createdAt), "yyyy-MM-dd");
      if (!groupedPageviews[day]) {
        groupedPageviews[day] = { date: parseISO(item.createdAt), value: 0 };
      }
      groupedPageviews[day].value += item._count.id;
    });
    lineChartData = Object.values(groupedPageviews).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }

  // Calculate percentage for data
  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? `${Math.round((value / total) * 100)}%` : "0%";
  };

  // Prepare chart data
  const topPagesChartData = topPages.map((item) => ({
    name:
      item.path.length > 30 ? `${item.path.substring(0, 30)}...` : item.path,
    value: item._count.id,
    percentage: calculatePercentage(item._count.id, totalPageviews),
  }));

  const referrersChartData = referrers.map((item) => ({
    name:
      item.referrer.length > 30
        ? `${item.referrer.substring(0, 30)}...`
        : item.referrer,
    value: item._count.id,
    percentage: calculatePercentage(item._count.id, totalPageviews),
  }));

  const browsersChartData = browserStats.browsers.map((item) => ({
    name: item.browser || "Unknown",
    value: item._count.id,
  }));

  const osChartData = browserStats.os.map((item) => ({
    name: item.os || "Unknown",
    value: item._count.id,
  }));


  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <ErrorMessage message={error} />
          <button
            onClick={fetchAnalyticsData}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header with site info and date picker */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h1 className="text-xl font-bold text-gray-900">umami.is</h1>
            <div className="text-sm text-gray-500">3 current visitors</div>
          </div>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Views"
            value={loading ? "..." : totalPageviews.toLocaleString()}
            change="+421"
            trend="up"
          />
          <StatCard
            title="Visitors"
            value={
              loading ? "..." : uniqueVisitors.uniqueVisitors.toLocaleString()
            }
            change="+32"
            trend="up"
          />
          <StatCard
            title="Bounce rate"
            value={loading ? "..." : bounceRate}
            change="+11%"
            trend="up"
          />
          <StatCard
            title="Average visit time"
            value={loading ? "..." : avgVisitTime}
            change="+34s"
            trend="up"
          />
        </div>

        {/* Main Chart */}
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-lg p-8 mb-8">
            <div className="h-80 flex items-center justify-center">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <SimpleLineChart data={lineChartData} title="Page Views" />
          </div>
        )}

        {/* Pages and Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {loading ? (
            <>
              <div className="bg-white border border-gray-100 rounded-lg p-8">
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner className="h-6 w-6" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-8">
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner className="h-6 w-6" />
                </div>
              </div>
            </>
          ) : (
            <>
              <HorizontalBarChart
                data={topPagesChartData.map((item) => ({
                  name: item.name,
                  value: item.value,
                  percentage: `${((item.value / totalPageviews) * 100).toFixed(
                    1
                  )}%`,
                }))}
                title="Pages"
              />
              <HorizontalBarChart
                data={referrersChartData.map((item) => ({
                  name: item.name,
                  value: item.value,
                  percentage: `${((item.value / totalPageviews) * 100).toFixed(
                    1
                  )}%`,
                }))}
                title="Referrers"
              />
            </>
          )}
        </div>

        {/* Browser, OS, Device Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {loading ? (
            <>
              <div className="bg-white border border-gray-100 rounded-lg p-8">
                <div className="h-48 flex items-center justify-center">
                  <LoadingSpinner className="h-6 w-6" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-8">
                <div className="h-48 flex items-center justify-center">
                  <LoadingSpinner className="h-6 w-6" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-8">
                <div className="h-48 flex items-center justify-center">
                  <LoadingSpinner className="h-6 w-6" />
                </div>
              </div>
            </>
          ) : (
            <>
              <SimpleBarChart data={browsersChartData} title="Browsers" />
              <SimpleBarChart data={osChartData} title="Operating systems" />
              <SimpleBarChart
                data={browserStats.devices.map((item) => ({
                  name: item.device || "Unknown",
                  value: item._count.id,
                }))}
                title="Devices"
              />
            </>
          )}
        </div>

        {/* Countries */}
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Countries
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 h-96 flex items-center justify-center">
                  <LoadingSpinner className="h-8 w-8" />
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-100 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <WorldMap
                  data={countries
                    .map((item) => {
                      const alpha3 = getAlpha3(item.country);
                      if (!alpha3) {
                        console.warn("No alpha_3 mapping for country:", item.country);
                        return null;
                      }
                      return {
                        alpha_3: alpha3,
                        name: item.country,
                        visitors: item._count.id,
                        code: alpha3,
                      };
                    })
                    .filter((item): item is { alpha_3: string; name: string; visitors: number; code: string } => item !== null)
                  }
                  hoveredCountry={hoveredCountry}
                  onCountryHover={(alpha3) => setHoveredCountry(alpha3)}
                  selectedCountry={selectedCountry}
                  onCountrySelect={(alpha3) => setSelectedCountry(alpha3)}
                />
              </div>
              <div>
                <CountryStats
                  data={countries.map((item) => ({
                    name: item.country,
                    value: item._count.id,
                    percentage: ((item._count.id / totalPageviews) * 100).toFixed(1),
                  }))}
                  hoveredCountry={
                    hoveredCountry
                      ? { name: countries.find(c => getAlpha3(c.country) === hoveredCountry)?.country || '', value: 0 }
                      : null
                  }
                  selectedCountry={
                    selectedCountry
                      ? { name: countries.find(c => getAlpha3(c.country) === selectedCountry)?.country || '', value: 0 }
                      : null
                  }
                  onCountryHover={country => setHoveredCountry(country ? getAlpha3(country.name) : null)}
                  onCountrySelect={country => setSelectedCountry(country ? getAlpha3(country.name) : null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
