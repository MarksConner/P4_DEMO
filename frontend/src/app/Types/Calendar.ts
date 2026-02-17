export interface CalendarEvent {
  id: string;
  date: string;   // Use "YYYY-MM-DD" format
  title: string;
}

export type TimelineStatus = "default" | "active" | "completed";

export interface DailyTimelineItem {
  id: string;
  startTime: string;
  endTime?: string;
  title: string;
  description?: string;
  status?: TimelineStatus;
}
