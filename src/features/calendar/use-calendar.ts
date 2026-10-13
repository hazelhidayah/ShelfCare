"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheckIn, CalendarDay } from "@/src/domain/models";
import { CalendarService } from "@/src/services/contracts";

export function useCalendar(service: CalendarService) {
  const [entries, setEntries] = useState<readonly CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("2026-07-31");

  useEffect(() => {
    let active = true;
    void service.getWeek().then((result) => { if (active && result.ok) setEntries(result.value); });
    return () => { active = false; };
  }, [service]);

  const days = useMemo(() => {
    const chosen = new Date(`${selectedDate}T12:00:00Z`);
    const mondayOffset = (chosen.getUTCDay() + 6) % 7;
    const monday = new Date(chosen);
    monday.setUTCDate(chosen.getUTCDate() - mondayOffset);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setUTCDate(monday.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      return entries.find((day) => day.date === key) ?? { date: key, skinStatus: "Unlogged" as const, mood: "Not checked in", routineCompleted: 0, routineTotal: 5, productsUsed: [], note: null, isFuture: key > "2026-07-31" };
    });
  }, [entries, selectedDate]);
  const selectedDay = useMemo(() => days.find((day) => day.date === selectedDate) ?? null, [days, selectedDate]);
  const saveCheckIn = async (input: CalendarCheckIn) => {
    const result = await service.saveCheckIn(input);
    if (result.ok) setEntries((current) => current.some((day) => day.date === result.value.date) ? current.map((day) => day.date === result.value.date ? result.value : day) : [...current, result.value]);
    return result;
  };
  return { days, selectedDate, selectedDay, loggedDates: entries.filter((day) => day.skinStatus !== "Unlogged").map((day) => day.date), selectDate: setSelectedDate, saveCheckIn };
}
