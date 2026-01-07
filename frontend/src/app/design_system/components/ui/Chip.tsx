import MUIChip from "@mui/material/Chip";
import type { ChipProps as MUIChipProps } from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { X } from "lucide-react";

export interface ChipProps
  extends Omit<MUIChipProps, "label" | "variant" | "onDelete" | "color" | "size"> {
  label: string;
  onRemove?: () => void;
  variant?: "default" | "primary";
}

const variantSx: Record<NonNullable<ChipProps["variant"]>, SxProps<Theme>> = {
  default: {
    bgcolor: "action.hover",
    color: "text.primary",
  },
  primary: {
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
    color: (theme) => theme.palette.primary.main,
  },
};

export function Chip({
  label,
  onRemove,
  variant = "default",
  sx,
  ...props
}: ChipProps) {
  const baseSx: SxProps<Theme> = {
    height: 24,
    borderRadius: 999,
    fontSize: "0.75rem",
    "& .MuiChip-label": {
      px: 1,
    },
    "& .MuiChip-deleteIcon": {
      color: "inherit",
      marginRight: 0.25,
    },
  };
  const mergedSx = (
    Array.isArray(sx) ? [baseSx, variantSx[variant], ...sx] : [baseSx, variantSx[variant], sx]
  ).filter(Boolean) as SxProps<Theme>;

  return (
    <MUIChip
      {...props}
      label={label}
      size="small"
      variant="filled"
      onDelete={onRemove}
      deleteIcon={onRemove ? <X size={12} /> : undefined}
      sx={mergedSx}
    />
  );
}
