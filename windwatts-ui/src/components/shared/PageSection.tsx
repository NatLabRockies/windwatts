import { Box, Container, Typography } from "@mui/material";
import { ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  children: ReactNode;
  alt?: boolean;
  id?: string;
}

// Consistent section wrapper for content pages: alternating background bands
export const PageSection = ({ title, children, alt, id }: PageSectionProps) => (
  <Box
    id={id}
    component="section"
    sx={{
      bgcolor: alt ? "var(--content-section-alt-bg)" : "background.paper",
      py: { xs: 5, md: 7 },
    }}
  >
    <Container maxWidth="md">
      {title && (
        <Typography
          variant="h4"
          component="h2"
          fontWeight={600}
          gutterBottom
          sx={{ mb: 3 }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Container>
  </Box>
);
