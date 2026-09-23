import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link, Box, AppBar, Toolbar, Stack } from "@mui/material";

const NAV_ITEMS = [
  { label: "Map", to: "/" },
  { label: "About", to: "/about" },
  { label: "Research", to: "/research" },
];

interface AppHeaderProps {
  logoHeight?: number;
  titleVariant?: "h5" | "h6";
}

export const AppHeader = ({
  logoHeight = 42,
  titleVariant = "h5",
}: AppHeaderProps) => {
  const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Wind Watts";
  const location = useLocation();

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Toolbar
        sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
      >
        <Link
          to="/"
          variant={titleVariant}
          component={RouterLink}
          underline="none"
          sx={{ color: "text.primary", whiteSpace: "nowrap" }}
        >
          {APP_TITLE}
        </Link>

        <Stack
          component="nav"
          aria-label="primary navigation"
          direction="row"
          spacing={{ xs: 2, sm: 3 }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                component={RouterLink}
                underline={isActive ? "always" : "hover"}
                sx={{
                  color: isActive ? "primary.main" : "text.secondary",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </Stack>

        <Link
          href="https://www.nlr.gov"
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
        >
          <Box
            component="img"
            sx={{ height: logoHeight }}
            src="/assets/nlr-logo-horizontal.svg"
            alt="NLR Logo"
          />
        </Link>
      </Toolbar>
    </AppBar>
  );
};
