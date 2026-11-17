"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { dateFromKey, toDateKey } from "@/src/domain/date";
import { SheetCloseButton, useSheetClose } from "@/src/ui/sheet-controls";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthCalendarSheet({ selectedDate, loggedDates, onClose, onSelect }: { selectedDate: string; loggedDates: readonly string[]; onClose: () => void; onSelect: (date: string) => void }) {
  const requestClose = useSheetClose(onClose);
  const today = toDateKey();
  const selected = dateFromKey(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1, 12));
  const cells = useMemo(() => {
    const first = new Date(visibleMonth);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return { key, day: date.getDate(), inMonth: date.getMonth() === visibleMonth.getMonth() };
    });
  }, [visibleMonth]);
  const moveMonth = (direction: number) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1, 12));

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Choose a diary date"><button className="modal-backdrop" onClick={requestClose} aria-label="Close calendar" />
    <section className="bottom-sheet month-calendar"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close calendar" /><div className="month-heading"><button onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft /></button><h2>{new Intl.DateTimeFormat("en-SG", { month: "long", year: "numeric" }).format(visibleMonth)}</h2><button onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight /></button></div>
      <div className="month-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="month-grid">{cells.map((cell) => <button key={cell.key} className={`${cell.inMonth ? "" : "outside"} ${cell.key === selectedDate ? "selected" : ""} ${cell.key === today ? "today" : ""}`} onClick={() => onSelect(cell.key)} disabled={cell.key > today} aria-label={`${cell.key}${loggedDates.includes(cell.key) ? ", check-in logged" : ""}`}><span>{cell.day}</span>{loggedDates.includes(cell.key) && <i aria-hidden="true" />}</button>)}</div>
      <div className="month-legend"><span><i className="today-dot" />Today</span><span><i className="logged-dot" />Check-in logged</span></div>
    </section></div>;
}
