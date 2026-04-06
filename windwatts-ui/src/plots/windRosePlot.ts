import type { Config, Data, Layout } from "plotly.js";
import type { WindRoseResponse } from "../types";
import { getWindRoseDirectionLabel, toPercent } from "../utils/windRose";
import {
  WIND_ROSE_DIRECTIONS_16,
  WIND_ROSE_DIRECTIONS_8,
  WIND_ROSE_DIRECTIONS_4,
} from "../constants/windRose";

const TRACE_COLORS = ["#D8E6FF", "#9FC2FF", "#5F96F4", "#2E6BD9", "#123E91"];

export function buildWindRosePlotData(windRoseData: WindRoseResponse): Data[] {
  const sectorInfo = [...windRoseData.sector_info].sort(
    (a, b) => a.sector_index - b.sector_index
  );
  const binInfo = [...windRoseData.bin_info].sort(
    (a, b) => a.bin_index - b.bin_index
  );

  const theta = sectorInfo.map((sector) =>
    getWindRoseDirectionLabel(
      sector.center_bearing_deg,
      windRoseData.no_of_sectors
    )
  );

  const frequencyMap = new Map<string, number>();
  for (const item of windRoseData.bin_data) {
    frequencyMap.set(`${item.sector_index}-${item.bin_index}`, item.frequency);
  }

  return binInfo.map((bin, index) => ({
    type: "barpolar",
    name: `${bin.bin_min}-${bin.bin_max} m/s`,
    theta,
    r: sectorInfo.map((sector) =>
      toPercent(
        frequencyMap.get(`${sector.sector_index}-${bin.bin_index}`) ?? 0,
        1
      )
    ),
    marker: {
      color: TRACE_COLORS[index % TRACE_COLORS.length],
      line: {
        color: "#FFFFFF",
        width: 1,
      },
    },
    hovertemplate:
      "%{theta}<br>Speed bin: %{fullData.name}<br>Frequency: %{r:.1f}%<extra></extra>",
  }));
}

export function getWindRoseRadialAxisMax(
  windRoseData: WindRoseResponse
): number {
  const totalsBySector = new Map<number, number>();
  for (const item of windRoseData.bin_data) {
    const current = totalsBySector.get(item.sector_index) ?? 0;
    totalsBySector.set(
      item.sector_index,
      current + toPercent(item.frequency, 1)
    );
  }

  const sectorTotals = [...totalsBySector.values()];
  const maxValue = Math.max(...sectorTotals, 0);
  return Math.max(10, Math.ceil(maxValue / 5) * 5);
}

export function getWindRoseLayout(
  radialAxisMax: number,
  noOfSectors: number = 16
): Partial<Layout> {
  const categoryarray =
    noOfSectors === 16
      ? WIND_ROSE_DIRECTIONS_16
      : noOfSectors === 8
        ? WIND_ROSE_DIRECTIONS_8
        : WIND_ROSE_DIRECTIONS_4;

  return {
    autosize: true,
    barmode: "stack",
    dragmode: false,
    margin: { t: 20, r: 16, b: 16, l: 16 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    showlegend: true,
    legend: {
      orientation: "h",
      y: -0.14,
      x: 0.5,
      xanchor: "center",
      yanchor: "top",
      font: { size: 12 },
    },
    polar: {
      bgcolor: "rgba(0,0,0,0)",
      angularaxis: {
        direction: "clockwise",
        rotation: 90,
        tickfont: { size: 12 },
        categoryarray: [...categoryarray],
      },
      radialaxis: {
        angle: 90,
        ticksuffix: "%",
        gridcolor: "rgba(24, 62, 145, 0.16)",
        linecolor: "rgba(24, 62, 145, 0.20)",
        range: [0, radialAxisMax],
      },
    },
  };
}

export function getWindRoseConfig(): Partial<Config> {
  return {
    displayModeBar: false,
    responsive: true,
  };
}
