import { createUser as mockCreateUser, login as mockLogin } from "../../api/Auth";
import { fetchMonthEvents as mockFetchMonthEvents } from "../../api/Calendar";
import {
  createDayTimelineItem as mockCreateDayTimelineItem,
  deleteDayTimelineItem as mockDeleteDayTimelineItem,
  fetchDayTimeline as mockFetchDayTimeline,
  getDaySchedulingHints as mockGetDaySchedulingHints,
  updateDayTimelineItem as mockUpdateDayTimelineItem,
} from "../../api/Today";
import type { AppDataService } from "../contracts";

export const mockDataService: AppDataService = {
  login(email, password) {
    return mockLogin(email, password);
  },
  createUser(payload) {
    return mockCreateUser(
      payload.email,
      payload.firstName,
      payload.lastName,
      payload.password
    );
  },
  fetchMonthEvents(year, monthIndex) {
    return mockFetchMonthEvents(year, monthIndex);
  },
  fetchDayTimeline(date) {
    return mockFetchDayTimeline(date);
  },
  getDaySchedulingHints(date, request) {
    return mockGetDaySchedulingHints(date, request);
  },
  createDayEvent(date, input) {
    return mockCreateDayTimelineItem(date, {
      title: input.title,
      startTime: input.startTime,
      endTime: input.endTime,
      description: input.description,
      status: input.status,
    });
  },
  updateDayEvent(date, eventId, updates) {
    return mockUpdateDayTimelineItem(date, eventId, updates);
  },
  deleteDayEvent(date, eventId) {
    return mockDeleteDayTimelineItem(date, eventId);
  },
};
