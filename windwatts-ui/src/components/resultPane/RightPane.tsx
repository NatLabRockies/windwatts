import { Box } from "@mui/material";
import { AnalysisResults } from "./AnalysisResults";
import { SettingsSummary } from "./SettingsSummary";
import { Disclaimer } from "./Disclaimer";
import { ShareButton, SettingsButton, DownloadButton } from "../shared";

export const RightPane = () => {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        p: 2,
        "> *": {
          color: "text.primary",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SettingsSummary />

        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
            marginBottom: 2,
          }}
        >
          <ShareButton size="small" variant="outlined" />
          <DownloadButton size="small" variant="outlined" />
          <SettingsButton size="small" variant="outlined" />
        </Box>

        <AnalysisResults />

        <Disclaimer />
      </Box>
    </Box>
  );
};
