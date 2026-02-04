import { useState } from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { DownloadDialog } from "./DownloadDialog";

interface DownloadButtonProps {
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export const DownloadButton = ({
  variant = "outlined",
  size = "small",
  fullWidth = false,
}: DownloadButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={<DownloadIcon />}
        onClick={() => setIsDialogOpen(true)}
        sx={{
          fontSize: "0.9em",
          textTransform: "none",
          borderRadius: 2,
          px: 2,
          py: 0.5,
          borderColor: "primary.main",
          color: "primary.main",
          "&:hover": {
            backgroundColor: "primary.main",
            color: "white",
            borderColor: "primary.main",
          },
        }}
      >
        Export Data
      </Button>

      {isDialogOpen && (
        <DownloadDialog onClose={() => setIsDialogOpen(false)} />
      )}
    </>
  );
};
