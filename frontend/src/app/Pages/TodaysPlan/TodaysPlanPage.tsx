import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Banner } from "../../design_system/components/ui/Banner";
import { Button } from "../../design_system/components/ui/Button";
import { useCalendar } from "../../contexts/useCalendar";
import { AddTaskModal } from "./AddTaskModal";
import { DayGrid } from "./DayGrid";
import { EventDetailsDialog } from "./EventDetailsDialog";
import { useDayPlanner } from "./useDayPlanner";

export const TodaysPlanPage = () => {
  const { selectedDate, selectedView, setSelectedView } = useCalendar();
  const planner = useDayPlanner({ selectedDate, selectedView });

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
            {planner.isToday ? "Today" : planner.dateLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {planner.isToday
              ? "A timeline of your day with AI-powered insights."
              : `Events scheduled for ${planner.dateLabel}.`}
          </Typography>
        </Box>
        <Button
          size="sm"
          onClick={planner.handleOpenAdd}
          disabled={planner.isCreatingEvent}
        >
          {planner.isCreatingEvent ? "Saving task…" : "Add task"}
        </Button>
      </Box>

      <Banner
        variant="info"
        title="AI suggestion"
        message="If you leave by 10:35 AM, you’ll arrive on time for your team sync, accounting for traffic and buffer time."
      />

      {planner.persistError && (
        <Banner
          variant="error"
          title="Could not save changes"
          message={planner.persistError}
        />
      )}

      <DayGrid
        dayGridScrollRef={planner.dayGridScrollRef}
        error={planner.error}
        hours={planner.hours}
        interactionState={planner.interactionState}
        isLoading={planner.isLoading}
        isToday={planner.isToday}
        itemsCount={planner.items.length}
        nowMinutes={planner.nowMinutes}
        onOpenEvent={planner.handleOpenEventDetails}
        onStartInteraction={planner.startEventInteraction}
        positionedItems={planner.positionedItems}
        savingEventIds={planner.savingEventIds}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
      />

      {/* Popup detail view for selected day events. */}
      <EventDetailsDialog
        isOpen={planner.isEventDetailsOpen}
        event={planner.selectedEvent}
        isEditing={planner.isEditingEvent}
        isSaving={planner.isSelectedEventSaving}
        editDescription={planner.editDescription}
        editEndTime={planner.editEndTime}
        editError={planner.eventEditError}
        editStartTime={planner.editStartTime}
        editTitle={planner.editTitle}
        onClose={planner.handleCloseEventDetails}
        onCancelEdit={planner.handleCancelEventEdit}
        onDelete={planner.handleDeleteEvent}
        onEdit={planner.handleStartEventEdit}
        onSaveEdit={planner.handleSaveEventEdit}
        onSetEditDescription={planner.setEditDescription}
        onSetEditEndTime={planner.setEditEndTime}
        onSetEditStartTime={planner.setEditStartTime}
        onSetEditTitle={planner.setEditTitle}
      />

      <AddTaskModal
        addTaskError={planner.addTaskError}
        hintError={planner.hintError}
        isCreatingEvent={planner.isCreatingEvent}
        isLoadingHints={planner.isLoadingHints}
        isOpen={planner.isAddOpen}
        newDescription={planner.newDescription}
        newTime={planner.newTime}
        newTitle={planner.newTitle}
        onClose={planner.handleCloseAdd}
        onDescriptionChange={planner.setNewDescription}
        onSave={planner.handleAddTask}
        onTimeChange={planner.setNewTime}
        onTitleChange={planner.setNewTitle}
        schedulingHints={planner.schedulingHints}
      />
    </Stack>
  );
};
