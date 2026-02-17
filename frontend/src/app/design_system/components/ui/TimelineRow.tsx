import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { BoxProps } from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

export type TimelineStatus = 'default' | 'active' | 'completed';

export interface TimelineRowProps extends Omit<BoxProps, "title"> {
  time: string;
  title: string;
  description?: string;
  status?: TimelineStatus;
}

export function TimelineRow({
  time,
  title,
  description,
  status = "default",
  sx,
  ...props
}: TimelineRowProps) {
  const statusColors: Record<TimelineStatus, string> = {
    default: "divider",
    active: "primary.main",
    completed: "success.main",
  };

  const rootSx: SxProps<Theme> = {
    display: "flex",
    gap: 2,
  };
  const mergedSx = (Array.isArray(sx) ? [rootSx, ...sx] : [rootSx, sx]).filter(
    Boolean
  ) as SxProps<Theme>;

  return (
    <Box {...props} sx={mergedSx}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: statusColors[status],
          }}
        />
        <Box sx={{ width: 1, flex: 1, bgcolor: "divider" }} />
      </Box>
      <Box sx={{ flex: 1, pb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
            {time}
          </Typography>
          <Box>
            <Typography variant="body2" color="text.primary">
              {title}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
