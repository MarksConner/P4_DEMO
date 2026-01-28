import { Outlet, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { Button } from "./design_system/components/ui/Button";
import { SidePanel } from "./design_system/components/ui/SidePanel";
import { Toast } from "./design_system/components/ui/Toast";
import { AiChatPanel } from "./components/AiChatPanel";
import { CalendarSidebar } from "./components/CalendarSidebar";
import { CalendarProvider } from "./contexts/CalendarContext";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Mic,
  MessageCircle,
} from "lucide-react";

const formatHeaderDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export function AppShell() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);
  const handleToday = () => setSelectedDate(new Date());
  const handlePrevDay = () =>
    setSelectedDate((prev) => addDays(prev, -1));
  const handleNextDay = () =>
    setSelectedDate((prev) => addDays(prev, 1));

  const calendarContextValue = useMemo(
    () => ({ selectedDate, setSelectedDate }),
    [selectedDate]
  );

  return (
    <CalendarProvider value={calendarContextValue}>
      <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarDays size={20} />
              <Typography variant="h6" fontWeight={600}>
                Calendar
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button size="sm" variant="secondary" onClick={handleToday}>
                Today
              </Button>
              <IconButton size="small" onClick={handlePrevDay} aria-label="Previous day">
                <ChevronLeft size={18} />
              </IconButton>
              <IconButton size="small" onClick={handleNextDay} aria-label="Next day">
                <ChevronRight size={18} />
              </IconButton>
              <Typography variant="subtitle1" sx={{ minWidth: 200 }}>
                {formatHeaderDate(selectedDate)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ButtonGroup
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  "& .MuiButtonGroup-grouped": {
                    borderColor: "divider",
                  },
                  "& .MuiButtonGroup-firstButton": {
                    borderTopLeftRadius: 999,
                    borderBottomLeftRadius: 999,
                  },
                  "& .MuiButtonGroup-lastButton": {
                    borderTopRightRadius: 999,
                    borderBottomRightRadius: 999,
                  },
                }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  startIcon={<Mic size={16} />}
                  title="Send a voice note"
                >
                  Voice message
                </Button>
                <Button size="sm" variant="secondary" title="Search your calendar">
                  Search
                </Button>
                <Button size="sm" variant="secondary" title="Browse local events">
                  Local events
                </Button>
              </ButtonGroup>
              <Button size="sm" variant="secondary" onClick={() => navigate("/login")}>
                Log out
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flex: 1, minHeight: 0, bgcolor: "background.default" }}>
          <CalendarSidebar />
          <Box component="main" sx={{ flex: 1, minWidth: 0, p: 2, overflowY: "auto" }}>
            <Box sx={{ mb: 2, maxWidth: 480 }}>
              <Toast
                variant="info"
                title="Tip"
                description="Use Today’s plan to see a detailed timeline for your day."
              />
            </Box>
            <Outlet />
          </Box>
        </Box>

        {!isChatOpen && (
          <Tooltip title="Open AI chat" placement="left">
            <Fab
              color="primary"
              aria-label="Open AI chat"
              onClick={handleOpenChat}
              sx={{
                position: "fixed",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: (theme) => theme.zIndex.drawer - 1,
              }}
            >
              <MessageCircle size={20} />
            </Fab>
          </Tooltip>
        )}

        <SidePanel
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          title="AI chat"
          side="right"
        >
          <AiChatPanel />
        </SidePanel>
      </Box>
    </CalendarProvider>
  );
}
