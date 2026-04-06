import { useContext } from "react";
import {
  Box,
  Typography,
  Switch,
  Tooltip,
  IconButton,
  Paper,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { SettingsContext } from "../../providers/SettingsContext";

const ENSEMBLE_TOOLTIP =
  "The WindWatts Ensemble model is an alternative to our default atmospheric model, ERA5. " +
  "This new model leverages machine learning with data from multiple constituent models with " +
  "ancillary location and terrain data. While early results show significant performance " +
  "improvements, this model is still being developed and should be used with care.";

export const EnsembleSettings = () => {
  const { preferredModel, setPreferredModel } = useContext(SettingsContext);

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.25,
        borderRadius: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Enable Ensemble Model
        </Typography>
        <Tooltip title={ENSEMBLE_TOOLTIP} arrow placement="top">
          <IconButton
            size="small"
            sx={{ p: 0.25 }}
            aria-label="Ensemble model info"
          >
            <InfoOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Switch
        size="small"
        checked={preferredModel === "ensemble-quantiles"}
        onChange={(e) =>
          setPreferredModel(
            e.target.checked ? "ensemble-quantiles" : "era5-quantiles"
          )
        }
        inputProps={{ "aria-label": "Enable Ensemble Model" }}
      />
    </Paper>
  );
};
