import { useMemo, useState } from "react";

interface CountryData {
  name: string;
  value: number;
  percentage?: string;
}

interface CountryStatsProps {
  data: CountryData[];
  title?: string;
  hoveredCountry?: CountryData | null;
  selectedCountry?: CountryData | null;
  onCountryHover?: (country: CountryData | null) => void;
  onCountrySelect?: (country: CountryData | null) => void;
}

// Helper to get ISO2 code for circle-flags
const countryNameToIso2: Record<string, string> = {
  "united states": "us",
  usa: "us",
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
function getFlagUrl(countryName: string) {
  const code = countryNameToIso2[countryName.toLowerCase()] || countryName.slice(0, 2).toLowerCase();
  return `https://hatscripts.github.io/circle-flags/flags/${code}.svg`;
}

export function CountryStats({
  data,
}: CountryStatsProps) {
  const sorted = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);
  const maxValue = sorted.length > 0 ? sorted[0].value : 1;
  const total = sorted.reduce((sum, c) => sum + c.value, 0);
  const [showAll, setShowAll] = useState(false);
  const displayCount = 7;
  const showButton = sorted.length > displayCount;
  const visibleCountries = showAll ? sorted : sorted.slice(0, displayCount);

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 font-normal">({sorted.length} countries)</span>
      </div> */}
      <div className="space-y-3">
        {visibleCountries.map((country, i) => (
          <div key={country.name} className="flex items-center gap-3 group">
            <img
              src={getFlagUrl(country.name)}
              alt={country.name + ' flag'}
              className="w-6 h-6 rounded-full border border-gray-200 shadow-sm object-cover group-hover:scale-110 transition-transform duration-200"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E";
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{country.name}</span>
                <span className="text-xs text-gray-500 tabular-nums">{country.percentage}%</span>
                <span className="font-semibold text-gray-900 tabular-nums">{country.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                <div
                  className="h-2 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max((country.value / maxValue) * 100, 3)}%`,
                    background: `linear-gradient(90deg, #3b82f6, #6366f1)`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {showButton && (
          <button
            className="block mx-auto mt-2 px-4 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 text-center mt-6 border-t border-gray-100 pt-4">
        <div>
          <div className="text-lg font-bold text-gray-900">{total.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Visitors</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{sorted.length}</div>
          <div className="text-xs text-gray-500">Total Countries</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{sorted.length > 0 ? Math.round(total / sorted.length) : 0}</div>
          <div className="text-xs text-gray-500">Avg per Country</div>
        </div>
      </div>
    </div>
  );
}
