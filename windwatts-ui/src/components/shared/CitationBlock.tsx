import { useState } from "react";
import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  SNACKBAR_DURATION_SUCCESS,
  SNACKBAR_DURATION_ERROR,
} from "../../constants";

interface CitationBlockProps {
  citation: string;
}

export const CitationBlock = ({ citation }: CitationBlockProps) => {
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setStatus("success");
    } catch (error) {
      console.error("Failed to copy citation to clipboard:", error);
      setStatus("error");
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

      <Snackbar
        open={status !== null}
        autoHideDuration={
          status === "error"
            ? SNACKBAR_DURATION_ERROR
            : SNACKBAR_DURATION_SUCCESS
        }
        onClose={() => setStatus(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setStatus(null)}
          severity={status ?? "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {status === "error"
            ? "Failed to copy citation. Please select and copy the text."
            : "Citation copied to clipboard!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};
