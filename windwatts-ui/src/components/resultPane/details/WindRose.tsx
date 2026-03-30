import { useContext, useMemo, useState, type SyntheticEvent } from "react";
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
import { useNearestGridLocation, useWindRoseData } from "../../../hooks";
import { SettingsContext } from "../../../providers/SettingsContext";
import { getOutOfBoundsMessage, isOutOfBounds } from "../../../utils";
import {
  buildWindRosePlotData,
  getWindRoseConfig,
  getWindRoseLayout,
  getWindRoseRadialAxisMax,
} from "../../../plots/windRosePlot";
import { OutOfBoundsWarning } from "../../shared";

interface WindRoseProps {
  toggle?: boolean;
  onToggleChange?: (toggle: boolean) => void;
}

export const WindRose = ({ toggle = true, onToggleChange }: WindRoseProps) => {
  const [expanded, setExpanded] = useState(toggle);
  const handleExpandChange = (_event: SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
    onToggleChange?.(isExpanded);
  };

  const {
    gridLocations,
    isLoading: isGridLoading,
    error: gridLocationError,
  } = useNearestGridLocation(1);
  const gridIndex = gridLocations[0]?.index;
  const { currentPosition, preferredModel, hubHeight } =
    useContext(SettingsContext);
  const lat = currentPosition?.lat;
  const lng = currentPosition?.lng;
  const dataModel =
    preferredModel === "ensemble-quantiles" ? "era5-quantiles" : preferredModel;
  const outOfBounds =
    lat !== undefined && lng !== undefined
      ? isOutOfBounds(lat, lng, dataModel)
      : false;

  const { windRoseData, windRoseHeight, isLoading, error, hasData } =
    useWindRoseData(outOfBounds ? undefined : gridIndex);

  const plotData = useMemo(
    () => (windRoseData ? buildWindRosePlotData(windRoseData) : []),
    [windRoseData]
  );

  const radialAxisMax = useMemo(() => {
    if (!windRoseData) return 10;
    return getWindRoseRadialAxisMax(windRoseData);
  }, [windRoseData]);

  const layout = useMemo(
    () => getWindRoseLayout(radialAxisMax, windRoseData?.no_of_sectors),
    [radialAxisMax, windRoseData?.no_of_sectors]
  );

  const config = useMemo(() => getWindRoseConfig(), []);

  const content = outOfBounds ? (
    <OutOfBoundsWarning message={getOutOfBoundsMessage(lat, lng, dataModel)} />
  ) : isGridLoading || isLoading ? (
    <Stack spacing={1.5} sx={{ py: 1 }}>
      <Skeleton variant="text" width="35%" height={24} />
      <Skeleton variant="rounded" height={360} />
    </Stack>
  ) : gridLocationError ? (
    <Typography color="error" variant="body2">
      Unable to resolve nearest grid location. Please check your settings.
    </Typography>
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
      {windRoseHeight !== undefined && windRoseHeight !== hubHeight && (
        <Typography variant="caption" color="text.secondary">
          Showing closest available height for wind direction: {windRoseHeight}m
          (selected: {hubHeight}m).
        </Typography>
      )}
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
      onChange={handleExpandChange}
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
