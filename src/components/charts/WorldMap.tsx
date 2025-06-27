import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldJson from 'visionscarto-world-atlas/world/110m.json';

const width = 475;
const height = 335;

type CountryData = {
  alpha_3: string;
  name: string;
  visitors: number;
  code: string;
};

type WorldJsonCountryData = { properties: { name: string; a3: string } };

interface WorldMapProps {
  data: CountryData[];
  hoveredCountry?: string | null;
  onCountryHover?: (alpha3: string | null) => void;
  selectedCountry?: string | null;
  onCountrySelect?: (alpha3: string | null) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({
  data,
  hoveredCountry,
  onCountryHover,
  selectedCountry,
  onCountrySelect,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    country: string;
    visitors: number;
  } | null>(null);

  // Map alpha_3 to data
  const dataByAlpha3 = React.useMemo(() => {
    const map = new Map<string, CountryData>();
    for (const c of data) map.set(c.alpha_3, c);
    return map;
  }, [data]);

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // TopoJSON to GeoJSON
    // @ts-ignore
    const features = topojson.feature(worldJson, worldJson.objects.countries).features as WorldJsonCountryData[];

    // Color scale
    const maxVisitors = d3.max(data, d => d.visitors) || 1;
    const color = d3.scaleLinear<string>().domain([0, maxVisitors]).range(['#f3ebff', '#6366f1']);

    // Projection
    const projection = d3.geoMercator().scale(75).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    svg
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', d => {
        if (d.properties.a3 === hoveredCountry) {
          return 'rgba(99, 102, 241, 0.6)'; // highlight fill
        }
        const c = dataByAlpha3.get(d.properties.a3);
        return c ? color(c.visitors) : '#e5e7eb';
      })
      .attr('stroke', '#888')
      .attr('stroke-width', d =>
        d.properties.a3 === selectedCountry ? 2.5 : d.properties.a3 === hoveredCountry ? 2 : 1
      )
      .attr('class', d =>
        d.properties.a3 === selectedCountry
          ? 'selected-country'
          : d.properties.a3 === hoveredCountry
          ? 'hovered-country'
          : ''
      )
      .style('cursor', d => (dataByAlpha3.has(d.properties.a3) ? 'pointer' : 'default'))
      .on('mousemove', function (event, d) {
        if (onCountryHover) onCountryHover(d.properties.a3);
        // Tooltip position relative to SVG
        const rect = svgRef.current?.getBoundingClientRect();
        const c = dataByAlpha3.get(d.properties.a3);
        setTooltip({
          x: event.clientX - (rect?.left || 0) + 10,
          y: event.clientY - (rect?.top || 0) - 10,
          country: c?.name || d.properties.name,
          visitors: c?.visitors || 0,
        });
      })
      .on('mouseover', function (event, d) {
        if (onCountryHover) onCountryHover(d.properties.a3);
      })
      .on('mouseout', function () {
        if (onCountryHover) onCountryHover(null);
        setTooltip(null);
      })
      .on('click', function (event, d) {
        if (onCountrySelect) onCountrySelect(d.properties.a3);
      });
  }, [data, hoveredCountry, selectedCountry, onCountryHover, onCountrySelect, dataByAlpha3]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full bg-gray-50 rounded-lg border border-gray-200"
        style={{ height, width: '100%' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            background: 'rgba(31, 41, 55, 0.95)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: 8,
            pointerEvents: 'none',
            fontSize: 13,
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 600 }}>{tooltip.country}</div>
          <div style={{ fontSize: 12 }}>{tooltip.visitors.toLocaleString()} visitors</div>
        </div>
      )}
    </div>
  );
};

export default WorldMap; 