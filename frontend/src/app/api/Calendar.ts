import type { CalendarEvent } from "../Types/Calendar";

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", date: "2025-03-03", title: "Project standup" },
  { id: "2", date: "2025-03-03", title: "Gym" },
  { id: "3", date: "2025-03-15", title: "Dentist appointment" },
  { id: "4", date: "2025-03-21", title: "CS 425 group meeting" },
  { id: "5", date: "2025-03-01", title: "Testy test"}
];

export async function fetchMonthEvents(
  year: number,
  month: number
): Promise<CalendarEvent[]> {
  await new Promise((r) => setTimeout(r, 300)); // fake latency for flow
  const targetMonth = month + 1;
  return MOCK_EVENTS.filter((event) => {
    const [eventYear, eventMonth] = event.date.split("-").map(Number);
    return eventYear === year && eventMonth === targetMonth;
  });
}
