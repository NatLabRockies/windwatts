import { memo, useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  Tooltip,
  IconButton,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { UnitsContext } from "../../../providers/UnitsContext";
import { SettingsContext } from "../../../providers/SettingsContext";
import { useWindData, useProductionData, useEnsemble } from "../../../hooks";
import {
  convertWindspeed,
  convertOutput,
  getWindResource,
  getOutOfBoundsMessage,
} from "../../../utils";
import { KEY_AVERAGE_YEAR, KEY_KWH_PRODUCED } from "../../../constants";
import { OutOfBoundsCard } from "../../shared/CardStates";

const getWindResourceInfo = (resource: string) => {
  const r = resource.toLowerCase();
  if (r.includes("high"))
    return {
      bgColor: "success.light",
      textColor: "success.contrastText",
      tooltip:
        "High wind resource: speeds above 5.00 m/s (11.2 mph) — excellent for wind energy generation",
    };
  if (r.includes("moderate"))
    return {
      bgColor: "info.light",
      textColor: "info.contrastText",
      tooltip:
        "Moderate wind resource: speeds 3.00–5.00 m/s (6.7–11.2 mph) — good potential for wind energy",
    };
  return {
    bgColor: "warning.light",
    textColor: "warning.contrastText",
    tooltip:
      "Low wind resource: speeds below 3.00 m/s (6.7 mph) — limited wind energy potential",
  };
};

const SkeletonCard = () => (
  <Paper sx={{ p: 2, minHeight: 100 }} elevation={2}>
    <Skeleton variant="text" width="55%" height={18} />
    <Skeleton variant="text" width="80%" height={36} sx={{ my: 0.5 }} />
    <Skeleton variant="text" width="65%" height={14} />
  </Paper>
);

export const SummaryCards = memo(() => {
  const { units } = useContext(UnitsContext);
  const { preferredModel } = useContext(SettingsContext);
  const isEnsemble = preferredModel === "ensemble-quantiles";

  const eraWind = useWindData();
  const eraProd = useProductionData();
  const ensembleTiles = useEnsemble();

  // Derived loading / error / outOfBounds flags per mode
  const windLoading = isEnsemble
    ? ensembleTiles.windLoading
    : eraWind.isLoading;
  const prodLoading = isEnsemble
    ? ensembleTiles.productionLoading
    : eraProd.isLoading;
  const windError = isEnsemble ? ensembleTiles.windError : eraWind.error;
  const prodError = isEnsemble ? ensembleTiles.productionError : eraProd.error;
  const hasWindData = isEnsemble ? ensembleTiles.hasWindData : eraWind.hasData;
  const hasProdData = isEnsemble
    ? ensembleTiles.hasProductionData
    : eraProd.hasData;
  const outOfBounds = isEnsemble
    ? ensembleTiles.outOfBounds
    : eraWind.outOfBounds || eraProd.outOfBounds;
  const outOfBoundsLat = isEnsemble ? ensembleTiles.lat : eraWind.lat;
  const outOfBoundsLng = isEnsemble ? ensembleTiles.lng : eraWind.lng;
  const outOfBoundsModel = isEnsemble
    ? ensembleTiles.dataModel
    : eraWind.dataModel;

  if (outOfBounds) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <Box sx={{ gridColumn: "1 / -1" }}>
          <OutOfBoundsCard
            message={getOutOfBoundsMessage(
              outOfBoundsLat,
              outOfBoundsLng,
              outOfBoundsModel
            )}
          />
        </Box>
      </Box>
    );
  }

  // Wind speed & resource data
  const windGlobalAvg = isEnsemble
    ? (ensembleTiles.windData?.global_avg ?? 0)
    : (eraWind.windData?.global_avg ?? 0);
  const windResource = getWindResource(windGlobalAvg);
  const windInfo = getWindResourceInfo(windResource);
  const windSpeedDisplay = convertWindspeed(windGlobalAvg, units.windspeed);

  // Production data
  const rawProdValue = isEnsemble
    ? Number(ensembleTiles.productionData?.energy_production || 0)
    : Number(
        eraProd.productionData?.summary_avg_energy_production?.[
          KEY_AVERAGE_YEAR
        ]?.[KEY_KWH_PRODUCED] || 0
      );
  const prodFormatted = convertOutput(rawProdValue, units.output);
  // Split "1,200.0 kWh" → number part + unit part
  const prodParts = prodFormatted.split(/\s+/);
  const prodNumber = prodParts.slice(0, -1).join(" ");
  const prodUnit = prodParts[prodParts.length - 1];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        gap: 2,
      }}
    >
      {/* Card 1 — Wind Speed */}
      {windLoading ? (
        <SkeletonCard />
      ) : windError ? (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            bgcolor: "error.light",
            color: "error.contrastText",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" gutterBottom>
            Wind Speed
          </Typography>
          <Typography variant="body2">Error loading data</Typography>
        </Paper>
      ) : !hasWindData ? (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            bgcolor: "grey.100",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Wind Speed *
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Wind Speed *
          </Typography>
          <Typography
            variant="h5"
            color="primary"
            sx={{ fontWeight: "bold", my: 0.5 }}
          >
            {windSpeedDisplay}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Average at selected height
          </Typography>
        </Paper>
      )}

      {/* Card 2 — Wind Resource */}
      {windLoading ? (
        <SkeletonCard />
      ) : windError ? (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            bgcolor: "error.light",
            color: "error.contrastText",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" gutterBottom>
            Wind Resource
          </Typography>
          <Typography variant="body2">Error loading data</Typography>
        </Paper>
      ) : !hasWindData ? (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            bgcolor: "grey.100",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Wind Resource
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: windInfo.bgColor,
            color: windInfo.textColor,
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
            Wind Resource
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {windResource}
            </Typography>
            <Tooltip title={windInfo.tooltip} arrow>
              <IconButton
                size="small"
                sx={{
                  color: "inherit",
                  opacity: 0.8,
                  "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                <InfoOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Broad measure of wind available
          </Typography>
        </Paper>
      )}

      {/* Card 3 — Production */}
      {prodLoading ? (
        <SkeletonCard />
      ) : prodError ? (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            bgcolor: "error.light",
            color: "error.contrastText",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" gutterBottom>
            Production
          </Typography>
          <Typography variant="body2">Error loading data</Typography>
        </Paper>
      ) : !hasProdData ? (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            bgcolor: "grey.100",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Production
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 2,
            minHeight: 100,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: "primary.light",
            color: "primary.contrastText",
          }}
          elevation={2}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
            Production
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold", my: 0.5 }}>
            {prodNumber}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {`${prodUnit} · `}
            Average annual estimate
          </Typography>
        </Paper>
      )}
    </Box>
  );
});
