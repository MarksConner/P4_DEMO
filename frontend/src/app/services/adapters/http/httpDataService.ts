import type {
  CalendarEvent,
  DailyTimelineItem,
  TimelineStatus,
} from "../../../Types/Calendar";
import type {
  AppDataService,
  CreateDayEventInput,
  CreateUserPayload,
  CreateUserResult,
  DaySchedulingHints,
  DaySchedulingHintsRequest,
  LoginResponse,
  UpdateDayEventInput,
} from "../../contracts";
import { requestJson } from "./httpClient";

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type SnakeCaseAuthUser = {
  id?: string;
  user_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
};

type RawLoginResponse = {
  token?: string;
  access_token?: string;
  user?: SnakeCaseAuthUser;
  user_id?: string;
  user_name?: string;
  email?: string;
  message?: string;
};

type RawDayEvent = {
  id?: string;
  title?: string;
  event_name?: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  description?: string;
  status?: TimelineStatus;
  priority?: number;
};

const toTimelineStatus = (status: TimelineStatus | undefined, priority: number | undefined) => {
  if (status === "default" || status === "active" || status === "completed") {
    return status;
  }

  if (priority === 1) {
    return "active";
  }
  if (priority === 2) {
    return "completed";
  }
  return "default";
};

const statusToPriority = (status: TimelineStatus | undefined) => {
  if (status === "active") {
    return 1;
  }
  if (status === "completed") {
    return 2;
  }
  return 0;
};

const buildEventPayload = (input: CreateDayEventInput, date: string) => ({
  date,
  event_name: input.title,
  title: input.title,
  start_time: input.startTime,
  startTime: input.startTime,
  end_time: input.endTime,
  endTime: input.endTime,
  description: input.description,
  status: input.status,
  priority: statusToPriority(input.status),
});

const buildEventPatchPayload = (date: string, updates: UpdateDayEventInput) => ({
  date,
  ...(updates.title ? { event_name: updates.title, title: updates.title } : {}),
  ...(updates.startTime ? { start_time: updates.startTime, startTime: updates.startTime } : {}),
  ...(updates.endTime ? { end_time: updates.endTime, endTime: updates.endTime } : {}),
  ...(updates.description ? { description: updates.description } : {}),
  ...(updates.status ? { status: updates.status, priority: statusToPriority(updates.status) } : {}),
});

const normalizeAuthResponse = (raw: RawLoginResponse): LoginResponse => {
  const token = raw.token ?? raw.access_token;
  const resolvedUser = raw.user ?? {};

  if (!token) {
    throw new Error(raw.message ?? "Missing token in login response.");
  }

  return {
    token,
    user: {
      id: raw.user_id ?? resolvedUser.id ?? "",
      email: raw.email ?? resolvedUser.email ?? "",
      firstName: resolvedUser.first_name ?? resolvedUser.firstName,
      lastName: resolvedUser.last_name ?? resolvedUser.lastName,
      name: raw.user_name,
    },
  };
};

const normalizeTimelineItem = (raw: RawDayEvent): DailyTimelineItem => {
  if (!raw.id) {
    throw new Error("Missing event id from timeline response.");
  }

  const title = raw.title ?? raw.event_name;
  const startTime = raw.startTime ?? raw.start_time;

  if (!title || !startTime) {
    throw new Error("Invalid timeline item received from server.");
  }

  return {
    id: raw.id,
    title,
    startTime,
    endTime: raw.endTime ?? raw.end_time,
    description: raw.description,
    status: toTimelineStatus(raw.status, raw.priority),
  };
};

const normalizeUserCreateResponse = (raw: unknown): CreateUserResult => {
  if (raw && typeof raw === "object") {
    if ("user" in raw && raw.user && typeof raw.user === "object") {
      const user = raw.user as Record<string, unknown>;
      return {
        ...(raw as Record<string, unknown>),
        user: {
          id: (user.id as string) ?? (user.user_id as string) ?? "",
          email: (user.email as string) ?? "",
          firstName: (user.first_name as string) ?? (user.firstName as string),
          lastName: (user.last_name as string) ?? (user.lastName as string),
        },
      };
    }

    if (
      "id" in raw &&
      typeof raw === "object" &&
      raw !== null &&
      "email" in raw &&
      "firstName" in raw
    ) {
      const source = raw as Record<string, unknown>;
      return {
        id: source.id as string,
        email: source.email as string,
        firstName: source.firstName as string,
        lastName: source.lastName as string,
      };
    }
  }

  return {};
};

export const httpDataService: AppDataService = {
  login(email, password) {
    return requestJson<RawLoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    }).then(normalizeAuthResponse);
  },
  createUser(payload: CreateUserPayload) {
    return requestJson<unknown>("/users", {
      method: "POST",
      body: {
        email: payload.email,
        username: payload.username,
        first_name: payload.firstName,
        last_name: payload.lastName,
        password: payload.password,
      },
    }).then(normalizeUserCreateResponse);
  },
  fetchMonthEvents(year, monthIndex) {
    return requestJson<CalendarEvent[]>("/calendar/events", {
      query: {
        year,
        monthIndex,
        // Included for backends that prefer 1-based month values.
        month: monthIndex + 1,
      },
    });
  },
  fetchDayTimeline(date) {
    return requestJson<RawDayEvent[]>("/calendar/day-timeline", {
      query: { date: toDateKey(date) },
    }).then((events) => events.map(normalizeTimelineItem));
  },
  getDaySchedulingHints(date, request: DaySchedulingHintsRequest) {
    return requestJson<DaySchedulingHints>("/calendar/day-hints", {
      query: {
        date: toDateKey(date),
        startTime: request.startTime,
        endTime: request.endTime,
        durationMinutes: request.durationMinutes,
      },
    });
  },
  createDayEvent(date, input: CreateDayEventInput) {
    return requestJson<RawDayEvent>("/calendar/day-events", {
      method: "POST",
      body: buildEventPayload(input, toDateKey(date)),
    }).then(normalizeTimelineItem);
  },
  updateDayEvent(date, eventId, updates: UpdateDayEventInput) {
    return requestJson<RawDayEvent>(`/calendar/day-events/${eventId}`, {
      method: "PATCH",
      body: buildEventPatchPayload(toDateKey(date), updates),
    }).then(normalizeTimelineItem);
  },
  deleteDayEvent(date, eventId) {
    return requestJson<void>(`/calendar/day-events/${eventId}`, {
      method: "DELETE",
      query: {
        date: toDateKey(date),
      },
    });
  },
};
