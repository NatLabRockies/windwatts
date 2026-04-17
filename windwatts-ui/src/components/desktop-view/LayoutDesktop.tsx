import { Outlet, Link as RouterLink } from "react-router-dom";
import { Link, Box, AppBar, Toolbar } from "@mui/material";
import { Settings } from "../settings";
import { RightPane } from "../resultPane";
import { Footer } from "../Footer";

export function LayoutDesktop() {
  const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Wind Watts";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ flexGrow: 0 }}>
        {/* DO NOT DELETE: previous NREL Color: #027dbc */}
        <AppBar
          position="static"
          sx={{
            bgcolor: "background.paper",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Link
              to="/"
              variant="h5"
              component={RouterLink}
              underline="none"
              sx={{ flexGrow: 1, color: "text.primary" }}
            >
              {APP_TITLE}
            </Link>
            <Link
              href="https://www.nlr.gov"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
            >
              <Box
                component="img"
                sx={{ height: 42 }}
                src="/assets/nlr-logo-horizontal.svg"
                alt="NLR Logo"
              />
            </Link>
          </Toolbar>
        </AppBar>
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
