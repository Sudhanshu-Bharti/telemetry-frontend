import React from "react";
import { pie, arc } from "d3";

const data = [
  {
    name: "AAPL",
    value: 30,
    src: "https://etoro-cdn.etorostatic.com/market-avatars/1001/1001_494D5A_F7F7F7.svg",
    color: "fill-pink-400",
  },
  {
    name: "BTC",
    value: 22,
    src: "https://etoro-cdn.etorostatic.com/market-avatars/100000/100000_F0AF32_F7F7F7.svg",
    color: "fill-purple-400",
  },
  {
    name: "GOLD",
    value: 11,
    src: "https://etoro-cdn.etorostatic.com/market-avatars/18/18_E5C265_F7F7F7.svg",
    color: "fill-indigo-400",
  },
  {
    name: "PLTR",
    value: 9,
    src: "https://etoro-cdn.etorostatic.com/market-avatars/100017/100017_6299FE_F7F7F7.svg",
    color: "fill-sky-400",
  },
  {
    name: "ADA",
    value: 7,
    src: "https://etoro-cdn.etorostatic.com/market-avatars/1005/1005_494D5A_F7F7F7.svg",
    color: "fill-lime-400",
  },
  {
    name: "AMZN",
    value: 3,
    src: "https://etoro-cdn.etorostatic.com/market-avatars/100000/100000_F0AF32_F7F7F7.svg",
    color: "fill-amber-400",
  },
];

export function DonutChartActiveThin() {
  // If you want interactivity, you can convert this to a client component state
  const activeSliceIndex = 0;

  // Chart configuration
  const radius = 420;
  const gap = 0.01; // Gap between slices
  const lightStrokeEffect = 8; // 3d light effect around the slice

  // Pie layout and arc generator
  const pieLayout = pie<{ value: number; name: string; src: string; color: string }>()
    .sort(null)
    .value((d) => d.value)
    .padAngle(gap); // Creates a gap between slices

  // Adjust innerRadius to create a donut shape
  const innerRadius = radius / 1.15;

  const labelRadius = radius * 0.7;
  const arcLabel = arc().innerRadius(labelRadius).outerRadius(labelRadius);

  const arcs = pieLayout(data);

  // Calculate the angle for each slice
  const computeAngle = (d: { endAngle: number; startAngle: number }) => {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  };

  const getArcGenerator = (index: number, outerRadius: number) => {
    return arc()
      .innerRadius(innerRadius * 1)
      .outerRadius(outerRadius * 1.1)
      .cornerRadius(lightStrokeEffect + 1.2);
  };

  // Minimum angle to display text
  const minAngle = 20; // Adjust this value as needed

  return (
    <div className="relative">
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="max-w-[16rem] mx-auto overflow-visible"
      >
        {/* Slices */}
        {arcs.map((d, i) => {
          const angle = computeAngle(d);
          let centroid = arcLabel.centroid({
            ...d,
            innerRadius: labelRadius,
            outerRadius: labelRadius,
          });
          return (
            <g key={i}>
              <path
                stroke="currentColor"
                className={`text-white/30 dark:stroke-zinc-800/10 ${d.data.color}`}
                strokeWidth={lightStrokeEffect}
                d={
                  getArcGenerator(
                    i,
                    i === activeSliceIndex ? radius : radius * 0.9
                  )({
                    ...d,
                    innerRadius: innerRadius,
                    outerRadius: i === activeSliceIndex ? radius : radius * 0.9,
                  }) || undefined
                }
                style={{ transition: "d 0.3s ease" }}
              />

              <g opacity={angle > minAngle ? 1 : 0}>
                <text transform={`translate(${centroid})`} textAnchor="middle" fontSize={46}>
                  <tspan
                    y="-0.2em"
                    fontWeight="600"
                    fill="currentColor"
                    className={"text-zinc-400 transition-colors duration-500"}
                  >
                    {d.data.name}
                  </tspan>
                  {angle > minAngle && (
                    <tspan
                      x={0}
                      y="0.8em"
                      fillOpacity={0.7}
                      fill="currentColor"
                      className={"text-zinc-400 transition-colors duration-500"}
                    >
                      {d.data.value.toLocaleString("en-US")}%
                    </tspan>
                  )}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <img
        src={data[activeSliceIndex].src}
        alt={data[activeSliceIndex].name}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-10 rounded-full brightness-0 invert-[20%] dark:brightness-100 dark:invert-0"
      />
    </div>
  );
}
