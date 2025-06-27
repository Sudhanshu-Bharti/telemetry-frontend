import { useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ChevronDown, Calendar } from "lucide-react";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (startDate: Date, endDate: Date) => void;
}

const DATE_PRESETS = [
  { label: "Last 24 hours", days: 0 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (days: number) => {
    const end = endOfDay(new Date());
    const start =
      days === 0
        ? startOfDay(new Date())
        : startOfDay(subDays(new Date(), days));
    onDateChange(start, end);
    setIsCustom(false);
    setIsOpen(false);
  };

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    const date = new Date(value);
    if (type === "start") {
      onDateChange(startOfDay(date), endDate);
    } else {
      onDateChange(startDate, endOfDay(date));
    }
  };

  const getCurrentLabel = () => {
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 1) return "Last 24 hours";
    if (daysDiff <= 7) return "Last 7 days";
    if (daysDiff <= 30) return "Last 30 days";
    if (daysDiff <= 90) return "Last 90 days";

    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4" />
        {getCurrentLabel()}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="space-y-2">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.days)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  {preset.label}
                </button>
              ))}

              <hr className="my-2" />

              <button
                onClick={() => setIsCustom(!isCustom)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Custom range
              </button>
            </div>

            {isCustom && (
              <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      handleCustomDateChange("start", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      handleCustomDateChange("end", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
