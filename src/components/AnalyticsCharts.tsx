
import {
  type TopPageData,
  type ReferrerData,
  type BrowserStatsData,
  type CountryData,
} from "../services/analytics";
import { RosenBarChart } from "./charts/RosenBarChart";
import { RosenPieChart } from "./charts/RosenPieChart";

interface TopPagesChartProps {
  data: TopPageData[];
  loading?: boolean;
}

export function TopPagesChart({ data, loading }: TopPagesChartProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] w-full bg-gray-900 rounded-xl border border-gray-800">
        <span className="text-gray-400 text-sm">Loading...</span>
        </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.path.length > 25 ? `${item.path.substring(0, 25)}...` : item.path,
    value: item._count.id,
  }));

  return (
    <RosenBarChart
      data={chartData}
      title="Top Pages"
      height={220}
      className="w-full"
    />
  );
}

interface ReferrersChartProps {
  data: ReferrerData[];
  loading?: boolean;
}

export function ReferrersChart({ data, loading }: ReferrersChartProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] w-full bg-gray-900 rounded-xl border border-gray-800">
        <span className="text-gray-400 text-sm">Loading...</span>
        </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.referrer.length > 20 ? `${item.referrer.substring(0, 20)}...` : item.referrer,
    value: item._count.id,
  }));

  return (
    <RosenBarChart
      data={chartData}
      title="Top Referrers"
      height={220}
      className="w-full"
    />
  );
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

interface BrowserStatsChartProps {
  data: BrowserStatsData;
  loading?: boolean;
}

export function BrowserStatsChart({ data, loading }: BrowserStatsChartProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Browsers", "Devices", "Operating Systems"].map((title) => (
          <div key={title} className="flex flex-col items-center justify-center min-h-[180px] w-full bg-gray-900 rounded-xl border border-gray-800">
            <span className="text-gray-400 text-sm">Loading...</span>
            </div>
        ))}
      </div>
    );
  }

  const browserData = data.browsers.map((item) => ({
    name: item.browser || "Unknown",
    value: item._count.id,
  }));

  const deviceData = data.devices.map((item) => ({
    name: item.device || "Unknown",
    value: item._count.id,
  }));

  const osData = data.os.map((item) => ({
    name: item.os || "Unknown",
    value: item._count.id,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <RosenPieChart
        data={browserData}
        title="Browsers"
        size={180}
        colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}
        className="w-full"
      />
      <RosenPieChart
        data={deviceData}
        title="Devices"
        size={180}
        colors={["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]}
        className="w-full"
      />
      <RosenPieChart
        data={osData}
        title="Operating Systems"
        size={180}
        colors={["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"]}
        className="w-full"
      />
    </div>
  );
}

interface CountriesChartProps {
  data: CountryData[];
  loading?: boolean;
}

export function CountriesChart({ data, loading }: CountriesChartProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] w-full bg-gray-900 rounded-xl border border-gray-800">
        <span className="text-gray-400 text-sm">Loading...</span>
        </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.country || "Unknown",
    value: item._count.id,
  }));

  return (
    <RosenBarChart
      data={chartData}
      title="Top Countries"
      height={220}
      className="w-full"
    />
  );
}
