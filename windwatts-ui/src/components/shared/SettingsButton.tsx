import { useContext } from "react";
import { Button } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { SettingsContext } from "../../providers/SettingsContext";

interface SettingsButtonProps {
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export function SettingsButton({
  variant = "outlined",
  size = "small",
  fullWidth = false,
}: SettingsButtonProps) {
  const { toggleSettings } = useContext(SettingsContext);

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={<SettingsIcon />}
      onClick={toggleSettings}
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
      Edit settings
    </Button>
  );
}
