import { useState, useEffect, useRef } from "react";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
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
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsCustom(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handlePresetClick = (days: number, label: string) => {
    const end = endOfDay(new Date());
    const start =
      days === 0
        ? startOfDay(new Date())
        : startOfDay(subDays(new Date(), days));

    onDateChange(start, end);
    setSelectedPreset(label);
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
    setSelectedPreset(null); // Clear preset when using custom dates
  };

  const getCurrentLabel = () => {
    // If we have a selected preset, use it
    if (selectedPreset) {
      return selectedPreset;
    }

    // Check if current dates match any preset
    const now = new Date();
    const today = startOfDay(now);
    const endOfToday = endOfDay(now);

    // Check for "Last 24 hours" - same day
    if (isSameDay(startDate, today) && isSameDay(endDate, endOfToday)) {
      return "Last 24 hours";
    }

    // Check other presets by calculating expected start dates
    for (const preset of DATE_PRESETS.slice(1)) {
      // Skip "Last 24 hours"
      const expectedStart = startOfDay(subDays(now, preset.days));
      const expectedEnd = endOfDay(now);

      if (
        isSameDay(startDate, expectedStart) &&
        isSameDay(endDate, expectedEnd)
      ) {
        return preset.label;
      }
    }

    // Fall back to custom date range format
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  const getActivePreset = () => {
    if (selectedPreset) {
      return selectedPreset;
    }

    // Check if current dates match any preset
    const now = new Date();
    const today = startOfDay(now);
    const endOfToday = endOfDay(now);

    // Check for "Last 24 hours"
    if (isSameDay(startDate, today) && isSameDay(endDate, endOfToday)) {
      return "Last 24 hours";
    }

    // Check other presets
    for (const preset of DATE_PRESETS.slice(1)) {
      const expectedStart = startOfDay(subDays(now, preset.days));
      const expectedEnd = endOfDay(now);

      if (
        isSameDay(startDate, expectedStart) &&
        isSameDay(endDate, expectedEnd)
      ) {
        return preset.label;
      }
    }

    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{getCurrentLabel()}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-100 rounded-lg shadow-lg z-50 animate-fade-in">
            <div className="p-3">
              <div className="space-y-1">
                {DATE_PRESETS.map((preset) => {
                  const isActive = getActivePreset() === preset.label;
                  return (
                    <button
                      key={preset.label}
                      onClick={() =>
                        handlePresetClick(preset.days, preset.label)
                      }
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}

                <div className="border-t border-gray-100 my-2" />

                <button
                  onClick={() => setIsCustom(!isCustom)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Custom range
                </button>
              </div>

              {isCustom && (
                <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={format(startDate, "yyyy-MM-dd")}
                      onChange={(e) =>
                        handleCustomDateChange("start", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={format(endDate, "yyyy-MM-dd")}
                      onChange={(e) =>
                        handleCustomDateChange("end", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
