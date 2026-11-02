import { Box, Button, Stack, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { SNACKBAR_DURATION_ERROR } from "../../constants";
import { useToast } from "../../hooks/useToast";

interface CitationBlockProps {
  citation: string;
}

export const CitationBlock = ({ citation }: CitationBlockProps) => {
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      showToast({
        message: "Citation copied to clipboard!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to copy citation to clipboard:", error);
      showToast({
        message: "Failed to copy citation. Please try again.",
        severity: "error",
        duration: SNACKBAR_DURATION_ERROR,
      });
    }
  };

  return (
    <Box sx={{ mt: 2.5, p: 2, borderRadius: 1, bgcolor: "action.hover" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1}
      >
        <Typography variant="body2" color="text.secondary">
          {citation}
        </Typography>
        <Button
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          sx={{ textTransform: "none", flexShrink: 0 }}
        >
          Copy
        </Button>
      </Stack>
    </Box>
  );
};
