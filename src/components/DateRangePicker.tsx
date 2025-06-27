import { useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (startDate: Date, endDate: Date) => void;
}

const DATE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
}: DateRangePickerProps) {
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (days: number) => {
    const end = endOfDay(new Date());
    const start =
      days === 0
        ? startOfDay(new Date())
        : startOfDay(subDays(new Date(), days));
    onDateChange(start, end);
    setIsCustom(false);
  };

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    const date = new Date(value);
    if (type === "start") {
      onDateChange(startOfDay(date), endDate);
    } else {
      onDateChange(startDate, endOfDay(date));
    }
  };

  // Check which preset is currently active
  const getActivePreset = () => {
    const now = new Date();
    for (const preset of DATE_PRESETS) {
      const presetEnd = endOfDay(now);
      const presetStart =
        preset.days === 0
          ? startOfDay(now)
          : startOfDay(subDays(now, preset.days));

      if (
        Math.abs(startDate.getTime() - presetStart.getTime()) < 1000 &&
        Math.abs(endDate.getTime() - presetEnd.getTime()) < 1000
      ) {
        return preset.label;
      }
    }
    return null;
  };

  const activePreset = getActivePreset();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-300">Time range:</span>
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset.days)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activePreset === preset.label && !isCustom
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setIsCustom(!isCustom)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            isCustom || !activePreset
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
          }`}
        >
          Custom Range
        </button>
      </div>

      {isCustom && (
        <div className="flex gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
              Start Date
            </label>
            <input
              type="date"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => handleCustomDateChange("start", e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
              End Date
            </label>
            <input
              type="date"
              value={format(endDate, "yyyy-MM-dd")}
              onChange={(e) => handleCustomDateChange("end", e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {format(startDate, "MMM d, yyyy")} → {format(endDate, "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
}
