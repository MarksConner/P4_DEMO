import { forwardRef } from "react";
import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<MuiButtonProps, "variant" | "size" | "color"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeMap: Record<ButtonSize, MuiButtonProps["size"]> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

const sizeSx: Record<ButtonSize, SxProps<Theme>> = {
  sm: { minHeight: 32, px: 1.5, py: 0.5, fontSize: "0.75rem" },
  md: { minHeight: 40, px: 2, py: 1, fontSize: "0.875rem" },
  lg: { minHeight: 48, px: 3, py: 1.5, fontSize: "0.875rem" },
};

const variantMap: Record<
  ButtonVariant,
  {
    variant: MuiButtonProps["variant"];
    color: MuiButtonProps["color"];
    sx?: SxProps<Theme>;
  }
> = {
  primary: { variant: "contained", color: "primary" },
  secondary: {
    variant: "outlined",
    color: "inherit",
    sx: {
      borderColor: "divider",
      color: "text.primary",
      "&:hover": {
        borderColor: "text.primary",
        backgroundColor: "action.hover",
      },
    },
  },
  ghost: {
    variant: "text",
    color: "inherit",
    sx: {
      color: "text.primary",
      "&:hover": {
        backgroundColor: "action.hover",
      },
    },
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", sx, ...props }, ref) => {
    const mapped = variantMap[variant];
    const baseSx = [sizeSx[size], mapped.sx];
    const mergedSx = (
      Array.isArray(sx) ? [...baseSx, ...sx] : [...baseSx, sx]
    ).filter(Boolean) as SxProps<Theme>;

    return (
      <MuiButton
        ref={ref}
        variant={mapped.variant}
        color={mapped.color}
        size={sizeMap[size]}
        sx={mergedSx}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
