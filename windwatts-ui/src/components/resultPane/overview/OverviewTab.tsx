import { Stack } from "@mui/material";
import { useContext } from "react";
import { SettingsContext } from "../../../providers/SettingsContext";
import { useOutputUnit } from "../../../hooks";
import { DataSourceLinks } from "./DataSourceLinks";
import { SummaryCards } from "./SummaryCards";
import { EnsembleSettings } from "../../settings/EnsembleSettings";

export const OverviewTab = () => {
  const { preferredModel } = useContext(SettingsContext);

  useOutputUnit(); // auto-switches between kWh and MWh

  return (
    <Stack spacing={2}>
      <SummaryCards />
      <DataSourceLinks preferredModel={preferredModel} />
      <EnsembleSettings />
    </Stack>
  );
};
