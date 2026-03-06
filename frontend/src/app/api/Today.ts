import type { DailyTimelineItem } from "../Types/Calendar";
import type {
  DayAvailabilitySuggestion,
  DayConflictHint,
  DaySchedulingHints,
  DaySchedulingHintsRequest,
} from "../services/contracts";

const MOCK_TODAY_ITEMS: DailyTimelineItem[] = [
  {
    id: "t1",
    startTime: "09:00",
    endTime: "10:00",
    title: "Deep work – OS project",
    description: "Finish memory management section.",
    status: "completed",
  },
  {
    id: "t2",
    startTime: "11:00",
    endTime: "12:00",
    title: "Team sync – AI Calendar",
    description: "Review UI progress and next steps.",
    status: "active",
  },
  {
    id: "t3",
    startTime: "14:00",
    endTime: "15:00",
    title: "Study block – SVMs",
    status: "default",
  },
];

const STORAGE_KEY = "aicalendar.mock.dayTimeline.v1";
const NETWORK_DELAY_MS = 250;

type TimelineStore = Record<string, DailyTimelineItem[]>;

let memoryStore: TimelineStore | null = null;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const DAY_MINUTES = 24 * 60;
const DEFAULT_DURATION_MINUTES = 60;
const MIN_DURATION_MINUTES = 15;
const TIME_STEP_MINUTES = 15;
const WORKING_HOURS_START = 8 * 60;
const WORKING_HOURS_END = 18 * 60;

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseTimeToMinutes = (value: string): number | null => {
  const trimmed = value.trim();
  const match = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
};

