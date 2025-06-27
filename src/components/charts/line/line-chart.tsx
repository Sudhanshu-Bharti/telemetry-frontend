"use client"

import type React from "react"
import { useState, useMemo, useRef } from "react"
import { scaleTime, scaleLinear, max, extent, line as d3_line } from "d3"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"

import { RotateCcw, TrendingUp, TrendingDown, Activity, Maximize2 } from "lucide-react"

interface DataPoint {
  date: Date
  value: number
}

interface AnalyticsChartProps {
  data?: DataPoint[]
  title?: string
  metric?: string
  showGrowth?: boolean
  className?: string
}

export default function AnalyticsChart({
  data: propData,
  title = "Page Views",
  metric = "Views",
  showGrowth = true,
  className = "",
}: AnalyticsChartProps) {
  // Enhanced demo data with more realistic patterns
  const defaultData = [
    { date: "2024-01-01", value: 1240 },
    { date: "2024-01-02", value: 1180 },
    { date: "2024-01-03", value: 1350 },
    { date: "2024-01-04", value: 1420 },
    { date: "2024-01-05", value: 1680 },
    { date: "2024-01-06", value: 1950 },
    { date: "2024-01-07", value: 1780 },
    { date: "2024-01-08", value: 2120 },
    { date: "2024-01-09", value: 2340 },
    { date: "2024-01-10", value: 2180 },
    { date: "2024-01-11", value: 2420 },
    { date: "2024-01-12", value: 2680 },
    { date: "2024-01-13", value: 2540 },
    { date: "2024-01-14", value: 2890 },
    { date: "2024-01-15", value: 3120 },
    { date: "2024-01-16", value: 2960 },
    { date: "2024-01-17", value: 3240 },
    { date: "2024-01-18", value: 3480 },
    { date: "2024-01-19", value: 3320 },
    { date: "2024-01-20", value: 3680 },
  ].map((d) => ({ ...d, date: new Date(d.date) }))

  const data = propData && propData.length > 0 ? propData : defaultData
  
  const chartRef = useRef<HTMLDivElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)
  const [zoom, setZoom] = useState<{ start: Date; end: Date } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [brushSelection, setBrushSelection] = useState<{ start: number; end: number } | null>(null)

  // Calculate key metrics
  const metrics = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    const avg = Math.round(total / data.length)
    const maxVal = Math.max(...data.map(d => d.value))
    const minVal = Math.min(...data.map(d => d.value))
    
    // Calculate growth rate (last 7 days vs previous 7 days)
    const lastWeek = data.slice(-7)
    const prevWeek = data.slice(-14, -7)
    const lastWeekAvg = lastWeek.reduce((sum, d) => sum + d.value, 0) / lastWeek.length
    const prevWeekAvg = prevWeek.reduce((sum, d) => sum + d.value, 0) / prevWeek.length
    const growth = prevWeekAvg > 0 ? ((lastWeekAvg - prevWeekAvg) / prevWeekAvg) * 100 : 0
    
    return { total, avg, max: maxVal, min: minVal, growth }
  }, [data])

  // Get display data (zoomed or full)
  const displayData = useMemo(() => {
    if (!zoom) return data
    return data.filter(d => d.date >= zoom.start && d.date <= zoom.end)
  }, [data, zoom])

  // Scales
  const margin = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = 800
  const chartHeight = 320
  const innerWidth = chartWidth - margin.left - margin.right
  const innerHeight = chartHeight - margin.top - margin.bottom

  const xScale = useMemo(() => 
    scaleTime()
      .domain(extent(displayData, d => d.date) as [Date, Date])
      .range([0, innerWidth])
  , [displayData, innerWidth])

  const yScale = useMemo(() => 
    scaleLinear()
      .domain([0, (max(displayData, d => d.value) ?? 0) * 1.1])
      .range([innerHeight, 0])
      .nice()
  , [displayData, innerHeight])

  // Line generator
  const line = useMemo(() => 
    d3_line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
  , [xScale, yScale])

  const pathData = line(displayData) || ""

  // Format helpers
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toLocaleString()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  const formatDateLong = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // Generate smart tick values for axes
  const xTicks = useMemo(() => {
    const ticks = xScale.ticks(6)
    return ticks.map(tick => ({
      value: tick,
      label: formatDate(tick),
      x: xScale(tick)
    }))
  }, [xScale])

  const yTicks = useMemo(() => {
    const ticks = yScale.ticks(5)
    return ticks.map(tick => ({
      value: tick,
      label: formatValue(tick),
      y: yScale(tick)
    }))
  }, [yScale])

  // Mouse handlers for chart interaction
  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    if (!chartRef.current) return
    
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - margin.left
    
    if (x < 0 || x > innerWidth) {
      setHoveredPoint(null)
      return
    }
    
    const date = xScale.invert(x)
    const closest = displayData.reduce((prev, curr) => 
      Math.abs(curr.date.getTime() - date.getTime()) < Math.abs(prev.date.getTime() - date.getTime()) 
        ? curr : prev
    )
    
    setHoveredPoint(closest)
  }

  const resetZoom = () => {
    setZoom(null)
    setBrushSelection(null)
  }

  return (
    <Card className={`overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border/40">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg ">
                <Activity className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>
            
            <div className="flex items-baseline gap-4">
              <div className="text-3xl font-bold tracking-tight">
                {formatValue(hoveredPoint?.value ?? metrics.avg)}
              </div>
              {showGrowth && (
                <Badge 
                  variant={metrics.growth >= 0 ? "default" : "destructive"} 
                  className="gap-1.5 font-medium"
                >
                  {metrics.growth >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {metrics.growth >= 0 ? "+" : ""}{metrics.growth.toFixed(1)}%
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {hoveredPoint 
                ? `${formatDateLong(hoveredPoint.date)} • ${formatValue(hoveredPoint.value)} ${metric.toLowerCase()}`
                : `Average ${metric.toLowerCase()} over ${displayData.length} days`
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {zoom && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetZoom}
                className="gap-2 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                Reset View
              </Button>
            )}
            <Button variant="ghost" size="sm" className="p-2">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div 
          ref={chartRef}
          className="relative w-full"
          style={{ height: chartHeight }}
        >
          <svg
            width={chartWidth}
            height={chartHeight}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Grid lines */}
            <g className="text-border/30">
              {yTicks.map((tick, i) => (
                <line
                  key={i}
                  x1={margin.left}
                  y1={margin.top + tick.y}
                  x2={margin.left + innerWidth}
                  y2={margin.top + tick.y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}
            </g>

            {/* Area fill */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {displayData.length > 0 && (
              <path
                d={`${pathData}L${margin.left + xScale(displayData[displayData.length - 1].date)},${margin.top + innerHeight}L${margin.left + xScale(displayData[0].date)},${margin.top + innerHeight}Z`}
                fill="url(#areaGradient)"
              />
            )}

            {/* Main line */}
            <path
              d={pathData}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
              transform={`translate(${margin.left}, ${margin.top})`}
            />

            {/* Hover line */}
            {hoveredPoint && (
              <line
                x1={margin.left + xScale(hoveredPoint.date)}
                y1={margin.top}
                x2={margin.left + xScale(hoveredPoint.date)}
                y2={margin.top + innerHeight}
                stroke="#60a5fa"
                strokeWidth="1"
                strokeDasharray="4,4"
                className="opacity-40"
              />
            )}

            {/* Data points */}
            {displayData.map((d, i) => {
              const isHovered = hoveredPoint?.date.getTime() === d.date.getTime()
              return (
                <circle
                  key={i}
                  cx={margin.left + xScale(d.date)}
                  cy={margin.top + yScale(d.value)}
                  r={isHovered ? 4 : 3}
                  fill="#fff"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  className={`transition-all duration-200 ${isHovered ? 'opacity-100 drop-shadow-md' : 'opacity-0'}`}
                />
              )
            })}

            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
              <text
                key={i}
                x={margin.left - 12}
                y={margin.top + tick.y}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="#6b7280"
              >
                {tick.label}
              </text>
            ))}

            {/* X-axis labels */}
            {xTicks.map((tick, i) => (
              <text
                key={i}
                x={margin.left + tick.x}
                y={margin.top + innerHeight + 20}
                textAnchor="middle"
                fill="#6b7280"
              >
                {tick.label}
              </text>
            ))}

            {/* Hover tooltip */}
            {hoveredPoint && (
              <g>
                <rect
                  x={margin.left + xScale(hoveredPoint.date) - 40}
                  y={margin.top + yScale(hoveredPoint.value) - 35}
                  width="80"
                  height="25"
                  rx="6"
                  fill="#fff"
                  stroke="#6b7280"
                  className="drop-shadow-lg"
                />
                <text
                  x={margin.left + xScale(hoveredPoint.date)}
                  y={margin.top + yScale(hoveredPoint.value) - 18}
                  textAnchor="middle"
                  fill="#111827"
                >
                  {formatValue(hoveredPoint.value)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Mini timeline/brush chart */}
        <div className="mt-6 h-12 w-full bg-muted/30 rounded-lg p-2">
          <svg width="100%" height="100%" className="w-full h-full">
            <path
              d={d3_line<DataPoint>()
                .x(d => (data.indexOf(d) / (data.length - 1)) * 100)
                .y(d => 100 - ((d.value - metrics.min) / (metrics.max - metrics.min)) * 80)(data) || ""}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
              className="opacity-60"
              vectorEffect="non-scaling-stroke"
              transform="translate(0, -10)"
            />
            
            {zoom && (
              <rect
                x={`${(data.findIndex(d => d.date >= zoom.start) / data.length) * 100}%`}
                y="0"
                width={`${((data.findIndex(d => d.date <= zoom.end) - data.findIndex(d => d.date >= zoom.start)) / data.length) * 100}%`}
                height="100%"
                fill="var(--primary)"
                fillOpacity="0.2"
                stroke="var(--primary)"
                strokeWidth="1"
                rx="2"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-6 py-4 bg-muted/20 border-t border-border/40">
        <div className="grid grid-cols-4 gap-6 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Total</div>
            <div className="font-semibold">{formatValue(metrics.total)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Average</div>
            <div className="font-semibold">{formatValue(metrics.avg)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Peak</div>
            <div className="font-semibold">{formatValue(metrics.max)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Data Points</div>
            <div className="font-semibold">{displayData.length}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}