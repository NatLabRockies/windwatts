import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import { useRef, useState, useContext } from "react";
import { parsePowerCurveCSV, readFileAsText } from "../../services/upload";
import { idbPut, STORES } from "../../services/idb";
import type { CustomPowerCurve } from "../../types";
import { SettingsContext } from "../../providers/SettingsContext";

interface ImportPowerCurveDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportPowerCurveDialog({
  open,
  onClose,
}: ImportPowerCurveDialogProps) {
  const { addCustomCurve } = useContext(SettingsContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [curveName, setCurveName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
    if (file) {
      // Pre-fill name from filename (strip extension)
      const nameFromFile = file.name.replace(/\.[^/.]+$/, "");
      setCurveName(nameFromFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCurveName("");
    setError(null);
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file.");
      return;
    }
    const trimmedName = curveName.trim();
    if (!trimmedName) {
      setError("Please enter a name for the power curve.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. read file as text
      const text = await readFileAsText(selectedFile);
      // 2. parse CSV and validate format
      const data = parsePowerCurveCSV(text);
      // 3. construct CustomPowerCurve object
      const curve: CustomPowerCurve = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        data,
        createdAt: Date.now(),
      };
      // 4. save to IndexedDB and update context
      await idbPut(STORES.CUSTOM_TURBINES, curve);
      addCustomCurve(curve);
      // 5. close dialog
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import power curve."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Custom Power Curve</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a CSV file with two columns: <strong>Wind Speed (m/s)</strong>{" "}
          and <strong>Turbine Output</strong>. The curve data is stored locally
          in your browser only.
        </Typography>

        {/* File Picker */}
        <Box sx={{ mb: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => fileInputRef.current?.click()}
            size="small"
          >
            {selectedFile ? selectedFile.name : "Choose CSV file"}
          </Button>
        </Box>

        {/* Curve Name Input */}
        <TextField
          label="Power curve name"
          value={curveName}
          onChange={(e) => setCurveName(e.target.value)}
          fullWidth
          size="small"
          disabled={!selectedFile}
          helperText="This name will appear in the turbine selector."
        />

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!selectedFile || !curveName.trim() || saving}
        >
          {saving ? "Importing…" : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
