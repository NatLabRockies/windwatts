import {
  Box,
  FormControl,
  Typography,
  Select,
  MenuItem,
  Chip,
  Divider,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import useSWR from "swr";
import { SettingsContext } from "../../providers/SettingsContext";
import { useContext } from "react";
import { getAvailableTurbines } from "../../services/api";
import { TURBINE_LABEL, TURBINE_DATA, DEFAULT_TURBINES } from "../../constants";
import { CustomTurbinesManager } from "./CustomTurbinesManager";

export function TurbineSettings() {
  const { turbine, setTurbine, customCurves } = useContext(SettingsContext);

  const { data } = useSWR("/api/v1/turbines", getAvailableTurbines, {
    fallbackData: { available_turbines: DEFAULT_TURBINES },
  });

  const referenceTurbines: string[] = data?.available_turbines || [];

  const handleTurbineChange = (event: SelectChangeEvent<string>) => {
    setTurbine(event.target.value as string);
  };

  const getTurbineLabel = (id: string): string => {
    const custom = customCurves.find((c) => c.id === id);
    if (custom) return custom.name;
    const info = TURBINE_DATA[id];
    const base = TURBINE_LABEL[id] || id;
    return info?.minHeight !== undefined && info?.maxHeight !== undefined
      ? `${base} (${info.minHeight}-${info.maxHeight}m)`
      : base;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Turbine
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Typography variant="body2">Select a turbine option:</Typography>
        <CustomTurbinesManager />
      </Box>

      <FormControl component="fieldset" sx={{ width: "100%" }}>
        {referenceTurbines.length > 0 || customCurves.length > 0 ? (
          <Select
            labelId="turbine-select-label"
            id="turbine-select"
            value={turbine}
            onChange={handleTurbineChange}
            fullWidth
            size="small"
            renderValue={(selected) => getTurbineLabel(selected)}
          >
            {referenceTurbines.map((option, idx) => (
              <MenuItem key={"reference_turbine_" + idx} value={option}>
                {getTurbineLabel(option)}
              </MenuItem>
            ))}
            {customCurves.length > 0 && [
              <Divider key="custom-divider" />,
              ...customCurves.map((curve) => (
                <MenuItem key={curve.id} value={curve.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {curve.name}
                    <Chip
                      label="custom"
                      size="small"
                      sx={{ height: 18, fontSize: "0.65rem" }}
                    />
                  </Box>
                </MenuItem>
              )),
            ]}
          </Select>
        ) : (
          <Typography variant="body2">Loading turbine options…</Typography>
        )}

        <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
          * Note: () = Recommended hub height range.
        </Typography>
      </FormControl>
    </Box>
  );
}
