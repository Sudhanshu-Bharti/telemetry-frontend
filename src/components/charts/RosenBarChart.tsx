import { useMemo } from "react";

interface BarChartData {
  name: string;
  value: number;
}

interface RosenBarChartProps {
  data: BarChartData[];
  className?: string;
  height?: number;
  title?: string;
}

export function RosenBarChart({
  data,
  className = "",
  height = 300,
  title,
}: RosenBarChartProps) {
  // Y-axis scaling: handle single-value case
  const { maxValue, minValue, ticks } = useMemo(() => {
    if (!data.length) return { maxValue: 1, minValue: 0, ticks: [0, 1] };
    const values = data.map((d) => d.value);
    let maxValue = Math.max(...values);
    let minValue = Math.min(...values);
    if (maxValue === minValue) {
      // All values are the same, pad for visual space
      minValue = 0;
      maxValue = maxValue === 0 ? 1 : maxValue;
    }
    // Generate 4 ticks (min, 1/3, 2/3, max)
    const ticks = [minValue, minValue + (maxValue - minValue) / 3, minValue + (2 * (maxValue - minValue)) / 3, maxValue].map((v) => Math.round(v));
    return { maxValue, minValue, ticks };
  }, [data]);

  if (!data.length) {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[220px] ${className}`}>
        {title && (
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
            {title}
          </h3>
        )}
        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A3.375 3.375 0 0111.25 5.25V4.5A2.25 2.25 0 009 2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 19.5v-5.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6m-6 3h3" /></svg>
          <span className="text-base font-medium">No data available</span>
        </div>
      </div>
    );
  }

  // Layout logic
  const fewBars = data.length <= 3;
  const barWidth = 48;
  const chartPadding = 24;
  const chartWidth = fewBars ? (data.length * barWidth) + chartPadding * 2 : Math.max(data.length * 56, 320);

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-8 ${className}`} style={{ minWidth: 0 }}>
      {title && (
        <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
          {title}
        </h3>
      )}
      <div className={`w-full ${fewBars ? '' : 'overflow-x-auto'}`} style={{ overflowY: 'hidden' }}>
        <div
          className="relative mx-auto"
          style={{ height: `${height}px`, minWidth: `${chartWidth}px`, maxWidth: '100%' }}
        >
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2 z-10 select-none">
            {ticks.map((tick, i) => (
              <span key={i}>{tick}</span>
            ))}
          </div>
          {/* Grid lines */}
          <div className="absolute left-10 top-0 right-0 h-full z-0">
            {ticks.map((_, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-dashed border-gray-200"
                style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
              />
            ))}
          </div>
          {/* Bars */}
          <div className={`absolute left-10 top-4 right-4 bottom-12 flex items-end ${fewBars ? 'justify-center gap-8' : 'gap-4 justify-start'}`} style={{ minHeight: 0 }}>
            {data.map((item, idx) => {
              const barHeight = maxValue === minValue ? 80 : (item.value - minValue) / (maxValue - minValue) * 100;
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-center group"
                  style={{ width: `${barWidth}px` }}
                >
                  {/* Bar */}
                  <div
                    className="w-full bg-blue-500/80 hover:bg-blue-400 rounded-t-lg transition-all duration-300 cursor-pointer relative group animate-fadeIn"
                    style={{ height: `${barHeight}%`, minHeight: '8px' }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1 bg-white text-gray-900 text-xs rounded border border-gray-200 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-semibold">
                      {item.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div className={`absolute left-10 bottom-0 right-4 flex ${fewBars ? 'justify-center gap-8' : 'gap-4 justify-start'} z-10`}>
            {data.map((item) => (
              <div
                key={item.name}
                className="text-xs text-gray-500 truncate text-center font-medium max-w-[80px] cursor-pointer group relative"
                title={item.name === '/' ? 'Home' : item.name}
              >
                <span className="group-hover:underline">{item.name === '/' ? 'Home' : item.name}</span>
                {/* Tooltip for full path */}
                {item.name.length > 18 && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-6 px-2 py-1 bg-white text-gray-900 text-xs rounded border border-gray-200 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
