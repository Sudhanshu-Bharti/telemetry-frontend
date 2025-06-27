import { scaleBand, scaleLinear, max } from "d3";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../ui/Tooltip";

export type BarChartDatum = { key: string; value: number; fullLabel?: string };

export function BarChartHorizontalWithTooltip({ data }: { data: BarChartDatum[] }) {
  // Scales
  const yScale = scaleBand<string>()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.175);

  const xScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([0, 100]);

  const longestWord = max(data.map((d) => d.key.length)) || 1;

  return (
    <div
      className="relative w-full h-72"
      style={{
        "--marginTop": "0px",
        "--marginRight": "0px",
        "--marginBottom": "16px",
        "--marginLeft": `${Number(longestWord) * 7}px`,
      } as React.CSSProperties}
    >
      {/* Chart Area */}
      <svg
        className="absolute inset-0 z-10 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {xScale
          .ticks(8)
          .map(xScale.tickFormat(8, "d"))
          .map((active: string, i: number) => (
            <g
              transform={`translate(${xScale(Number(active))},0)`}
              className="text-gray-300/80 dark:text-gray-800/80"
              key={i}
            >
              <line
                y1={0}
                y2={100}
                stroke="currentColor"
                strokeDasharray="6,5"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        {/* Bars with tooltips */}
        {data.map((d, index) => {
          const barWidth = xScale(d.value);
          const barHeight = yScale.bandwidth();
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <rect
                  x={0}
                  y={yScale(d.key)}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  fill="currentColor"
                  className="bg-purple-300 dark:bg-purple-400 cursor-pointer"
                  style={{ color: "#c4b5fd" }} // Tailwind purple-300
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {d.fullLabel || d.key}
                  </span>
                  <span className="text-xs text-gray-500 tabular-nums">{d.value}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </svg>
      {/* X Axis (Values) */}
      {xScale.ticks(4).map((value: number, i: number) => (
        <div
          key={i}
          style={{
            left: `${xScale(value)}%`,
            top: "100%",
          }}
          className="absolute text-xs -translate-x-1/2 tabular-nums text-gray-400"
        >
          {value}
        </div>
      ))}
      {/* Y Axis (Labels) */}
      <div
        className="h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"
      >
        {data.map((entry, i) => (
          <span
            key={i}
            style={{
              left: "-8px",
              top: `${yScale(entry.key)! + yScale.bandwidth() / 2}%`,
            }}
            className="absolute text-xs text-gray-400 -translate-y-1/2 w-full text-right"
          >
            {entry.key}
          </span>
        ))}
      </div>
    </div>
  );
} 