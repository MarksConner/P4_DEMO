import MuiCard from "@mui/material/Card";
import Box from "@mui/material/Box";
import type { CardProps as MuiCardProps } from "@mui/material/Card";
import type { BoxProps } from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

export type CardVariant = "default" | "elevated";

export interface CardProps extends Omit<MuiCardProps, "variant"> {
  variant?: CardVariant;
}

const mergeSx = (base: SxProps<Theme>, sx?: SxProps<Theme>) =>
  (Array.isArray(sx) ? [base, ...sx] : [base, sx]).filter(Boolean) as SxProps<Theme>;

const variantSx: Record<CardVariant, SxProps<Theme>> = {
  default: {
    backgroundColor: "background.paper",
    borderColor: "divider",
  },
  elevated: {
    backgroundColor: "background.paper",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
  },
};

export function Card({ variant = "default", sx, ...props }: CardProps) {
  const muiVariant = variant === "default" ? "outlined" : "elevation";

  return (
    <MuiCard
      {...props}
      variant={muiVariant}
      elevation={variant === "elevated" ? 0 : undefined}
      sx={mergeSx(variantSx[variant], sx)}
    />
  );
}

export function CardHeader({ sx, ...props }: BoxProps) {
  return <Box {...props} sx={mergeSx({ p: 3 }, sx)} />;
}

export function CardContent({ sx, ...props }: BoxProps) {
  return <Box {...props} sx={mergeSx({ px: 3, pb: 3, pt: 0 }, sx)} />;
}

export function CardFooter({ sx, ...props }: BoxProps) {
  return (
    <Box
      {...props}
      sx={mergeSx({ px: 3, pb: 3, pt: 0, display: "flex", alignItems: "center" }, sx)}
    />
  );
}
