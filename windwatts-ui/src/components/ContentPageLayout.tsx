import { Box } from "@mui/material";
import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";

interface ContentPageLayoutProps {
  children: ReactNode;
}

// Layout for full-page content (About, Research)
export const ContentPageLayout = ({ children }: ContentPageLayoutProps) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      color: "text.primary",
    }}
  >
    <AppHeader />
    <Box component="main" sx={{ flexGrow: 1 }}>
      {children}
    </Box>
    <Footer />
  </Box>
);
