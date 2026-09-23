import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { Settings } from "../settings";
import { RightPane } from "../resultPane";
import { Footer } from "../Footer";
import { AppHeader } from "../AppHeader";

export function LayoutDesktop() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ flexGrow: 0 }}>
        {/* DO NOT DELETE: previous NREL Color: #027dbc */}
        <AppHeader />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "relative",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Outlet />
        </Box>

        <Box
          className="right-pane"
          sx={{
            width: 420,
            bgcolor: "background.paper",
            overflowY: "auto",
            borderLeft: "1px solid #ddd",
          }}
        >
          <Box>
            <RightPane />
          </Box>
          <Footer />
        </Box>
      </Box>
      <Settings />
    </Box>
  );
}
