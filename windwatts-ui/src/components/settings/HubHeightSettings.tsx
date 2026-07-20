import { useContext, useEffect, useMemo, useState } from "react";
import { SettingsContext } from "../../providers/SettingsContext";
import {
  Box,
  IconButton,
  InputAdornment,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { resolveCustomCurve, resolveHubHeight } from "../../utils";
import { HUB_HEIGHTS, TURBINE_DATA } from "../../constants";

export function HubHeightSettings() {
  const {
    hubHeight,
    setHubHeight,
    preferredModel: dataModel,
    turbine,
    customCurves,
  } = useContext(SettingsContext);

  const { values: availableHeights, interpolation: interpolable } =
    useMemo(() => {
      if (dataModel && HUB_HEIGHTS[dataModel]) {
        return HUB_HEIGHTS[dataModel];
      }
      return HUB_HEIGHTS.default;
    }, [dataModel]);

  const modelMin = Math.min(...availableHeights);
  const modelMax = Math.max(...availableHeights);

  const [inputValue, setInputValue] = useState(String(hubHeight));

  // keep text field in sync when hubHeight changes externally (slider, model switch)
  useEffect(() => {
    setInputValue(String(hubHeight));
  }, [hubHeight]);

  // clamp or snap on model switch / available heights change
  useEffect(() => {
    const resolved = resolveHubHeight(
      hubHeight,
      availableHeights,
      interpolable
    );
    if (resolved !== hubHeight) setHubHeight(resolved);
  }, [availableHeights, interpolable, hubHeight, setHubHeight]);

  const hubHeightMarks = availableHeights.map((value: number) => ({
    value,
    label: `${value}m`,
  }));

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setHubHeight(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const commitInput = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      const resolvedHubHeight = resolveHubHeight(
        parsed,
        availableHeights,
        interpolable
      );
      setHubHeight(resolvedHubHeight);
    } else {
      setInputValue(String(hubHeight));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitInput();
  };

  const customCurve = resolveCustomCurve(turbine, customCurves);
  const turbineInfo = TURBINE_DATA[turbine];

  const turbineMinHeight = customCurve?.minHeight ?? turbineInfo?.minHeight;
  const turbineMaxHeight = customCurve?.maxHeight ?? turbineInfo?.maxHeight;
  const hasHeightRange =
    turbineMinHeight !== undefined && turbineMaxHeight !== undefined;
  const heightRangeInfo = turbineInfo?.info ?? "";

  const isHeightInRange: boolean = hasHeightRange
    ? hubHeight >= turbineMinHeight! && hubHeight <= turbineMaxHeight!
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

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2">Set hub height:</Typography>
        <TextField
          value={inputValue}
          onChange={handleInputChange}
          onBlur={commitInput}
          onKeyDown={handleInputKeyDown}
          size="small"
          type="number"
          disabled={!interpolable}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
            },
            htmlInput: {
              min: modelMin,
              max: modelMax,
              step: 1,
              "aria-label": "hub height input",
            },
          }}
          sx={{ width: 100 }}
        />
      </Box>

      <Box sx={{ px: 1 }}>
        <Slider
          value={hubHeight}
          onChange={handleSliderChange}
          aria-labelledby="hub-height-slider"
          valueLabelDisplay="auto"
          getAriaValueText={(value) => `${value}m`}
          step={interpolable ? 1 : null}
          marks={hubHeightMarks}
          min={modelMin}
          max={modelMax}
          color={validationColor}
        />
      </Box>

      {interpolable && (
        <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
          * Values between marks are interpolated (no extrapolation).
        </Typography>
      )}

      {hasHeightRange && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{ color: `${validationColor}.main` }}
          >
            * Recommended range: {turbineMinHeight}m - {turbineMaxHeight}m
          </Typography>
          {heightRangeInfo && (
            <Tooltip title={heightRangeInfo} arrow placement="right">
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}
