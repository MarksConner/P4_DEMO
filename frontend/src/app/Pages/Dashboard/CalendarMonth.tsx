import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

export interface CalendarEvent {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
}

interface CalendarMonthProps {
  year: number;
  month: number; // 0 = Jan, 11 = Dec
  events?: CalendarEvent[];
}

export function CalendarMonth({ year, month, events = [] }: CalendarMonthProps) {
  const today = new Date();
  const isTodayMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    const inCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

    let dateKey: string | null = null;
    if (inCurrentMonth) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(dayNumber).padStart(2, "0");
      dateKey = `${year}-${mm}-${dd}`;
    }

    const dayEvents =
      dateKey === null
        ? []
        : events.filter((evt) => evt.date === dateKey).slice(0, 3);

    const isToday =
      inCurrentMonth &&
      isTodayMonth &&
      today.getDate() === dayNumber;

    return {
      index,
      dayNumber: inCurrentMonth ? dayNumber : null,
      inCurrentMonth,
      isToday,
      events: dayEvents,
    };
  });

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1.5,
        p: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
          {monthLabel}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          fontSize: "0.6875rem",
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        {dayNames.map((name) => (
          <Box key={name} sx={{ textAlign: "center", py: 0.25 }}>
            {name}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 0.5,
        }}
      >
        {cells.map((cell) => {
          const cellSx: SxProps<Theme> = {
            minHeight: 72,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 0.75,
            py: 0.5,
            fontSize: "0.6875rem",
            display: "flex",
            flexDirection: "column",
          };
          const outsideSx: SxProps<Theme> = cell.inCurrentMonth
            ? {}
            : { bgcolor: "grey.50", color: "text.secondary" };
          const todaySx: SxProps<Theme> = cell.isToday
            ? {
                borderColor: "primary.main",
                boxShadow: (theme) =>
                  `0 0 0 1px ${theme.palette.primary.main}`,
              }
            : {};
          const mergedSx = [cellSx, outsideSx, todaySx];

          return (
            <Box key={cell.index} sx={mergedSx}>
              {cell.dayNumber !== null && (
                <>
                  <Box sx={{ fontWeight: 600, mb: 0.25 }}>
                    {cell.dayNumber}
                  </Box>
                  <Box sx={{ mt: 0.25 }}>
                    {cell.events.map((evt) => (
                      <Box
                        key={evt.id}
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "text.secondary",
                        }}
                        title={evt.title}
                      >
                        • {evt.title}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
