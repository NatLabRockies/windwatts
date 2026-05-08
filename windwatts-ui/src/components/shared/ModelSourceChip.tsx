import { Chip } from "@mui/material";
import type { MouseEvent } from "react";
import { DATA_MODEL_INFO } from "../../constants";
import { DataModel } from "../../types";

interface ModelSourceChipProps {
  dataModel: DataModel | string;
}

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error";

export const ModelSourceChip = ({ dataModel }: ModelSourceChipProps) => {
  const info = DATA_MODEL_INFO[dataModel];
  if (!info) return null;

  const color: ChipColor = "primary";

  if (info.source_href) {
    const handleClick = (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      window.open(info.source_href, "_blank", "noopener,noreferrer");
    };
    return (
      <Chip
        label={info.label}
        size="small"
        variant="outlined"
        color={color}
        onClick={handleClick}
      />
    );
  }

  return (
    <Chip label={info.label} size="small" variant="outlined" color={color} />
  );
};
