import type { CreateEventFormData } from "../components/CreateEventDialog";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

type RequestOptions = {
  method: "GET" | "POST";
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
};

export default class CalendarClient {
    base_url: string;
    
    constructor() {
        if (!BASE_API_URL) throw new Error("VITE_BASE_API_URL is not defined");
        this.base_url = `${BASE_API_URL}`;
    }

    async request(options: RequestOptions): Promise<Response> {
        const token = localStorage.getItem("access_token");
        return fetch(this.base_url + options.url, {
            method: options.method,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {}),
            },
            body: options.body ? JSON.stringify(options.body) : null,
        });
    }

    async createCalendarAPI(calendar_name: string, date_start?: string, date_end?: string): Promise<Response> {
        return this.request({
            method: "POST",
            url: "/calendar/create",
            body: {user_id: localStorage.getItem("user_id"), calendar_name, date_start, date_end },
        });
    }

    async createCalendarICSAPI(calendarName: string, icsFile: File): Promise<Response> {
        const token = localStorage.getItem("access_token");
        const formData = new FormData();
        formData.append("calendarName", calendarName);
        formData.append("icsFile", icsFile);
        return fetch(this.base_url + "/calendar/import-ics", {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });
    }

    async getCalendarsAPI(): Promise<Response> {
        return this.request({
            method: "GET",
            url: "/calendar",
        });
    }

    async CreateEventAPI(eventData: CreateEventFormData): Promise<Response> {
        return this.request({
            method: "POST",
            url: "/events/create",
            body: {
            calendar_id: eventData.calendar_id,
            event_name: eventData.title,
            start_time: eventData.start_time,
            end_time: eventData.end_time || null,
            event_description: eventData.description || null,
            full_address: eventData.location || null,
            priority_rank: 0,
            },
        });
    }
    
    async getEventsAPI(date: string): Promise<Response> {
        return this.request({
            method: "GET",
            url: `/events?date=${date}`,
        });
    }
    
}