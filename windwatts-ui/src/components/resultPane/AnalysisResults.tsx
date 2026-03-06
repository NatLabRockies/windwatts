import { Stack, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { OverviewTab } from "./overview/OverviewTab";
import { DetailsTab } from "./details/DetailsTab";

export const AnalysisResults = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Stack spacing={2}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label="Overview" />
        <Tab label="Details" />
      </Tabs>

      {activeTab === 0 ? <OverviewTab /> : <DetailsTab />}
    </Stack>
  );
};
