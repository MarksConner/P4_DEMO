import type { DailyTimelineItem } from "../../Types/Calendar";

export const HOURS_IN_DAY = 24;
export const HOUR_ROW_HEIGHT = 64;
export const TIME_GUTTER_WIDTH = 72;
export const MIN_EVENT_HEIGHT = 28;
export const SNAP_MINUTES = 15;
export const DEFAULT_DURATION_MINUTES = 60;
export const MIN_DURATION_MINUTES = 15;

export type PositionedEvent = DailyTimelineItem & {
  startMinutes: number;
  endMinutes: number;
  column: number;
  columnCount: number;
};

export type EventTimeDraft = {
  startTime: string;
  endTime?: string;
};

export type InteractionMode = "move" | "resize";

export type EventInteractionState = {
  eventId: string;
  mode: InteractionMode;
  pointerStartY: number;
  initialStartMinutes: number;
  initialEndMinutes: number;
};

export const parseTimeToMinutes = (value: string): number | null => {
  const trimmed = value.trim();
  const match = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
};

export const minutesToTimeString = (value: number) => {
  const safeMinutes = Math.max(0, Math.min(HOURS_IN_DAY * 60 - 1, value));
  const hours = String(Math.floor(safeMinutes / 60)).padStart(2, "0");
  const minutes = String(safeMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const roundMinutesToStep = (value: number, step = SNAP_MINUTES) =>
  Math.round(value / step) * step;

export const formatHourLabel = (hour: number) =>
  new Date(1970, 0, 1, hour).toLocaleTimeString(undefined, {
    hour: "numeric",
  });

export const getCurrentMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const getEventTone = (status: DailyTimelineItem["status"]) => {
  if (status === "active") {
    return {
      bgcolor: "primary.light",
      borderColor: "primary.main",
    };
  }
  if (status === "completed") {
    return {
      bgcolor: "success.light",
      borderColor: "success.main",
    };
  }
  return {
    bgcolor: "action.selected",
    borderColor: "divider",
  };
};

export const buildPositionedEvents = (
  items: DailyTimelineItem[]
): PositionedEvent[] => {
  const normalized = items
    .map((item) => {
      const startMinutes = parseTimeToMinutes(item.startTime);
      if (startMinutes === null) {
        return null;
      }

      const parsedEnd = item.endTime ? parseTimeToMinutes(item.endTime) : null;
      const computedEnd =
        parsedEnd !== null && parsedEnd > startMinutes
          ? parsedEnd
          : Math.min(startMinutes + 60, HOURS_IN_DAY * 60);

      if (computedEnd <= startMinutes) {
        return null;
      }

      return {
        ...item,
        startMinutes,
        endMinutes: computedEnd,
      };
    })
    .filter(
      (item): item is Omit<PositionedEvent, "column" | "columnCount"> =>
        item !== null
    )
    .sort((a, b) => {
      if (a.startMinutes === b.startMinutes) {
        return a.endMinutes - b.endMinutes;
      }
      return a.startMinutes - b.startMinutes;
    });

  const positioned: PositionedEvent[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    let groupEnd = normalized[cursor].endMinutes;
    let groupStop = cursor + 1;

    while (
      groupStop < normalized.length &&
      normalized[groupStop].startMinutes < groupEnd
    ) {
      groupEnd = Math.max(groupEnd, normalized[groupStop].endMinutes);
      groupStop += 1;
    }

    const group = normalized.slice(cursor, groupStop);
    const columnEndMinutes: number[] = [];

    const groupWithColumns = group.map((item) => {
      let column = columnEndMinutes.findIndex(
        (endMinutes) => endMinutes <= item.startMinutes
      );
      if (column === -1) {
        column = columnEndMinutes.length;
      }
      columnEndMinutes[column] = item.endMinutes;

      return {
        ...item,
        column,
      };
    });

    const columnCount = Math.max(1, columnEndMinutes.length);
    groupWithColumns.forEach((item) => {
      positioned.push({
        ...item,
        columnCount,
      });
    });

    cursor = groupStop;
  }

  return positioned;
};
