import { useState, useRef, useEffect } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePresetClick = (days: number) => {
    const end = endOfDay(new Date());
    const start =
      days === 0
        ? startOfDay(new Date())
        : startOfDay(subDays(new Date(), days));

    const actualDiffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Debug logging
    console.log("handlePresetClick debug:", {
      clickedDays: days,
      calculatedStart: format(start, "yyyy-MM-dd HH:mm:ss"),
      calculatedEnd: format(end, "yyyy-MM-dd HH:mm:ss"),
      actualDiffDays,
    });


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
    // Calculate the actual difference in days
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Check if end date is approximately today
    const today = new Date();
    const isEndToday =
      Math.abs(endDate.getTime() - endOfDay(today).getTime()) <
      24 * 60 * 60 * 1000;

    // Debug logging (you can remove this later)
    console.log("getCurrentLabel debug:", {
      diffDays,
      isEndToday,
      startDate: format(startDate, "yyyy-MM-dd HH:mm:ss"),
      endDate: format(endDate, "yyyy-MM-dd HH:mm:ss"),
    });

    if (isEndToday) {
      if (diffDays === 1) {
        console.log("Returning: Last 24 hours");
        return "Last 24 hours";
      }
      if (diffDays === 7) {
        console.log("Returning: Last 7 days");
        return "Last 7 days";
      }
      if (diffDays === 30) {
        console.log("Returning: Last 30 days");
        return "Last 30 days";
      }
      if (diffDays === 90) {
        console.log("Returning: Last 90 days");
        return "Last 90 days";
      }
    }

    // If no preset matches, show custom range
    const customLabel = `${format(startDate, "MMM d")} - ${format(
      endDate,
      "MMM d, yyyy"
    )}`;
    console.log("Returning custom:", customLabel);
    return customLabel;
  };

  const isPresetActive = (days: number) => {
    // Calculate the actual difference in days
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Check if end date is approximately today
    const today = new Date();
    const isEndToday =
      Math.abs(endDate.getTime() - endOfDay(today).getTime()) <
      24 * 60 * 60 * 1000;

    if (!isEndToday) return false;

    if (days === 0) return diffDays <= 1;
    if (days === 7) return diffDays === 7 || diffDays === 8;
    if (days === 30) return diffDays === 30 || diffDays === 31;
    if (days === 90) return diffDays === 90 || diffDays === 91;

    return false;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
      >
        <Calendar className="w-4 h-4" />
        {getCurrentLabel()}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3">
            <div className="space-y-1">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.days)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    isPresetActive(preset.days)
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              <hr className="my-3 border-gray-100" />

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
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      handleCustomDateChange("start", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
