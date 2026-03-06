import type {
  CalendarEvent,
  DailyTimelineItem,
  TimelineStatus,
} from "../Types/Calendar";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // Keep for backward compatibility with older payloads.
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  username?: string;
}

export interface CreateUserResult {
  token?: string;
  user?: AuthUser;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateDayEventInput {
  title: string;
  startTime: string;
  endTime?: string;
  description?: string;
  status?: TimelineStatus;
}

export type UpdateDayEventInput = Partial<
  Pick<DailyTimelineItem, "title" | "startTime" | "endTime" | "description" | "status">
>;

export interface DaySchedulingHintsRequest {
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
}

export interface DayConflictHint {
  eventId: string;
  title: string;
  startTime: string;
  endTime?: string;
  overlapMinutes: number;
}

export interface DayAvailabilitySuggestion {
  startTime: string;
  endTime: string;
  label: string;
  inWorkingHours: boolean;
}

export interface DaySchedulingHints {
  hasConflict: boolean;
  inWorkingHours: boolean;
  workingHours: {
    startTime: string;
    endTime: string;
  };
  conflicts: DayConflictHint[];
  suggestions: DayAvailabilitySuggestion[];
}

export interface AppDataService {
  login(email: string, password: string): Promise<LoginResponse>;
  createUser(payload: CreateUserPayload): Promise<CreateUserResult>;
  // monthIndex follows JS Date semantics: 0 = Jan, 11 = Dec.
  fetchMonthEvents(year: number, monthIndex: number): Promise<CalendarEvent[]>;
  fetchDayTimeline(date: Date): Promise<DailyTimelineItem[]>;
  getDaySchedulingHints(
    date: Date,
    request: DaySchedulingHintsRequest
  ): Promise<DaySchedulingHints>;
  createDayEvent(date: Date, input: CreateDayEventInput): Promise<DailyTimelineItem>;
  updateDayEvent(
    date: Date,
    eventId: string,
    updates: UpdateDayEventInput
  ): Promise<DailyTimelineItem>;
  deleteDayEvent(date: Date, eventId: string): Promise<void>;
}
