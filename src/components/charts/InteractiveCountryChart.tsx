import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  BarChart3,
  Map,
  Trophy,
  Globe,
  SortAsc,
  SortDesc,
} from "lucide-react";

interface CountryDataItem {
  country: string;
  value: number;
  _count?: { id: number };
}

interface InteractiveCountryChartProps {
  data: CountryDataItem[];
  title?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showPercentages?: boolean;
  maxItems?: number;
}

// Country code mapping for flags
const getCountryCode = (countryName: string): string => {
  const countryMap: { [key: string]: string } = {
    // Major countries
    "united states": "us",
    usa: "us",
    america: "us",
    "united kingdom": "gb",
    uk: "gb",
    britain: "gb",
    england: "gb",
    germany: "de",
    france: "fr",
    italy: "it",
    spain: "es",
    canada: "ca",
    australia: "au",
    japan: "jp",
    china: "cn",
    india: "in",
    brazil: "br",
    russia: "ru",
    "south korea": "kr",
    korea: "kr",
    netherlands: "nl",
    belgium: "be",
    switzerland: "ch",
    austria: "at",
    sweden: "se",
    norway: "no",
    denmark: "dk",
    finland: "fi",
    poland: "pl",
    portugal: "pt",
    "czech republic": "cz",
    hungary: "hu",
    romania: "ro",
    greece: "gr",
    turkey: "tr",
    israel: "il",
    "south africa": "za",
    egypt: "eg",
    mexico: "mx",
    argentina: "ar",
    chile: "cl",
    colombia: "co",
    peru: "pe",
    venezuela: "ve",
    thailand: "th",
    singapore: "sg",
    malaysia: "my",
    indonesia: "id",
    philippines: "ph",
    vietnam: "vn",
    "new zealand": "nz",
    ireland: "ie",
    ukraine: "ua",
    estonia: "ee",
    latvia: "lv",
    lithuania: "lt",
    slovenia: "si",
    croatia: "hr",
    serbia: "rs",
    bulgaria: "bg",
    slovakia: "sk",
    iceland: "is",
    luxembourg: "lu",
    malta: "mt",
    cyprus: "cy",
  };

  const lowerName = countryName.toLowerCase().trim();
  return countryMap[lowerName] || lowerName.slice(0, 2);
};

const sortOptions = [
  { value: "value-desc", label: "Visitors (High to Low)", icon: SortDesc },
  { value: "value-asc", label: "Visitors (Low to High)", icon: SortAsc },
  { value: "name-asc", label: "Country Name (A-Z)", icon: SortAsc },
  { value: "name-desc", label: "Country Name (Z-A)", icon: SortDesc },
];

export function InteractiveCountryChart({
  data,
  title = "Top Countries",
  showSearch = true,
  showFilter = true,
  showPercentages = true,
  maxItems = 10,
}: InteractiveCountryChartProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("value-desc");
  const [viewMode, setViewMode] = useState<"bars" | "list">("bars");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Process data
  const processedData = useMemo(() => {
    return data.map((item) => ({
      country: item.country || "Unknown",
      value: item._count?.id || item.value,
      code: getCountryCode(item.country || "Unknown"),
    }));
  }, [data]);

  const totalVisitors = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.value, 0);
  }, [processedData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData.filter((item) =>
      item.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort data
    switch (sortBy) {
      case "value-desc":
        filtered.sort((a, b) => b.value - a.value);
        break;
      case "value-asc":
        filtered.sort((a, b) => a.value - b.value);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.country.localeCompare(b.country));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.country.localeCompare(a.country));
        break;
    }

    return filtered.slice(0, maxItems);
  }, [processedData, searchTerm, sortBy, maxItems]);

  const maxValue = Math.max(...filteredAndSortedData.map((d) => d.value));

  const getPercentage = (value: number) => {
    return ((value / totalVisitors) * 100).toFixed(1);
  };

  const getFlagUrl = (countryCode: string) => {
    return `https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 flex items-center justify-center">
              <Globe className="w-2.5 h-2.5 text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {filteredAndSortedData.length} countries
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("bars")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "bars"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Bar View"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="List View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls */}
        {(showSearch || showFilter) && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Sort Filter */}
            {showFilter && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredAndSortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm">No countries found matching your search</p>
          </div>
        ) : viewMode === "bars" ? (
          /* Bar Chart View */
          <div className="space-y-4">
            {filteredAndSortedData.map((item, index) => (
              <div
                key={item.country}
                className="group relative"
                onMouseEnter={() => setHoveredItem(item.country)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-400">
                      {index === 0 && (
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      )}
                      {index === 1 && (
                        <Trophy className="w-4 h-4 text-gray-400" />
                      )}
                      {index === 2 && (
                        <Trophy className="w-4 h-4 text-amber-600" />
                      )}
                      {index > 2 && <span>#{index + 1}</span>}
                    </div>

                    {/* Flag */}
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                      <img
                        src={getFlagUrl(item.code)}
                        alt={`${item.country} flag`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMS43NVY3TDEyLjI1IDciIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K";
                        }}
                      />
                    </div>

                    {/* Country Name */}
                    <span
                      className="text-sm text-gray-900 font-medium truncate cursor-help"
                      title={`${
                        item.country
                      }: ${item.value.toLocaleString()} visitors`}
                    >
                      {item.country}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {item.value.toLocaleString()}
                    </span>
                    {showPercentages && (
                      <span className="text-xs text-gray-500 w-12 text-right tabular-nums">
                        {getPercentage(item.value)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out group-hover:opacity-90"
                      style={{
                        width: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                        background:
                          index === 0
                            ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                            : index === 1
                            ? "linear-gradient(90deg, #9ca3af, #6b7280)"
                            : index === 2
                            ? "linear-gradient(90deg, #d97706, #b45309)"
                            : "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                      }}
                    />
                  </div>

                  {/* Detailed Tooltip */}
                  {hoveredItem === item.country && (
                    <div className="absolute left-0 -top-16 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-10 whitespace-nowrap animate-fade-in">
                      <div className="font-medium">🌍 {item.country}</div>
                      <div className="text-gray-300">
                        Visitors: {item.value.toLocaleString()} (
                        {getPercentage(item.value)}%)
                      </div>
                      <div className="text-gray-300">
                        Rank: #{index + 1} of {filteredAndSortedData.length}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-1">
            {filteredAndSortedData.map((item, index) => (
              <div
                key={item.country}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                onMouseEnter={() => setHoveredItem(item.country)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-100 text-gray-700"
                        : index === 2
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {index < 3 ? <Trophy className="w-3 h-3" /> : index + 1}
                  </div>

                  {/* Flag */}
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                    <img
                      src={getFlagUrl(item.code)}
                      alt={`${item.country} flag`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMS43NVY3TDEyLjI1IDciIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K";
                      }}
                    />
                  </div>

                  <span className="text-sm font-medium text-gray-900">
                    {item.country}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {showPercentages && (
                    <span className="text-xs text-gray-500 tabular-nums">
                      {getPercentage(item.value)}%
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {totalVisitors.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Visitors</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {processedData.length}
              </div>
              <div className="text-xs text-gray-500">Total Countries</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {filteredAndSortedData.length > 0
                  ? Math.round(
                      totalVisitors / filteredAndSortedData.length
                    ).toLocaleString()
                  : "0"}
              </div>
              <div className="text-xs text-gray-500">Avg per Country</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
