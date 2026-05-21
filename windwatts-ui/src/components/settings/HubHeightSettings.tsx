import { useContext, useEffect, useMemo } from "react";
import { SettingsContext } from "../../providers/SettingsContext";
import {
  Box,
  Slider,
  Typography,
  Paper,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { HUB_HEIGHTS, TURBINE_DATA } from "../../constants";

export function HubHeightSettings() {
  const {
    hubHeight,
    setHubHeight,
    preferredModel: dataModel,
    turbine,
  } = useContext(SettingsContext);

  const { values: availableHeights, interpolation: step } = useMemo(() => {
    if (dataModel && HUB_HEIGHTS[dataModel]) {
      return HUB_HEIGHTS[dataModel];
    }
    return HUB_HEIGHTS.default;
  }, [dataModel]);

  // ensure slider compatibility with model switching and available heights changes
  useEffect(() => {
    if (!availableHeights.includes(hubHeight)) {
      // if current height not available, set to the closest available height
      const closestHeight = availableHeights.reduce((prev, curr) =>
        Math.abs(curr - hubHeight) < Math.abs(prev - hubHeight) ? curr : prev
      );
      setHubHeight(closestHeight);
    }
  }, [availableHeights, hubHeight, setHubHeight]);

  const hubHeightMarks = availableHeights.map((value: number) => ({
    value: value,
    label: `${value}m`,
  }));

  const handleHubHeightChange = (
    _: Event,
    newHubHeight: number | number[] | null
  ) => {
    if (newHubHeight !== null && typeof newHubHeight === "number") {
      setHubHeight(newHubHeight);
    }
  };

  const turbineInfo = TURBINE_DATA[turbine];
  const hasHeightRange =
    turbineInfo?.minHeight !== undefined &&
    turbineInfo?.maxHeight !== undefined;

  const isHeightInRange: boolean = hasHeightRange
    ? hubHeight >= turbineInfo!.minHeight! &&
      hubHeight <= turbineInfo!.maxHeight!
    : true;

  const validationColor: "primary" | "success" | "warning" = hasHeightRange
    ? isHeightInRange
      ? "success"
      : "warning"
    : "primary";

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Hub Height
      </Typography>
      <Typography variant="body2" gutterBottom>
        Choose nearest hub height (m):
      </Typography>

      {hasHeightRange && (
        <Paper
          sx={{
            p: 1,
            mb: 2,
            backgroundColor: `${validationColor}.light`,
            borderLeft: `4px solid`,
            borderLeftColor: `${validationColor}.main`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2">
              <strong>
                {isHeightInRange ? "Within" : "Outside"} recommended range - (
                {turbineInfo!.minHeight}m - {turbineInfo!.maxHeight}m)
              </strong>
            </Typography>
            <Tooltip title={turbineInfo?.info ?? ""} arrow placement="right">
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      )}

      <Slider
        value={hubHeight}
        onChange={handleHubHeightChange}
        aria-labelledby="hub-height-slider"
        valueLabelDisplay="auto"
        getAriaValueText={(value) => `${value}m`}
        step={step}
        marks={hubHeightMarks}
        min={Math.min(...availableHeights)}
        max={Math.max(...availableHeights)}
        color={validationColor}
      />
    </Box>
  );
}
