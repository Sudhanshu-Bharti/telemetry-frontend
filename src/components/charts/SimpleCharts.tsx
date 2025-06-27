import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { getBrowserIcon, getOSIcon } from "../../assets/icons";

// Export the InteractiveWorldMap component
// export { default as InteractiveWorldMap } from "./InteractiveWorldMap";

interface DataPoint {
  date: Date;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  title: string;
}

export function SimpleLineChart({ data }: SimpleLineChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: format(item.date, "MMM d"),
    formattedValue: (item.value ?? 0).toLocaleString(),
  }));

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-6">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: 400 }}
              className="text-xs"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: 400 }}
              className="text-xs"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                color: "#1e293b",
              }}
              formatter={(value) => [value, "Views"]}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface SimpleBarChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

export function SimpleBarChart({ data, title }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  const getIcon = (name: string, title: string) => {
    const lowerTitle = title.toLowerCase();

    // Browser icons
    if (lowerTitle.includes("browser")) {
      return getBrowserIcon(name);
    }

    // Operating system icons
    if (lowerTitle.includes("operating") || lowerTitle.includes("os")) {
      return getOSIcon(name);
    }

    return null;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.slice(0, 8).map((item, index) => {
          const iconSrc = getIcon(item.name, title);
          return (
            <div key={index} className="group relative">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {iconSrc && (
                      <img
                        src={iconSrc}
                        alt={item.name}
                        className="w-4 h-4 object-contain flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div
                      className="text-sm text-gray-900 truncate font-medium cursor-help"
                      title={`${item.name}: ${item.value.toLocaleString()}`}
                    >
                      {item.name}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 group-hover:bg-blue-600"
                      style={{
                        width: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 min-w-0 tabular-nums">
                  {item.value.toLocaleString()}
                </div>
              </div>
              {/* Tooltip */}
              <div className="absolute left-0 -top-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-300">
                  Count: {item.value.toLocaleString()}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SimpleTableProps {
  data: Array<{ name: string; value: number; percentage?: string }>;
  title: string;
}

export function SimpleTable({ data, title }: SimpleTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {data.slice(0, 10).map((item, index) => (
          <div
            key={index}
            className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
          >
            <span className="text-sm text-gray-900 truncate flex-1 font-medium">
              {item.name}
            </span>
            <div className="flex items-center gap-4 text-right">
              <span className="text-sm font-medium text-gray-900 min-w-0">
                {item.value.toLocaleString()}
              </span>
              {item.percentage && (
                <span className="text-sm text-gray-500 w-12">
                  {item.percentage}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HorizontalBarChartProps {
  data: Array<{ name: string; value: number; percentage?: string }>;
  title: string;
}

export function HorizontalBarChart({ data, title }: HorizontalBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  // Helper function to get the appropriate icon based on title (for header)
  const getHeaderIcon = (title: string) => {
    if (title.toLowerCase().includes("page")) {
      return (
        <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
    if (title.toLowerCase().includes("referrer")) {
      return (
        <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
    if (title.toLowerCase().includes("countr")) {
      return (
        <div className="w-4 h-4 rounded bg-yellow-100 flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-yellow-600"
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
      );
    }
    return (
      <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      </div>
    );
  };

  // Helper function to get browser/OS icons for individual items
  const getItemIcon = (name: string, title: string) => {
    const lowerTitle = title.toLowerCase();

    // Browser icons
    if (lowerTitle.includes("browser")) {
      return getBrowserIcon(name);
    }

    // Operating system icons
    if (lowerTitle.includes("operating") || lowerTitle.includes("os")) {
      return getOSIcon(name);
    }

    return null;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          {getHeaderIcon(title)}
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {data.slice(0, 8).map((item, index) => {
            const itemIconSrc = getItemIcon(item.name, title);
            return (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {itemIconSrc && (
                      <img
                        src={itemIconSrc}
                        alt={item.name}
                        className="w-4 h-4 object-contain flex-shrink-0"
                        onError={(e) => {
                          // Hide the image if it fails to load
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span
                      className="text-sm text-gray-900 font-medium truncate cursor-help"
                      title={
                        title.toLowerCase().includes("page")
                          ? `Page: ${item.name}`
                          : title.toLowerCase().includes("referrer")
                          ? `Referrer: ${item.name}`
                          : item.name
                      }
                    >
                      {item.name.length > 30
                        ? `${item.name.substring(0, 30)}...`
                        : item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {item.value.toLocaleString()}
                    </span>
                    {item.percentage && (
                      <span className="text-xs text-gray-500 w-12 text-right tabular-nums">
                        {item.percentage}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out group-hover:opacity-90"
                      style={{
                        width: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                        background: title.toLowerCase().includes("page")
                          ? "linear-gradient(90deg, #3b82f6, #1d4ed8)"
                          : title.toLowerCase().includes("referrer")
                          ? "linear-gradient(90deg, #10b981, #047857)"
                          : title.toLowerCase().includes("countr")
                          ? "linear-gradient(90deg, #f59e0b, #d97706)"
                          : "linear-gradient(90deg, #6b7280, #4b5563)",
                      }}
                    />
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute left-0 -top-12 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    <div className="font-medium">
                      {title.toLowerCase().includes("page")
                        ? "Page Route:"
                        : title.toLowerCase().includes("referrer")
                        ? "Referrer:"
                        : "Location:"}{" "}
                      {item.name}
                    </div>
                    <div className="text-gray-300">
                      Total Count: {item.value.toLocaleString()}
                      {item.percentage && ` (${item.percentage})`}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// The CountryStats component is now available directly in this file

interface CountryStatsProps {
  data: Array<{ name: string; value: number; percentage?: string }>;
  title: string;
}

export function CountryStats({ data, title }: CountryStatsProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  // Helper function to get country flag SVG from external service
  const getCountryFlag = (countryName: string) => {
    // Map common country names to ISO codes for flags
    const countryMap: { [key: string]: string } = {
      "united states": "us",
      usa: "us",
      america: "us",
      "united kingdom": "gb",
      uk: "gb",
      england: "gb",
      germany: "de",
      france: "fr",
      japan: "jp",
      china: "cn",
      india: "in",
      canada: "ca",
      australia: "au",
      brazil: "br",
      russia: "ru",
      "south korea": "kr",
      italy: "it",
      spain: "es",
      netherlands: "nl",
      sweden: "se",
      norway: "no",
      denmark: "dk",
      finland: "fi",
      switzerland: "ch",
      austria: "at",
      belgium: "be",
      portugal: "pt",
      ireland: "ie",
      poland: "pl",
      "czech republic": "cz",
      ukraine: "ua",
      greece: "gr",
      turkey: "tr",
      israel: "il",
      "south africa": "za",
      egypt: "eg",
      nigeria: "ng",
      kenya: "ke",
      morocco: "ma",
      thailand: "th",
      vietnam: "vn",
      indonesia: "id",
      malaysia: "my",
      singapore: "sg",
      philippines: "ph",
      taiwan: "tw",
      "hong kong": "hk",
      mexico: "mx",
      argentina: "ar",
      chile: "cl",
      colombia: "co",
      peru: "pe",
      venezuela: "ve",
      ecuador: "ec",
      uruguay: "uy",
      paraguay: "py",
      bolivia: "bo",
    };

    const lowerName = countryName.toLowerCase();
    const countryCode = countryMap[lowerName] || lowerName.slice(0, 2);

    return `https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`;
  };

  // Helper function to get country information for enhanced tooltips
  const getCountryInfo = (countryName: string) => {
    const countryInfoMap: {
      [key: string]: { continent: string; region: string };
    } = {
      "united states": { continent: "North America", region: "Americas" },
      "united kingdom": { continent: "Europe", region: "Western Europe" },
      germany: { continent: "Europe", region: "Central Europe" },
      france: { continent: "Europe", region: "Western Europe" },
      japan: { continent: "Asia", region: "East Asia" },
      china: { continent: "Asia", region: "East Asia" },
      india: { continent: "Asia", region: "South Asia" },
      canada: { continent: "North America", region: "Americas" },
      australia: { continent: "Oceania", region: "Oceania" },
      brazil: { continent: "South America", region: "Americas" },
      russia: { continent: "Europe/Asia", region: "Eastern Europe" },
      "south korea": { continent: "Asia", region: "East Asia" },
      // Add more as needed...
    };

    const lowerName = countryName.toLowerCase();
    return (
      countryInfoMap[lowerName] || { continent: "Unknown", region: "Unknown" }
    );
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
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
          {title}
          <span className="text-xs text-gray-500 font-normal">
            ({data.length} countries)
          </span>
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {data.slice(0, 10).map((item, index) => {
            const countryInfo = getCountryInfo(item.name);
            return (
              <div key={index} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <img
                        src={getCountryFlag(item.name)}
                        alt={`${item.name} flag`}
                        className="w-6 h-6 rounded-full object-cover border border-gray-200 shadow-sm group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback to a generic globe icon if flag doesn't load
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E";
                        }}
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm text-gray-900 font-medium truncate group-hover:text-blue-600 transition-colors"
                        title={`${item.name} - ${countryInfo.region}`}
                      >
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {countryInfo.region}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 tabular-nums">
                        {item.value.toLocaleString()}
                      </div>
                      {item.percentage && (
                        <div className="text-xs text-gray-500 tabular-nums">
                          {item.percentage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden group-hover:bg-gray-200 transition-colors">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700 ease-out group-hover:opacity-90"
                      style={{
                        width: `${Math.max((item.value / maxValue) * 100, 3)}%`,
                        background: `linear-gradient(90deg, 
                          ${
                            index % 3 === 0
                              ? "#3b82f6, #1d4ed8"
                              : index % 3 === 1
                              ? "#10b981, #047857"
                              : "#f59e0b, #d97706"
                          })`,
                      }}
                    />
                  </div>
                  {/* Enhanced Tooltip */}
                  <div className="absolute left-0 -top-16 bg-gray-900 text-white text-xs rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                    <div className="space-y-1">
                      <div className="font-semibold text-white">
                        🌍 {item.name}
                      </div>
                      <div className="text-gray-300 text-xs">
                        📍 {countryInfo.region} • {countryInfo.continent}
                      </div>
                      <div className="border-t border-gray-700 pt-1">
                        <div className="text-gray-200">
                          👥 Visitors:{" "}
                          <span className="font-medium text-white">
                            {item.value.toLocaleString()}
                          </span>
                        </div>
                        {item.percentage && (
                          <div className="text-gray-200">
                            📊 Share:{" "}
                            <span className="font-medium text-white">
                              {item.percentage}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Total Countries</div>
              <div className="text-sm font-semibold text-gray-900">
                {data.length}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Total Visitors</div>
              <div className="text-sm font-semibold text-gray-900">
                {data
                  .reduce((sum, item) => sum + item.value, 0)
                  .toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Top Country</div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {data[0]?.name || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto mb-3 opacity-50">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <p className="text-sm">No country data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface StackedBarChartDatum {
  date: Date;
  bounce: number;
  nonBounce: number;
}

interface StackedBarChartProps {
  data: StackedBarChartDatum[];
  title?: string;
}

export function StackedBarChart({ data, title }: StackedBarChartProps) {
  // Detect if all dates are the same day (hourly data)
  const isHourly = data.length > 0 && data.every(d =>
    d.date.getFullYear() === data[0].date.getFullYear() &&
    d.date.getMonth() === data[0].date.getMonth() &&
    d.date.getDate() === data[0].date.getDate()
  );
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: isHourly ? format(item.date, "haaa").replace(':00', '') : format(item.date, "MMM d"),
  }));

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-6">
      {title && <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: 400 }}
              className="text-xs"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: 400 }}
              className="text-xs"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                color: "#1e293b",
              }}
              formatter={(value, name) => [value, name === "bounce" ? "Bounce Sessions" : "Non-Bounce Sessions"]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="bounce" stackId="a" fill="#B89DFB" name="Bounce Sessions" />
            <Bar dataKey="nonBounce" stackId="a" fill="#e7deff" name="Non-Bounce Sessions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
