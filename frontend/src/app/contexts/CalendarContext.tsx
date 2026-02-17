import { createContext, useContext } from "react";
import type { ReactNode } from "react";

type CalendarContextValue = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

export const CalendarProvider = ({
  value,
  children,
}: {
  value: CalendarContextValue;
  children: ReactNode;
}) => {
  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }
  return context;
};
