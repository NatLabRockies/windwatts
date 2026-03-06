import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Skeleton,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

interface WindRoseProps {
  defaultExpanded?: boolean;
}

export const WindRose = ({ defaultExpanded = true }: WindRoseProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Accordion
      variant="outlined"
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Wind Rose
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expanded ? "Hide" : "Show"}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 2,
          }}
        >
          <Skeleton variant="circular" width={220} height={220} />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