const minutesToTimeString = (value: number) => {
  const safeMinutes = Math.max(0, Math.min(DAY_MINUTES - 1, value));
  const hours = String(Math.floor(safeMinutes / 60)).padStart(2, "0");
  const minutes = String(safeMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const normalizeDuration = (
  request: DaySchedulingHintsRequest,
  startMinutes: number
) => {
  const explicitEnd = request.endTime ? parseTimeToMinutes(request.endTime) : null;
  if (explicitEnd !== null && explicitEnd > startMinutes) {
    return Math.max(MIN_DURATION_MINUTES, explicitEnd - startMinutes);
  }
  if (request.durationMinutes && request.durationMinutes > 0) {
    return Math.max(MIN_DURATION_MINUTES, request.durationMinutes);
  }
  return DEFAULT_DURATION_MINUTES;
};

type BusyInterval = {
  start: number;
  end: number;
  item: DailyTimelineItem;
};

const buildBusyIntervals = (items: DailyTimelineItem[]): BusyInterval[] =>
  items
    .map((item) => {
      const start = parseTimeToMinutes(item.startTime);
      if (start === null) {
        return null;
      }

      const parsedEnd = item.endTime ? parseTimeToMinutes(item.endTime) : null;
      const end = parsedEnd !== null && parsedEnd > start
        ? parsedEnd
        : Math.min(start + DEFAULT_DURATION_MINUTES, DAY_MINUTES);
      if (end <= start) {
        return null;
      }

      return { start, end, item };
    })
    .filter((interval): interval is BusyInterval => interval !== null);

const hasConflict = (start: number, end: number, busy: BusyInterval[]) =>
  busy.some((interval) => start < interval.end && interval.start < end);

const buildConflictHints = (
  start: number,
  end: number,
  busy: BusyInterval[]
): DayConflictHint[] =>
  busy
    .filter((interval) => start < interval.end && interval.start < end)
    .map((interval) => ({
      eventId: interval.item.id,
      title: interval.item.title,
      startTime: interval.item.startTime,
      endTime: interval.item.endTime,
      overlapMinutes: Math.max(
        0,
        Math.min(end, interval.end) - Math.max(start, interval.start)
      ),
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

const slotInWorkingHours = (start: number, end: number) =>
  start >= WORKING_HOURS_START && end <= WORKING_HOURS_END;

const buildCandidateStarts = (startMinutes: number) => {
  const deltas: number[] = [0];
  for (let step = TIME_STEP_MINUTES; step <= 12 * 60; step += TIME_STEP_MINUTES) {
    deltas.push(step, -step);
  }

  const seen = new Set<number>();
  const candidates: number[] = [];
  deltas.forEach((delta) => {
    const next = startMinutes + delta;
    if (next < 0 || next >= DAY_MINUTES || seen.has(next)) {
      return;
    }
    seen.add(next);
    candidates.push(next);
  });
  return candidates;
};

const buildSuggestionLabel = (deltaMinutes: number) => {
  if (deltaMinutes === 0) {
    return "Requested slot";
  }
  if (deltaMinutes > 0) {
    return `${deltaMinutes} min later`;
  }
  return `${Math.abs(deltaMinutes)} min earlier`;
};

const buildAvailabilitySuggestions = (
  requestedStart: number,
  durationMinutes: number,
  busy: BusyInterval[]
): DayAvailabilitySuggestion[] => {
  const suggestions: DayAvailabilitySuggestion[] = [];
  const added = new Set<string>();

  const candidates = buildCandidateStarts(requestedStart);
  for (const candidateStart of candidates) {
    const roundedStart =
      Math.round(candidateStart / TIME_STEP_MINUTES) * TIME_STEP_MINUTES;
    const start = Math.max(0, roundedStart);
    const end = start + durationMinutes;
    if (end > DAY_MINUTES) {
      continue;
    }
    if (hasConflict(start, end, busy)) {
      continue;
    }

    const key = `${start}-${end}`;
    if (added.has(key)) {
      continue;
    }
    added.add(key);

    suggestions.push({
      startTime: minutesToTimeString(start),
      endTime: minutesToTimeString(end),
      label: buildSuggestionLabel(start - requestedStart),
      inWorkingHours: slotInWorkingHours(start, end),
    });

    if (suggestions.length >= 4) {
      break;
    }
  }

  return suggestions;
};

const cloneItems = (items: DailyTimelineItem[]) =>
  items.map((item) => ({ ...item }));

const readStoredValue = (): TimelineStore => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as TimelineStore;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
};

const persistStore = (store: TimelineStore) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore persistence issues in mock mode
  }
};

const ensureStore = () => {
  if (memoryStore) {
    return memoryStore;
  }

  memoryStore = readStoredValue();
  return memoryStore;
};

const ensureDateItems = (store: TimelineStore, date: Date) => {
  const key = toDateKey(date);
  if (!store[key]) {
    store[key] = cloneItems(MOCK_TODAY_ITEMS);
    persistStore(store);
  }
  return { key, items: store[key] };
};

export async function fetchDayTimeline(date: Date): Promise<DailyTimelineItem[]> {
  await wait(NETWORK_DELAY_MS);
  const store = ensureStore();
  const { items } = ensureDateItems(store, date);
  return cloneItems(items);
}

export async function createDayTimelineItem(
  date: Date,
  input: Omit<DailyTimelineItem, "id">
): Promise<DailyTimelineItem> {
  await wait(NETWORK_DELAY_MS);
  const store = ensureStore();
  const { key, items } = ensureDateItems(store, date);

  const createdItem: DailyTimelineItem = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
  };

  store[key] = [...items, createdItem];
  persistStore(store);
  return { ...createdItem };
}

export async function updateDayTimelineItem(
  date: Date,
  eventId: string,
  updates: Partial<DailyTimelineItem>
): Promise<DailyTimelineItem> {
  await wait(NETWORK_DELAY_MS);
  const store = ensureStore();
  const { key, items } = ensureDateItems(store, date);

  const index = items.findIndex((item) => item.id === eventId);
  if (index === -1) {
    throw new Error("Event not found.");
  }

  const updated = {
    ...items[index],
    ...updates,
    id: items[index].id,
  };
  const next = [...items];
  next[index] = updated;
  store[key] = next;
  persistStore(store);
  return { ...updated };
}

export async function deleteDayTimelineItem(
  date: Date,
  eventId: string
): Promise<void> {
  await wait(NETWORK_DELAY_MS);
  const store = ensureStore();
  const { key, items } = ensureDateItems(store, date);
  store[key] = items.filter((item) => item.id !== eventId);
  persistStore(store);
}

export async function getDaySchedulingHints(
  date: Date,
  request: DaySchedulingHintsRequest
): Promise<DaySchedulingHints> {
  await wait(NETWORK_DELAY_MS);
  const store = ensureStore();
  const { items } = ensureDateItems(store, date);

  const startMinutes = parseTimeToMinutes(request.startTime);
  if (startMinutes === null) {
    throw new Error("Time must use HH:MM (24h).");
  }

  const durationMinutes = normalizeDuration(request, startMinutes);
  const endMinutes = Math.min(DAY_MINUTES, startMinutes + durationMinutes);
  const busyIntervals = buildBusyIntervals(items);
  const conflicts = buildConflictHints(startMinutes, endMinutes, busyIntervals);
  const suggestions = buildAvailabilitySuggestions(
    startMinutes,
    durationMinutes,
    busyIntervals
  );

  return {
    hasConflict: conflicts.length > 0,
    inWorkingHours: slotInWorkingHours(startMinutes, endMinutes),
    workingHours: {
      startTime: minutesToTimeString(WORKING_HOURS_START),
      endTime: minutesToTimeString(WORKING_HOURS_END),
    },
    conflicts,
    suggestions,
  };
}
