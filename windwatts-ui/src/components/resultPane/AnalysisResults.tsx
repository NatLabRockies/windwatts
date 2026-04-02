import { Stack, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { OverviewTab } from "./overview/OverviewTab";
import { DetailsTab } from "./details/DetailsTab";

export const AnalysisResults = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [windRoseToggle, setWindRoseToggle] = useState(true);
  const [prodTableOpen, setProdTableOpen] = useState(true);

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

      {/* DO NOT DELETE: Decision Logic for Tab Content
      1. && operator:
        - Pros: Conditional rendering, plotly is resized correctly when tab is shown.
        - Cons: Components are unmounted when switching tabs, losing their state. Performance hit from remounting.
        - Patch: Store toggle states in parent component (AnalysisResults)
      2. CSS display: display: none/block | height: 0/auto + overflow: hidden | visibility: hidden/visible
        - Pros: Components remain mounted, preserving state. No performance hit from remounting.
        - Cons: display/ visibility - Plotly does not resize correctly when its container is hidden (display: none) and then shown again. Requires additional logic to trigger resize on tab switch.
        - Cons: height + overflow - hidden tab component does not reducce to zero height (child components margin/ padding)
      */}
      {activeTab === 0 && <OverviewTab />}
      {activeTab === 1 && (
        <DetailsTab
          windRoseToggle={windRoseToggle}
          onWindRoseToggleChange={setWindRoseToggle}
          prodTableOpen={prodTableOpen}
          onProdTableOpenChange={setProdTableOpen}
        />
      )}
    </Stack>
  );
};
