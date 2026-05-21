import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Close, DeleteOutline } from "@mui/icons-material";
import { useContext, useState } from "react";
import { SettingsContext } from "../../providers/SettingsContext";
import { ImportPowerCurveDialog } from "./ImportPowerCurveDialog";
import { DEFAULT_TURBINES } from "../../constants";

export function CustomTurbineManager() {
  const { turbine, setTurbine, customCurves, removeCustomCurve } =
    useContext(SettingsContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const handleDelete = (id: string) => {
    removeCustomCurve(id);
    if (turbine === id) {
      setTurbine(DEFAULT_TURBINES[1]);
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="text"
        onClick={() => setModalOpen(true)}
        sx={{ textTransform: "none", minWidth: 0, whiteSpace: "nowrap" }}
      >
        Custom Turbines
        {customCurves.length > 0 && (
          <Chip
            label={customCurves.length}
            size="small"
            sx={{ ml: 0.75, height: 18, fontSize: "0.65rem" }}
          />
        )}
      </Button>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pr: 6 }}>
          Custom Turbines
          <IconButton
            aria-label="close"
            onClick={() => setModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {customCurves.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              No custom turbines imported yet.
            </Typography>
          ) : (
            <Paper variant="outlined" sx={{ mb: 1.5 }}>
              {customCurves.map((curve, idx) => (
                <Box
                  key={curve.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    py: 0.75,
                    borderBottom:
                      idx < customCurves.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
                    {curve.name}
                  </Typography>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(curve.id)}
                      aria-label={`Delete ${curve.name}`}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Paper>
          )}

          <Divider sx={{ mb: 1.5 }} />

          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => setImportOpen(true)}
          >
            Import turbine power curve
          </Button>
        </DialogContent>
      </Dialog>

      <ImportPowerCurveDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </>
  );
}
