import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { DailyTimelineItem } from "../../Types/Calendar";
import { dataService } from "../../services";
import type { DaySchedulingHints } from "../../services";
import type { CalendarView } from "../../contexts/calendarState";
import {
  buildPositionedEvents,
  DEFAULT_DURATION_MINUTES,
  getCurrentMinutes,
  HOUR_ROW_HEIGHT,
  HOURS_IN_DAY,
  MIN_DURATION_MINUTES,
  minutesToTimeString,
  parseTimeToMinutes,
  roundMinutesToStep,
} from "./dayPlannerUtils";
import type {
  EventInteractionState,
  EventTimeDraft,
  InteractionMode,
  PositionedEvent,
} from "./dayPlannerUtils";

type UseDayPlannerArgs = {
  selectedDate: Date;
  selectedView: CalendarView;
};

const sortItemsByStartTime = (items: DailyTimelineItem[]) =>
  [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));

export function useDayPlanner({ selectedDate, selectedView }: UseDayPlannerArgs) {
  const [items, setItems] = useState<DailyTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addTaskError, setAddTaskError] = useState<string | null>(null);
  const [hintError, setHintError] = useState<string | null>(null);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isLoadingHints, setIsLoadingHints] = useState(false);
  // Controls whether event detail dialog is visible.
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  // Stores the selected event id for the details dialog.
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  // Detail popup editing mode and form buffers.
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [eventEditError, setEventEditError] = useState<string | null>(null);
  const [schedulingHints, setSchedulingHints] =
    useState<DaySchedulingHints | null>(null);
  const [nowMinutes, setNowMinutes] = useState(() => getCurrentMinutes());
  const [eventTimeDrafts, setEventTimeDrafts] = useState<
    Record<string, EventTimeDraft>
  >({});
  const [interactionState, setInteractionState] =
    useState<EventInteractionState | null>(null);
  const [savingEventIds, setSavingEventIds] = useState<string[]>([]);
  const dayGridScrollRef = useRef<HTMLDivElement | null>(null);
  const eventTimeDraftsRef = useRef<Record<string, EventTimeDraft>>({});
  // Avoid opening event details when the click is actually a drag/resize interaction.
  const suppressOpenRef = useRef(false);
  const selectedDateKeyRef = useRef(selectedDate.toDateString());

  const dateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  useEffect(() => {
    eventTimeDraftsRef.current = eventTimeDrafts;
  }, [eventTimeDrafts]);

  useEffect(() => {
    selectedDateKeyRef.current = selectedDate.toDateString();
  }, [selectedDate]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    dataService
      .fetchDayTimeline(selectedDate)
      .then((data) => {
        setItems(data);
        setIsLoading(false);
        setPersistError(null);
      })
      .catch(() => {
        setError("Could not load events for this day.");
        setIsLoading(false);
      });
  }, [selectedDate]);

  useEffect(() => {
    setInteractionState(null);
    setEventTimeDrafts({});
    setSavingEventIds([]);
  }, [selectedDate]);

  useEffect(() => {
    if (!isAddOpen) {
      setIsLoadingHints(false);
      setHintError(null);
      setSchedulingHints(null);
      return;
    }

    const parsedStart = parseTimeToMinutes(newTime);
    if (parsedStart === null) {
      setIsLoadingHints(false);
      setHintError(null);
      setSchedulingHints(null);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setIsLoadingHints(true);
      setHintError(null);
      dataService
        .getDaySchedulingHints(selectedDate, {
          startTime: minutesToTimeString(parsedStart),
          durationMinutes: DEFAULT_DURATION_MINUTES,
        })
        .then((hints) => {
          if (cancelled) {
            return;
          }
          setSchedulingHints(hints);
          setIsLoadingHints(false);
        })
        .catch(() => {
          if (cancelled) {
            return;
          }
          setHintError("Could not load availability hints.");
          setSchedulingHints(null);
          setIsLoadingHints(false);
        });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isAddOpen, newTime, selectedDate]);

  const itemsWithDrafts = useMemo(
    () =>
      items.map((item) => {
        const draft = eventTimeDrafts[item.id];
        if (!draft) {
          return item;
        }
        return {
          ...item,
          startTime: draft.startTime,
          endTime: draft.endTime,
        };
      }),
    [items, eventTimeDrafts]
  );

  const positionedItems = useMemo(
    () => buildPositionedEvents(itemsWithDrafts),
    [itemsWithDrafts]
  );

  // Keep a direct object reference for the selected event to render the dialog quickly.
  const selectedEvent = useMemo(
    () =>
      selectedEventId
        ? items.find((item) => item.id === selectedEventId) ?? null
        : null,
    [items, selectedEventId]
  );

  const isSelectedEventSaving = selectedEventId
    ? savingEventIds.includes(selectedEventId)
    : false;

  const hours = useMemo(
    () => Array.from({ length: HOURS_IN_DAY }, (_, hour) => hour),
    []
  );

  useEffect(() => {
    if (!isToday || selectedView !== "day") {
      return;
    }

    setNowMinutes(getCurrentMinutes());
    const intervalId = window.setInterval(() => {
      setNowMinutes(getCurrentMinutes());
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [isToday, selectedView]);

  useEffect(() => {
    if (!isToday || selectedView !== "day") {
      return;
    }

    const container = dayGridScrollRef.current;
    if (!container) {
      return;
    }

    const targetTop =
      (getCurrentMinutes() / 60) * HOUR_ROW_HEIGHT - container.clientHeight * 0.35;
    container.scrollTop = Math.max(0, targetTop);
  }, [selectedDate, isToday, isLoading, selectedView]);

  const persistDayEventTimeChange = useCallback(
    async (eventId: string, draft: EventTimeDraft | undefined) => {
      if (!draft) {
        return;
      }

      const current = items.find((item) => item.id === eventId);
      if (!current) {
        return;
      }

      const unchanged =
        current.startTime === draft.startTime &&
        (current.endTime ?? "") === (draft.endTime ?? "");
      if (unchanged) {
        return;
      }

      const previousItems = items;
      const targetDate = new Date(selectedDate);
      const targetDateKey = targetDate.toDateString();
      const optimisticItems = previousItems.map((item) =>
        item.id === eventId
          ? { ...item, startTime: draft.startTime, endTime: draft.endTime }
          : item
      );

      setItems(optimisticItems);
      setPersistError(null);
      setSavingEventIds((prev) =>
        prev.includes(eventId) ? prev : [...prev, eventId]
      );

      try {
        await dataService.updateDayEvent(targetDate, eventId, {
          startTime: draft.startTime,
          endTime: draft.endTime,
        });
        const refreshed = await dataService.fetchDayTimeline(targetDate);
        if (selectedDateKeyRef.current === targetDateKey) {
          setItems(sortItemsByStartTime(refreshed));
        }
      } catch {
        if (selectedDateKeyRef.current === targetDateKey) {
          setItems(previousItems);
          setPersistError("Could not save the event time change.");
        }
      } finally {
        setSavingEventIds((prev) => prev.filter((id) => id !== eventId));
      }
    },
    [items, selectedDate]
  );

  const startEventInteraction = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      item: PositionedEvent,
      mode: InteractionMode
    ) => {
      if (selectedView !== "day" || savingEventIds.includes(item.id)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setPersistError(null);
      // Prevent opening the modal from the same pointer gesture.
      suppressOpenRef.current = true;

      setInteractionState({
        eventId: item.id,
        mode,
        pointerStartY: event.clientY,
        initialStartMinutes: item.startMinutes,
        initialEndMinutes: item.endMinutes,
      });
    },
    [selectedView, savingEventIds]
  );

  useEffect(() => {
    if (!interactionState) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const deltaMinutes = roundMinutesToStep(
        ((event.clientY - interactionState.pointerStartY) / HOUR_ROW_HEIGHT) * 60
      );
      const maxMinutes = HOURS_IN_DAY * 60;

      let nextStart = interactionState.initialStartMinutes;
      let nextEnd = interactionState.initialEndMinutes;

      if (interactionState.mode === "move") {
        const duration = Math.max(
          MIN_DURATION_MINUTES,
          interactionState.initialEndMinutes - interactionState.initialStartMinutes
        );
        const movedStart = interactionState.initialStartMinutes + deltaMinutes;
        nextStart = Math.max(0, Math.min(movedStart, maxMinutes - duration));
        nextEnd = nextStart + duration;
      } else {
        const resizedEnd = interactionState.initialEndMinutes + deltaMinutes;
        const minEnd = interactionState.initialStartMinutes + MIN_DURATION_MINUTES;
        nextEnd = Math.max(minEnd, Math.min(resizedEnd, maxMinutes));
      }

      const nextDraft: EventTimeDraft = {
        startTime: minutesToTimeString(nextStart),
        endTime: minutesToTimeString(nextEnd),
      };

      setEventTimeDrafts((prev) => {
        const existing = prev[interactionState.eventId];
        if (
          existing &&
          existing.startTime === nextDraft.startTime &&
          existing.endTime === nextDraft.endTime
        ) {
          return prev;
        }
        return {
          ...prev,
          [interactionState.eventId]: nextDraft,
        };
      });
    };

    const finishInteraction = () => {
      const draft = eventTimeDraftsRef.current[interactionState.eventId];
      setInteractionState(null);
      setEventTimeDrafts((prev) => {
        const next = { ...prev };
        delete next[interactionState.eventId];
        return next;
      });
      void persistDayEventTimeChange(interactionState.eventId, draft);
      // Keep interaction suppression active briefly so click doesn't re-open details.
      window.setTimeout(() => {
        suppressOpenRef.current = false;
      }, 80);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishInteraction);
    window.addEventListener("pointercancel", finishInteraction);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishInteraction);
      window.removeEventListener("pointercancel", finishInteraction);
    };
  }, [interactionState, persistDayEventTimeChange]);

  const handleOpenAdd = () => {
    setNewTitle("");
    setNewTime("");
    setNewDescription("");
    setAddTaskError(null);
    setHintError(null);
    setSchedulingHints(null);
    setPersistError(null);
    setIsAddOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddOpen(false);
  };

  const handleOpenEventDetails = (eventId: string) => {
    // Ignore if this was a drag/resize gesture ending on the same event.
    if (suppressOpenRef.current) {
      return;
    }

    const eventToOpen = items.find((item) => item.id === eventId);
    if (!eventToOpen) {
      return;
    }

    setEditTitle(eventToOpen.title);
    setEditStartTime(eventToOpen.startTime);
    setEditEndTime(eventToOpen.endTime ?? "");
    setEditDescription(eventToOpen.description ?? "");
    // Start in read-only mode with one form copy of values ready for edits.
    setIsEditingEvent(false);
    setEventEditError(null);
    setSelectedEventId(eventId);
    setIsEventDetailsOpen(true);
  };

  const handleCloseEventDetails = () => {
    setIsEventDetailsOpen(false);
    // Clear selected id so stale data doesn't linger.
    setIsEditingEvent(false);
    setEventEditError(null);
    setSelectedEventId(null);
  };

  const handleStartEventEdit = () => {
    if (!selectedEvent) {
      return;
    }

    setEditTitle(selectedEvent.title);
    setEditStartTime(selectedEvent.startTime);
    setEditEndTime(selectedEvent.endTime ?? "");
    setEditDescription(selectedEvent.description ?? "");
    // Switch to editable state and keep the current values as the baseline.
    setEventEditError(null);
    setIsEditingEvent(true);
  };

  const handleCancelEventEdit = () => {
    if (selectedEvent) {
      setEditTitle(selectedEvent.title);
      setEditStartTime(selectedEvent.startTime);
      setEditEndTime(selectedEvent.endTime ?? "");
      setEditDescription(selectedEvent.description ?? "");
    }

    setEventEditError(null);
    setIsEditingEvent(false);
  };

  const handleSaveEventEdit = async () => {
    if (!selectedEvent) {
      return;
    }

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setEventEditError("Title is required.");
      return;
    }

    const startMinutes = parseTimeToMinutes(editStartTime.trim());
    if (startMinutes === null) {
      setEventEditError("Start time must use HH:MM (24h), for example 14:30.");
      return;
    }

    const normalizedStartTime = minutesToTimeString(startMinutes);
    const endInput = editEndTime.trim();
    let normalizedEndTime: string | undefined;

    if (endInput !== "") {
      const endMinutes = parseTimeToMinutes(endInput);
      if (endMinutes === null) {
        setEventEditError("End time must use HH:MM (24h), for example 14:30.");
        return;
      }
      if (endMinutes <= startMinutes) {
        setEventEditError("End time must be after start time.");
        return;
      }
      normalizedEndTime = minutesToTimeString(endMinutes);
    }

    const normalizedDescription = editDescription.trim() || undefined;
    // Quick check so we don't call the API when nothing changed.
    const unchanged =
      selectedEvent.title === trimmedTitle &&
      selectedEvent.startTime === normalizedStartTime &&
      (selectedEvent.endTime ?? "") === (normalizedEndTime ?? "") &&
      (selectedEvent.description ?? "") === (normalizedDescription ?? "");

    if (unchanged) {
      setIsEditingEvent(false);
      return;
    }

    const previousItems = items;
    const targetDate = new Date(selectedDate);
    const targetDateKey = targetDate.toDateString();
    const optimisticItems = previousItems.map((item) =>
      item.id === selectedEvent.id
        ? {
            ...item,
            title: trimmedTitle,
            startTime: normalizedStartTime,
            endTime: normalizedEndTime,
            description: normalizedDescription,
          }
        : item
    );

    setItems(sortItemsByStartTime(optimisticItems));
    setPersistError(null);
    setEventEditError(null);
    setSavingEventIds((prev) =>
      prev.includes(selectedEvent.id) ? prev : [...prev, selectedEvent.id]
    );

    try {
      await dataService.updateDayEvent(targetDate, selectedEvent.id, {
        title: trimmedTitle,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
        description: normalizedDescription,
      });
      const refreshed = await dataService.fetchDayTimeline(targetDate);
      if (selectedDateKeyRef.current === targetDateKey) {
        setItems(sortItemsByStartTime(refreshed));
      }
      setIsEditingEvent(false);
    } catch {
      if (selectedDateKeyRef.current === targetDateKey) {
        setItems(previousItems);
        setPersistError("Could not save event changes.");
        setEventEditError("Could not save event changes.");
      }
    } finally {
      setSavingEventIds((prev) =>
        prev.filter((id) => id !== selectedEvent.id)
      );
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) {
      return;
    }

    const confirmDelete = window.confirm("Delete this event?");
    if (!confirmDelete) {
      return;
    }

    const previousItems = items;
    // Optimistic delete: remove from grid immediately, then rollback if API fails.
    const targetDate = new Date(selectedDate);
    const targetDateKey = targetDate.toDateString();

    setItems(previousItems.filter((item) => item.id !== selectedEvent.id));
    setIsEditingEvent(false);
    setEventEditError(null);
    setPersistError(null);
    setIsEventDetailsOpen(false);
    setSelectedEventId(null);

    try {
      await dataService.deleteDayEvent(targetDate, selectedEvent.id);
      const refreshed = await dataService.fetchDayTimeline(targetDate);
      if (selectedDateKeyRef.current === targetDateKey) {
        setItems(sortItemsByStartTime(refreshed));
      }
    } catch {
      if (selectedDateKeyRef.current === targetDateKey) {
        setItems(previousItems);
        setPersistError("Could not delete event.");
      }
    }
  };

  useEffect(() => {
    // If the selected event was removed while details were open, close the popup.
    if (!selectedEventId || selectedEvent) {
      return;
    }
    setIsEventDetailsOpen(false);
    setIsEditingEvent(false);
    setEventEditError(null);
    setSelectedEventId(null);
  }, [selectedEvent, selectedEventId]);

  const handleAddTask = async () => {
    const startMinutes = parseTimeToMinutes(newTime);
    if (!newTitle.trim()) {
      setAddTaskError("Title is required.");
      return;
    }
    if (startMinutes === null) {
      setAddTaskError("Time must use HH:MM (24h), for example 14:30.");
      return;
    }

    const normalizedStart = minutesToTimeString(startMinutes);
    const endMinutes = startMinutes + 60;
    const normalizedEnd =
      endMinutes < HOURS_IN_DAY * 60 ? minutesToTimeString(endMinutes) : undefined;

    const tempId = `temp-${Date.now()}`;
    const tempItem: DailyTimelineItem = {
      id: tempId,
      startTime: normalizedStart,
      endTime: normalizedEnd,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      status: "default",
    };

    const targetDate = new Date(selectedDate);
    const targetDateKey = targetDate.toDateString();
    setIsCreatingEvent(true);
    setAddTaskError(null);
    setPersistError(null);
    setItems((prev) => sortItemsByStartTime([...prev, tempItem]));
    setIsAddOpen(false);

    try {
      await dataService.createDayEvent(targetDate, {
        title: tempItem.title,
        startTime: tempItem.startTime,
        endTime: tempItem.endTime,
        description: tempItem.description,
        status: tempItem.status,
      });
      const refreshed = await dataService.fetchDayTimeline(targetDate);
      if (selectedDateKeyRef.current === targetDateKey) {
        setItems(sortItemsByStartTime(refreshed));
      }
    } catch {
      if (selectedDateKeyRef.current === targetDateKey) {
        setItems((prev) => prev.filter((item) => item.id !== tempId));
        setPersistError("Could not save the new event.");
      }
    } finally {
      setIsCreatingEvent(false);
    }
  };

  return {
    addTaskError,
    dateLabel,
    dayGridScrollRef,
    error,
    handleAddTask,
    handleCloseAdd,
    handleOpenAdd,
    hours,
    hintError,
    interactionState,
    isAddOpen,
    isCreatingEvent,
    isEventDetailsOpen,
    isLoading,
    isLoadingHints,
    isToday,
    isSelectedEventSaving,
    items,
    isEditingEvent,
    eventEditError,
    selectedEvent,
    editTitle,
    editStartTime,
    editEndTime,
    editDescription,
    newDescription,
    newTime,
    newTitle,
    nowMinutes,
    persistError,
    positionedItems,
    savingEventIds,
    schedulingHints,
    setNewDescription,
    setNewTime,
    setNewTitle,
    setEditDescription,
    setEditEndTime,
    setEditStartTime,
    setEditTitle,
    handleOpenEventDetails,
    handleCloseEventDetails,
    handleCancelEventEdit,
    handleDeleteEvent,
    handleSaveEventEdit,
    handleStartEventEdit,
    startEventInteraction,
  };
}
