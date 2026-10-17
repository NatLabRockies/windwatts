import { Button } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { SNACKBAR_DURATION_ERROR } from "../../constants";
import { useToast } from "../../hooks/useToast";

interface ShareButtonProps {
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export function ShareButton({
  variant = "outlined",
  size = "small",
  fullWidth = false,
}: ShareButtonProps) {
  const { showToast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast({ message: "Link copied to clipboard!", severity: "success" });
    } catch (error) {
      console.error("Failed to copy URL to clipboard:", error);
      showToast({
        message: "Failed to copy link. Please copy from the address bar.",
        severity: "error",
        duration: SNACKBAR_DURATION_ERROR,
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={<ShareIcon />}
      onClick={handleShare}
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
      Share Link
    </Button>
  );
}
