import { Box, Paper, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { SettingsContext } from "../../../providers/SettingsContext";
import { useOutputUnit } from "../../../hooks";
import { ModelSourceChip } from "../../shared";
import { DataSourceLinks } from "./DataSourceLinks";
import { SummaryCards } from "./SummaryCards";

export const OverviewTab = () => {
  const { preferredModel } = useContext(SettingsContext);

  useOutputUnit(); // auto-switches between kWh and MWh

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Resource Summary
            </Typography>
            <ModelSourceChip dataModel={preferredModel} />
          </Box>
        </Box>
        <Box sx={{ px: 2, pb: 1.5 }}>
          <SummaryCards />
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <DataSourceLinks preferredModel={preferredModel} />
        </Box>
      </Paper>
    </Stack>
  );
};
