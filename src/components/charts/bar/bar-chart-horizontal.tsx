import type { CSSProperties, ReactNode } from "react";
import { scaleBand, scaleLinear, max } from "d3";

export function BarChartHorizontal({
  data: propData,
  BarComponent,
}: {
  data?: { key: string; value: number; fullLabel?: string }[];
  BarComponent?: (props: { d: { key: string; value: number; fullLabel?: string }; index: number; style: React.CSSProperties; className: string }) => ReactNode;
}) {
  const demoData: { key: string; value: number }[] = [
    { key: "Technology", value: 38.1 },
    { key: "Financials", value: 25.3 },
    { key: "Energy", value: 23.1 },
    { key: "Cyclical", value: 19.5 },
    { key: "Defensive", value: 14.7 },
    { key: "Utilities", value: 5.8 },
  ].slice().sort((a, b) => b.value - a.value);
  const data: { key: string; value: number; fullLabel?: string }[] = propData && propData.length > 0 ? propData : demoData;

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
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "0px",
          "--marginBottom": "16px",
          "--marginLeft": `${Number(longestWord) * 7}px`,
        } as CSSProperties
      }
    >
      {/* Chart Area */}
      <div
        className="absolute inset-0 z-10 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"
      >
        {/* Bars with Rounded Right Corners */}
        {data.map((d, index) => {
          const barWidth = xScale(d.value);
          const barHeight = yScale.bandwidth();
          const style = {
            left: "0",
            top: `${yScale(d.key)}%`,
            width: `${barWidth}%`,
            height: `${barHeight}%`,
            borderRadius: "0 6px 6px 0",
          };
          const className = "absolute bg-purple-300 dark:bg-purple-400";
          if (BarComponent) {
            return <BarComponent key={index} d={d} index={index} style={style} className={className} />;
          }
          return (
            <div key={index} style={style} className={className} />
          );
        })}
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
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
      </div>
      {/* Y Axis (Letters) */}
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
