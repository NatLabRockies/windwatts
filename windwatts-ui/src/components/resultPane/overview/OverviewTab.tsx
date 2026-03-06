import { Box, Divider, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { SettingsContext } from "../../../providers/SettingsContext";
import { useOutputUnit } from "../../../hooks";
import { EnsembleTiles } from "./EnsembleResultsCard";
import { WindSpeedCard } from "./WindSpeedCard";
import { WindResourceCard } from "./WindResourceCard";
import { DataSourceLinks } from "./DataSourceLinks";
import { ProductionCard } from "./ProductionCard";

export const OverviewTab = () => {
  const { preferredModel } = useContext(SettingsContext);

  useOutputUnit(); // auto-switches between kWh and MWh

  return (
    <Stack spacing={2}>
      {preferredModel === "ensemble-quantiles" ? (
        <>
          <Divider
            textAlign="center"
            sx={{ my: 1, fontWeight: 600, color: "text.secondary" }}
          >
            Ensemble Model Results *
          </Divider>
          <EnsembleTiles />
          <Typography variant="body2" color="text.secondary">
            * Experimental model (under development)
          </Typography>
        </>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <WindSpeedCard />
            </Box>
            <Box sx={{ flex: 1 }}>
              <WindResourceCard />
            </Box>
          </Box>
          <DataSourceLinks preferredModel={preferredModel} />
        </>
      )}

      <ProductionCard showDetails={false} />
    </Stack>
  );
};
