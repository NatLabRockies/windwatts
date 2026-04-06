import { Box, Chip, Collapse, Typography, Link } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useState } from "react";

export const Disclaimer = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <Chip
          label="Disclaimer"
          color="info"
          variant="outlined"
          sx={{ border: "none", fontSize: "0.95rem" }}
          onClick={() => setShowDisclaimer((v) => !v)}
          icon={<InfoOutlinedIcon sx={{ fontSize: "1.1rem" }} />}
        />
      </Box>
      <Collapse in={showDisclaimer}>
        <Typography
          variant="body2"
          color="textSecondary"
          marginBottom={2}
          px={1}
        >
          WindWatts offers quick, approximate wind resource estimates. For more
          detailed or location-specific data, consider reaching out to local
          wind installers who may share insights from nearby projects. To access
          alternative wind models, visit&nbsp;
          <Link
            href="https://wrdb.nrel.gov"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            NLR's Wind Resource Database
          </Link>
          .
        </Typography>
      </Collapse>
    </>
  );
};
