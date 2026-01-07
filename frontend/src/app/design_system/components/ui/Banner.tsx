import type { JSX } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import type { AlertColor, AlertProps } from "@mui/material/Alert";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { AlertCircle, Info, CheckCircle2, X } from "lucide-react";

export type BannerVariant = 'info' | 'success' | 'warning' | 'error';
export interface BannerProps
  extends Omit<AlertProps, "severity" | "variant" | "children" | "icon" | "onClose"> {
  variant?: BannerVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onClose?: () => void;
}

const severityMap: Record<BannerVariant, AlertColor> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

const icons: Record<BannerVariant, JSX.Element> = {
  info: <Info size={16} />,
  success: <CheckCircle2 size={16} />,
  warning: <AlertCircle size={16} />,
  error: <AlertCircle size={16} />,
};

export function Banner({
  variant = "info",
  title,
  message,
  dismissible = false,
  onClose,
  className = "",
  sx,
  ...props
}: BannerProps) {
  const severity = severityMap[variant];
  const baseSx: SxProps<Theme> = {
    borderRadius: 1,
    px: 2,
    py: 1.5,
    alignItems: "flex-start",
    borderColor: (theme) => theme.palette[severity].main,
    backgroundColor: (theme) => alpha(theme.palette[severity].main, 0.08),
    color: (theme) => theme.palette[severity].dark,
    "& .MuiAlert-message": {
      padding: 0,
    },
    "& .MuiAlert-icon": {
      mt: "2px",
      color: (theme) => theme.palette[severity].main,
    },
  };
  const mergedSx = (Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx]).filter(
    Boolean
  ) as SxProps<Theme>;

  return (
    <Alert
      {...props}
      className={className}
      severity={severity}
      variant="outlined"
      icon={icons[variant]}
      sx={mergedSx}
      action={
        dismissible ? (
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Dismiss"
            sx={{ color: "inherit" }}
          >
            <X size={14} />
          </IconButton>
        ) : null
      }
    >
      {title && <AlertTitle sx={{ mb: 0.5, fontWeight: 600 }}>{title}</AlertTitle>}
      <Box sx={{ fontSize: "0.875rem", lineHeight: 1.4 }}>{message}</Box>
    </Alert>
  );
}
