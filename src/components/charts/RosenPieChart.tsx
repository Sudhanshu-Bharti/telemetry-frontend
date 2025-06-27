import { useMemo } from "react";
import { pie, arc } from "d3";

interface PieChartData {
  name: string;
  value: number;
}

interface RosenPieChartProps {
  data: PieChartData[];
  className?: string;
  size?: number;
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export function RosenPieChart({
  data,
  className = "",
  size = 300,
  title,
  colors = DEFAULT_COLORS,
}: RosenPieChartProps) {
  const { pieData, total } = useMemo(() => {
    if (!data.length) return { pieData: [], total: 0 };
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const pieGenerator = pie<PieChartData>()
      .value((d) => d.value)
      .sort(null);
    const pieData = pieGenerator(data);
    return { pieData, total };
  }, [data]);
  const arcGenerator = useMemo(() => {
    const radius = size / 2 - 20;
    return arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);
  }, [size]);
  if (!data.length) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[180px] ${className}`}>
        <span className="text-gray-400 text-sm">No data available</span>
      </div>
    );
  }
  return (
    <div className={`flex flex-col lg:flex-row items-center gap-8 w-full bg-white border border-gray-200 rounded-2xl p-8 ${className}`}>
      {/* Pie Chart */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            {pieData.map((slice, index) => {
              const pathData = arcGenerator(slice as any);
              if (!pathData) return null;
              return (
                <g key={slice.data.name}>
                  <path
                    d={pathData}
                    fill={colors[index % colors.length]}
                    className="hover:opacity-90 transition-all duration-200 cursor-pointer"
                  >
                    <title>{`${slice.data.name}: ${slice.data.value} (${((slice.data.value / total) * 100).toFixed(1)}%)`}</title>
                  </path>
                </g>
              );
            })}
          </g>
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 font-medium">Total</div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex-1 space-y-2 min-w-[120px]">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs text-gray-500 truncate font-medium max-w-[80px]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-900">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
