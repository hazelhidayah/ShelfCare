"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheckIn, CalendarDay } from "@/src/domain/models";
import { addDays, startOfWeekKey, toDateKey } from "@/src/domain/date";
import { CalendarService } from "@/src/services/contracts";

export function useCalendar(service: CalendarService) {
  const [entries, setEntries] = useState<readonly CalendarDay[]>([]);
  const today = useMemo(() => toDateKey(), []);
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    let active = true;
    void service.getWeek().then((result) => { if (active && result.ok) setEntries(result.value); });
    return () => { active = false; };
  }, [service]);

  const days = useMemo(() => {
    const monday = startOfWeekKey(selectedDate);
    return Array.from({ length: 7 }, (_, index) => {
      const key = addDays(monday, index);
      const saved = entries.find((day) => day.date === key);
      return saved ? { ...saved, isFuture: key > today } : { date: key, skinStatus: "Unlogged" as const, mood: "Not checked in", routineCompleted: 0, routineTotal: 5, productsUsed: [], note: null, isFuture: key > today };
    });
  }, [entries, selectedDate, today]);
  const selectedDay = useMemo(() => days.find((day) => day.date === selectedDate) ?? null, [days, selectedDate]);
  const saveCheckIn = async (input: CalendarCheckIn) => {
    const result = await service.saveCheckIn(input);
    if (result.ok) setEntries((current) => current.some((day) => day.date === result.value.date) ? current.map((day) => day.date === result.value.date ? result.value : day) : [...current, result.value]);
    return result;
  };
  const loggedDates = useMemo(() => entries.filter((day) => day.skinStatus !== "Unlogged").map((day) => day.date), [entries]);
  const streak = useMemo(() => {
    const logged = new Set(loggedDates);
    let count = 0;
    let cursor = today;
    while (logged.has(cursor)) { count += 1; cursor = addDays(cursor, -1); }
    return count;
  }, [loggedDates, today]);
  return { days, selectedDate, selectedDay, loggedDates, streak, today, selectDate: setSelectedDate, saveCheckIn };
}
