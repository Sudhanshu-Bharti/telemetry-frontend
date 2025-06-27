import { useMemo } from "react";
import { line, scaleLinear, scaleTime } from "d3";

interface LineChartData {
  date: Date;
  value: number;
}

interface RosenLineChartProps {
  data: LineChartData[];
  className?: string;
  height?: number;
  title?: string;
  color?: string;
}

export function RosenLineChart({
  data,
  className = "",
  height = 300,
  title,
  color = "#3b82f6",
}: RosenLineChartProps) {
  const { pathData, maxValue, minValue, xScale, yScale } = useMemo(() => {
    if (!data.length)
      return {
        pathData: "",
        maxValue: 0,
        minValue: 0,
        xScale: null,
        yScale: null,
      };
    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const dates = data.map((d) => d.date);
    const width = 400;
    const chartHeight = 200;
    const xScale = scaleTime()
      .domain([
        new Date(Math.min(...dates.map((d) => d.getTime()))),
        new Date(Math.max(...dates.map((d) => d.getTime()))),
      ])
      .range([0, width]);
    const yScale = scaleLinear()
      .domain([minValue, maxValue])
      .range([chartHeight, 0]);
    const lineGenerator = line<LineChartData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));
    const pathData = lineGenerator(data) || "";
    return { pathData, maxValue, minValue, xScale, yScale };
  }, [data]);

  if (!data.length) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[180px] ${className}`}>
        <span className="text-gray-400 text-sm">No data available</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full bg-white border border-gray-200 rounded-2xl p-8 ${className}`} style={{ height: `${height}px` }}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2 z-10 select-none">
        <span>{Math.round(maxValue)}</span>
        <span>{Math.round(maxValue * 0.75)}</span>
        <span>{Math.round(maxValue * 0.5)}</span>
        <span>{Math.round(maxValue * 0.25)}</span>
        <span>{Math.round(minValue)}</span>
      </div>
      {/* Grid lines */}
      <div className="absolute left-10 top-0 right-0 h-full z-0">
        {[0, 25, 50, 75, 100].map((y) => (
          <div
            key={y}
            className="absolute w-full border-t border-dashed border-gray-200"
            style={{ top: `${y}%` }}
          />
        ))}
      </div>
      {/* Chart area */}
      <div className="absolute left-10 top-2 right-2 bottom-8">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {/* Area path */}
          <path
            d={`${pathData} L 400,200 L 0,200 Z`}
            fill="url(#areaGradient)"
            className="transition-all duration-500"
          />
          {/* Line path */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />
          {/* Data points */}
          {data.map((point, index) => {
            if (!xScale || !yScale) return null;
            return (
              <g key={index}>
                <circle
                  cx={xScale(point.date)}
                  cy={yScale(point.value)}
                  r="4"
                  fill="#fff"
                  className="transition-all duration-200"
                />
                <circle
                  cx={xScale(point.date)}
                  cy={yScale(point.value)}
                  r="3"
                  fill={color}
                  className="hover:r-5 hover:fill-blue-400 transition-all duration-200 cursor-pointer"
                >
                  <title>{`${point.date.toLocaleDateString()}: ${point.value}`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
      {/* X-axis labels */}
      <div className="absolute left-10 bottom-0 right-2 flex justify-between text-xs text-gray-500 z-10 select-none">
        {data.length > 0 && (
          <>
            <span>{data[0].date.toLocaleDateString()}</span>
            {data.length > 2 && (
              <span>{data[Math.floor(data.length / 2)].date.toLocaleDateString()}</span>
            )}
            <span>{data[data.length - 1].date.toLocaleDateString()}</span>
          </>
        )}
      </div>
    </div>
  );
}
