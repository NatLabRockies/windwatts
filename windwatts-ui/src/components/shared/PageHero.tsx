import { Box, Container, Typography } from "@mui/material";
import { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

// Hero banner used at the top of content pages (About, Research)
export const PageHero = ({ title, subtitle, children }: PageHeroProps) => (
  <Box
    sx={{
      background: "var(--content-hero-gradient)",
      color: "#fff",
      py: { xs: 6, md: 9 },
    }}
  >
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="h6"
          component="p"
          sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 720 }}
        >
          {subtitle}
        </Typography>
      )}
      {children}
    </Container>
  </Box>
);
