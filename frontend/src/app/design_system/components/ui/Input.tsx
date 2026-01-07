import { forwardRef } from "react";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

export interface InputProps
  extends Omit<TextFieldProps, "variant" | "helperText" | "error"> {
  helperText?: string;
  errorText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ helperText, errorText, ...props }, ref) => {
    const resolvedHelperText = errorText ?? helperText;

    return (
      <TextField
        {...props}
        error={Boolean(errorText)}
        helperText={resolvedHelperText}
        inputRef={ref}
      />
    );
  }
);

Input.displayName = "Input";
