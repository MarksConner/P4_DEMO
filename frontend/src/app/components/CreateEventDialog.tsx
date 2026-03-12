import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Button } from "../design_system/components/ui/Button";
import { Input } from "../design_system/components/ui/Input";
import { Modal } from "../design_system/components/ui/Modal";
import CalendarClient from "../api_client/CalendarClient";

type DialogMode = "event" | "calendar";

type CreateEventDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmitEvent?: (eventData: CreateEventFormData) => Promise<void> | void;
  onSubmitCalendar?: (calendarData: CreateCalendarFormData) => Promise<void> | void;
};

export type CreateEventFormData = {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  calendar_id: string;
};

export type CreateCalendarFormData = {
  name: string;
};

const defaultEventFormData: CreateEventFormData = {
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  location: "",
  calendar_id: ""
};

const defaultCalendarFormData: CreateCalendarFormData = {
  name: "",
};

export const CreateEventDialog = ({isOpen, onClose, onSubmitEvent,onSubmitCalendar,}: CreateEventDialogProps) => {
  const [mode, setMode] = useState<DialogMode>("event");
  const [eventFormData, setEventFormData] =useState<CreateEventFormData>(defaultEventFormData);
  const [calendarFormData, setCalendarFormData] =useState<CreateCalendarFormData>(defaultCalendarFormData);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");


  // replace with real calendars later
  useEffect(() => {
      if (isOpen) {
        const calendarOptionsClient = new CalendarClient();
        calendarOptionsClient.getCalendarsAPI().then((response) => {
          if (!response.ok) {
            console.error("Failed to fetch calendars");
            return;
          }
          response.json().then((data) => {
            console.log("Fetched calendars:", data);
            setCalendars(data);
            if(data.length > 0) {
              setSelectedCalendarId(data[0].calendar_id);
              setEventFormData((prev) => ({
                ...prev,
                calendar_id: data[0].calendar_id
              }));
            }
          }).catch((err) => {
            console.error("Failed to parse calendars response:", err);
          }
          );
        }
        ).catch((err) => {
          console.error("Error fetching calendars:", err);
        }
        );
      }
    }, [isOpen]);

  const calendarOptions = useMemo(
    () => [
      { id: "1", name: "My Calendar" },
      { id: "2", name: "Work" },
      { id: "3", name: "Personal" },
    ],
    []
  );

  const resetForm = () => {
    setMode("event");
    setEventFormData(defaultEventFormData);
    setCalendarFormData(defaultCalendarFormData);
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeChange = (_event: React.MouseEvent<HTMLElement>,newMode: DialogMode | null ) => {if (!newMode) return;
    setMode(newMode);
    setError(null);
  };

  const handleEventChange = (field: keyof CreateEventFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setEventFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    }
  
  const handleCalendarChange =
    (field: keyof CreateCalendarFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setCalendarFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const validateEventForm = () => {
    if (!eventFormData.title.trim()) return "Title is required.";
    if (!eventFormData.calendar_id) return "Calendar is required.";

    if (
      eventFormData.start_time &&
      eventFormData.end_time &&
      eventFormData.end_time < eventFormData.start_time
    ) {
      return "End time cannot be earlier than start time.";
    }

    return null;
  };

  const validateCalendarForm = () => {
    if (!calendarFormData.name.trim()) return "Calendar name is required.";
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = mode === "event" ? validateEventForm() : validateCalendarForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (mode === "event") {
        if (onSubmitEvent) {
          await onSubmitEvent(eventFormData);
        } else {
          console.log("Create event payload:", eventFormData);
        }
      } else {
        if (onSubmitCalendar) {
          await onSubmitCalendar(calendarFormData);

        } else {
          console.log("Create calendar payload:", calendarFormData);
        }
      }

      handleClose();
    } catch (err) {
      setError(
        mode === "event"
          ? "Could not create event."
          : "Could not create calendar."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "event" ? "Create event" : "Create calendar"}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-dialog-form" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "event"
                ? "Creating..."
                : "Creating..."
              : mode === "event"
              ? "Create Event"
              : "Create Calendar"}
          </Button>
        </>
      }
    >
      <Box component="form" id="create-dialog-form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              What would you like to create?
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              size="small"
            >
              <ToggleButton value="event">Event</ToggleButton>
              <ToggleButton value="calendar">Calendar</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {mode === "event" ? (
            <>
              <Typography variant="subtitle1" fontWeight={600}>
                Event details
              </Typography>

              <Input
                label="Title"
                placeholder="e.g., Team sync"
                value={eventFormData.title}
                onChange={handleEventChange("title")}
                required
              />

              <Input
                label="Description"
                placeholder="Add details about the event"
                value={eventFormData.description}
                onChange={handleEventChange("description")}
              />

              <Typography variant="subtitle1" fontWeight={600}>
                Schedule
              </Typography>
             

              { (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Input
                      label="Start time"
                      type="datetime-local"
                      value={eventFormData.start_time}
                      onChange={handleEventChange("start_time")}
                      required={!eventFormData.start_time && !eventFormData.end_time}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Input
                      label="End time"
                      type="datetime-local"
                      value={eventFormData.end_time}
                      onChange={handleEventChange("end_time")}
                      required={!eventFormData.start_time && !eventFormData.end_time}
                    />
                  </Box>
                </Stack>
              )}

              <Typography variant="subtitle1" fontWeight={600}>
                Organization
              </Typography>

              <Input
                label="Location"
                placeholder="e.g., Zoom / SEM building"
                value={eventFormData.location}
                onChange={handleEventChange("location")}
              />

              <Input
                label="Calendar"
                select
                value={eventFormData.calendar_id}
                onChange={handleEventChange("calendar_id")}
                required
              >
                <MenuItem value="" disabled>
                  Select a calendar
                </MenuItem>
                {calendars.map((calendar) => (
                  <MenuItem key={calendar.calendar_id} value={calendar.calendar_id}>
                    {calendar.calendar_name}
                  </MenuItem>
                ))}
              </Input>
            </>
          ) : (
            <>
              <Typography variant="subtitle1" fontWeight={600}>
                Calendar details
              </Typography>

              <Input
                label="Calendar name"
                placeholder="e.g., School, Work, Family"
                value={calendarFormData.name}
                onChange={handleCalendarChange("name")}
                required
              />
            </>
          )}

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};