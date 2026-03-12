import { useNavigate } from "react-router-dom";
import { TimelineRow } from "../../design_system/components/ui/TimelineRow";
import {
  Card,
  CardHeader,
  CardContent,
} from "../../design_system/components/ui/Card";
import { Banner } from "../../design_system/components/ui/Banner";
import { Button } from "../../design_system/components/ui/Button";
import { Modal } from "../../design_system/components/ui/Modal";
import { Input } from "../../design_system/components/ui/Input";
import { useState, useEffect } from "react";
import type { DailyTimelineItem } from "../../Types/Calendar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCalendar } from "../../contexts/CalendarContext";
import CalendarClient from "../../api_client/CalendarClient";

export const TodaysPlanPage = () => {
  const navigate = useNavigate();
  const { selectedDate } = useCalendar();

  const [items, setItems] = useState<DailyTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [calendarClient] = useState(() => new CalendarClient());

  // Helper function to combine selected date with time input so that calendar API can work with add task modal simplified inputs
  const buildDateTimeFromSelectedDate = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);

    return combined;
  };

  const fetchTimeline = async () => {
    setIsLoading(true);
    setError(null);
    console.log("fetchTimeline running");
    console.log("calendar_id:", localStorage.getItem("calendar_id"));
    try {
      const calendar_id = localStorage.getItem("calendar_id");
      if (!calendar_id) {
        throw new Error("No calendar selected");
      }

      const dateString = selectedDate.toISOString().split("T")[0];

      const response = await calendarClient.getAllEventsinAdayAPI(
        calendar_id,
        dateString
      );
      

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();

      const timelineItems: DailyTimelineItem[] = data.map((event: any) => ({
        id: event.event_id,
        startTime: new Date(event.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        title: event.event_name,
        description: event.event_description || undefined,
        status: "default",
      }));

      setItems(
        timelineItems.sort((a, b) => a.startTime.localeCompare(b.startTime))
      );
    } catch (err) {
      setError("Could not load events for this day.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [selectedDate]);

  const dateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  const handleOpenAdd = () => {
    setNewTitle("");
    setNewTime("");
    setNewDescription("");
    setIsAddOpen(true);
  };

  const handleAddTask = async () => {
  if (!newTitle || !newTime) {
    return;
  }

  try {
    const calendar_id = localStorage.getItem("calendar_id");
    if (!calendar_id) {
      throw new Error("No calendar selected");
    }

    const startDateTime = buildDateTimeFromSelectedDate(selectedDate, newTime);

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);

    const response = await calendarClient.CreateEventAPI({
      calendar_id,
      title: newTitle,
      description: newDescription || "",
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: "",
    });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      setIsAddOpen(false);
      fetchTimeline();
    } catch (err) {
      setError("Could not create event.");
    }
  };
  return (
    <Stack spacing={2} sx={{ maxWidth: 672 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {isToday ? "Today" : dateLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isToday
              ? "A timeline of your day with AI-powered insights."
              : `Events scheduled for ${dateLabel}.`}
          </Typography>
        </Box>
        <Button size="sm" onClick={handleOpenAdd}>
          Add task
        </Button>
      </Box>

      <Banner
        variant="info"
        title="AI suggestion"
        message="If you leave by 10:35 AM, you’ll arrive on time for your team sync, accounting for traffic and buffer time."
      />

      <Card>
        <CardHeader>
          <Typography variant="h6" fontWeight={600}>
            Timeline
          </Typography>
        </CardHeader>
        <CardContent>
          <Stack spacing={1}>
            {isLoading && (
              <Typography variant="body2" color="text.secondary">
                Loading events…
              </Typography>
            )}
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
            {!isLoading && !error && items.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No events yet. Use &quot;Add task&quot; to start planning your day.
              </Typography>
            )}
            {!isLoading &&
              !error &&
              items.map((item) => (
                <ButtonBase
                  key={item.id}
                  type="button"
                  disableRipple
                  onClick={() => navigate(`/events/${item.id}`)}
                  sx={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    borderRadius: 1,
                  }}
                >
                  <TimelineRow
                    time={item.startTime}
                    title={item.title}
                    description={item.description}
                    status={item.status}
                  />
                </ButtonBase>
              ))}
          </Stack>
        </CardContent>
      </Card>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add task"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Save</Button>
          </>
        }
      >
        <Stack spacing={1.5}>
          <Input
            label="Title"
            placeholder="e.g., Deep work – ML project"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Input
            label="Time"
            placeholder="HH:MM (24h)"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
          <Input
            label="Description (optional)"
            placeholder="Short note about this task"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </Stack>
      </Modal>
    </Stack>
  );
};