export interface CalendarEvent {
  id: string;
  date: string;   // Use "YYYY-MM-DD" format
  title: string;
}
export interface DailyTimelineItem {
  id: string;
  startTime: string;   // "HH:MM" for now, later ISO
  endTime?: string;    // optional
  title: string;
  description?: string;
  status: "default" | "active" | "completed";
}