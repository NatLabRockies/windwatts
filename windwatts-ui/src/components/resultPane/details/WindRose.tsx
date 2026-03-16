import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import Plot from "react-plotly.js";
import type { Config, Data, Layout } from "plotly.js";
import { useWindRoseData } from "../../../hooks";
import { getOutOfBoundsMessage } from "../../../utils";
import { OutOfBoundsWarning } from "../../shared";

interface WindRoseProps {
  defaultExpanded?: boolean;
}

const TRACE_COLORS = ["#D8E6FF", "#9FC2FF", "#5F96F4", "#2E6BD9", "#123E91"];

export const WindRose = ({ defaultExpanded = true }: WindRoseProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const {
    windRoseData,
    isLoading,
    error,
    hasData,
    outOfBounds,
    dataModel,
    lat,
    lng,
  } = useWindRoseData();

  const plotData = useMemo<Data[]>(() => {
    if (!windRoseData) {
      return [];
    }

    return windRoseData.speedBins.map((bin, index) => ({
      type: "barpolar",
      name: `${bin.label} ${windRoseData.unit}`,
      theta: windRoseData.sectors.map((sector) => sector.direction),
      r: windRoseData.sectors.map((sector) => sector.frequencies[index] ?? 0),
      width: windRoseData.sectors.map(() => 45),
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
  }, [windRoseData]);

  const radialAxisMax = useMemo(() => {
    if (!windRoseData) {
      return 10;
    }

    const sectorTotals = windRoseData.sectors.map((sector) =>
      sector.frequencies.reduce((total, value) => total + value, 0)
    );
    const maxValue = Math.max(...sectorTotals, 0);
    return Math.max(10, Math.ceil(maxValue / 5) * 5);
  }, [windRoseData]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      barmode: "stack",
      dragmode: false,
      margin: { t: 8, r: 36, b: 8, l: 36 },
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
        },
        radialaxis: {
          angle: 90,
          ticksuffix: "%",
          gridcolor: "rgba(24, 62, 145, 0.16)",
          linecolor: "rgba(24, 62, 145, 0.20)",
          range: [0, radialAxisMax],
        },
      },
    }),
    [radialAxisMax]
  );

  const config = useMemo<Partial<Config>>(
    () => ({
      displayModeBar: false,
      responsive: true,
    }),
    []
  );

  const content = outOfBounds ? (
    <OutOfBoundsWarning message={getOutOfBoundsMessage(lat, lng, dataModel)} />
  ) : isLoading ? (
    <Stack spacing={1.5} sx={{ py: 1 }}>
      <Skeleton variant="text" width="35%" height={24} />
      <Skeleton variant="rounded" height={360} />
    </Stack>
  ) : error ? (
    <Typography color="error" variant="body2">
      Unable to load wind rose data. Please check your settings.
    </Typography>
  ) : !hasData || !windRoseData ? (
    <Typography variant="body2" color="text.secondary">
      Select a location and hub height to see wind direction and speed
      distribution.
    </Typography>
  ) : (
    <Stack spacing={2}>
      {/* <Typography variant="body2" color="text.secondary">
        Wind speed frequency by direction.
      </Typography> */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          mx: "auto",
          px: 1,
        }}
      >
        <Box
          sx={{
            width: "100%",
            aspectRatio: "1 / 1",
          }}
        >
          <Plot
            data={plotData}
            layout={layout}
            config={config}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
      </Box>
    </Stack>
  );

  return (
    <Accordion
      variant="outlined"
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Wind Rose
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expanded ? "Hide" : "Show"}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
};
