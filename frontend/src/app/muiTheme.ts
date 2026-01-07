import { createTheme } from "@mui/material/styles";

const paletteColors = {
  bg: "#f3f4f6",
  surface: "#ffffff",
  text: "#0f172a",
  muted: "#6b7280",
  border: "#e5e7eb",
  primary: "#5a85e2",
  primaryForeground: "#ffffff",
  danger: "#ef4444",
};

export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: paletteColors.primary,
      contrastText: paletteColors.primaryForeground,
    },
    background: {
      default: paletteColors.bg,
      paper: paletteColors.surface,
    },
    text: {
      primary: paletteColors.text,
      secondary: paletteColors.muted,
    },
    error: {
      main: paletteColors.danger,
    },
    divider: paletteColors.border,
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
        fullWidth: true,
        InputLabelProps: { shrink: true },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: paletteColors.surface,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: paletteColors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: paletteColors.text,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: paletteColors.primary,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
          color: paletteColors.muted,
          "&.Mui-focused": {
            color: paletteColors.text,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          "&::placeholder": {
            color: paletteColors.muted,
            opacity: 1,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 1,
          fontSize: "0.75rem",
        },
      },
    },
  },
});
