"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getTodayDateString, getDateString, addDays, formatDisplayDate } from "../utils";

interface DateNavigationContextValue {
  date: Date;
  dateString: string;
  displayDate: string;
  isToday: boolean;
  goToday: () => void;
  goNext: () => void;
  goPrev: () => void;
  setDate: (date: Date) => void;
}

const DateNavigationContext = createContext<DateNavigationContextValue | null>(null);

export function DateNavigationProvider({ children }: { children: ReactNode }) {
  const [date, setDateState] = useState(() => new Date());

  const dateString = getDateString(date);
  const displayDate = formatDisplayDate(date);
  const isToday = dateString === getTodayDateString();

  const goToday = useCallback(() => setDateState(new Date()), []);
  const goNext = useCallback(() => setDateState((d) => addDays(d, 1)), []);
  const goPrev = useCallback(() => setDateState((d) => addDays(d, -1)), []);
  const setDate = useCallback((d: Date) => setDateState(d), []);

  return (
    <DateNavigationContext.Provider
      value={{ date, dateString, displayDate, isToday, goToday, goNext, goPrev, setDate }}
    >
      {children}
    </DateNavigationContext.Provider>
  );
}

export function useDateNavigation() {
  const context = useContext(DateNavigationContext);
  if (!context) {
    throw new Error("useDateNavigation must be used within a DateNavigationProvider");
  }
  return context;
}
