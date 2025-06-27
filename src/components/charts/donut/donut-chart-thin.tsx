import React from "react";
import { pie, arc } from "d3";

const data = [
  { name: "AAPL", value: 30, color: "fill-pink-400" },
  { name: "BTC", value: 22, color: "fill-purple-400" },
  { name: "GOLD", value: 11, color: "fill-indigo-400" },
  { name: "PLTR", value: 9, color: "fill-sky-400" },
  { name: "ADA", value: 7, color: "fill-lime-400" },
  { name: "jaynemesis", value: 3, color: "fill-amber-400" },
];

export function DonutChartThin() {
  // Chart dimensions
  const radius = 420;
  const gap = 0.01; // Gap between slices
  const lightStrokeEffect = 8; // 3d light effect around the slice

  // Pie layout and arc generator
  const pieLayout = pie<{ name: string; value: number; color: string }>()
    .sort(null)
    .value((d) => d.value)
    .padAngle(gap); // Creates a gap between slices

  // Adjust innerRadius to create a donut shape
  const innerRadius = radius / 1.15;
  const arcGenerator = arc()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .cornerRadius(lightStrokeEffect + 1.2); // Apply rounded corners

  // Create an arc generator for the clip path that matches the outer path of the arc
  const arcClip = arc()
    .innerRadius(innerRadius + lightStrokeEffect / 2)
    .outerRadius(radius)
    .cornerRadius(lightStrokeEffect + 2);

  const labelRadius = radius * 0.7;
  const arcLabel = arc().innerRadius(labelRadius).outerRadius(labelRadius);

  const arcs = pieLayout(data);
  // Calculate the angle for each slice
  const computeAngle = (d: { endAngle: number; startAngle: number }) => {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  };

  // Minimum angle to display text
  const minAngle = 20; // Adjust this value as needed

  return (
    <div className={`relative`}>
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="max-w-[16rem] mx-auto overflow-visible"
      >
        {/* Slices */}
        {arcs.map((d, i) => (
          <g key={i}>
            <path
              d={
                arcGenerator({
                  ...d,
                  innerRadius: innerRadius,
                  outerRadius: radius,
                }) || undefined
              }
              stroke="currentColor"
              className={`text-white/30 dark:stroke-green-800/10 ${d.data.color}`}
              strokeWidth={lightStrokeEffect}
            />
          </g>
        ))}

        {/* Labels with conditional rendering */}

        {arcs.map((d, i) => {
          const angle = computeAngle(d);
          let centroid = arcLabel.centroid({
            ...d,
            innerRadius: labelRadius,
            outerRadius: labelRadius,
          });
          if (d.endAngle > Math.PI) {
            centroid[0] += 10;
            centroid[1] += 0;
          } else {
            centroid[0] -= 20;
            centroid[1] -= 0;
          }

          return (
            <g key={i} opacity={angle > minAngle ? 1 : 0}>
              <text transform={`translate(${centroid})`} textAnchor="middle" fontSize={40}>
                <tspan y="-0.4em" fontWeight="600" fill="currentColor" className="text-gray-400">
                  {d.data.name}
                </tspan>
                {angle > minAngle && (
                  <tspan
                    x={0}
                    y="0.7em"
                    fillOpacity={0.7}
                    fill="currentColor"
                    className="text-zinc-400"
                  >
                    {d.data.value.toLocaleString("en-US")}%
                  </tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
