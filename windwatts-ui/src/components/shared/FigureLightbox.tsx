import { useState } from "react";
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";

interface FigureLightboxProps {
  src?: string;
  caption?: string;
  crop?: boolean;
}

export const FigureLightbox = ({ src, caption, crop }: FigureLightboxProps) => {
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={0.5}
        sx={{
          height: 160,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "action.hover",
          color: "text.disabled",
        }}
      >
        <InsertChartOutlinedIcon fontSize="large" />
        <Typography variant="caption">Figure to be provided</Typography>
      </Stack>
    );
  }

  return (
    <>
      <ButtonBase
        onClick={() => setOpen(true)}
        aria-label="Enlarge figure"
        sx={{
          position: "relative",
          display: "block",
          width: "100%",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={src}
          alt={caption ?? ""}
          sx={{
            display: "block",
            width: "100%",
            height: { xs: 220, sm: 300 },
            objectFit: crop ? "cover" : "contain",
            objectPosition: crop ? "top" : "center",
          }}
        />
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            position: "absolute",
            right: 8,
            bottom: 8,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: "rgba(0, 0, 0, 0.65)",
            color: "#fff",
          }}
        >
          <ZoomInIcon fontSize="small" />
          <Typography variant="caption">Click to enlarge</Typography>
        </Stack>
      </ButtonBase>
      {caption && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {caption}
        </Typography>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <IconButton
          onClick={() => setOpen(false)}
          aria-label="Close enlarged figure"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "background.paper",
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
          <Box
            component="img"
            src={src}
            alt={caption ?? ""}
            sx={{
              display: "block",
              width: "100%",
              maxHeight: "calc(100vh - 200px)",
              objectFit: "contain",
            }}
          />
          {caption && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {caption}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
