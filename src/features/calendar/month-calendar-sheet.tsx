"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const TODAY = "2026-07-31";
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthCalendarSheet({ selectedDate, loggedDates, onClose, onSelect }: { selectedDate: string; loggedDates: readonly string[]; onClose: () => void; onSelect: (date: string) => void }) {
  const selected = new Date(`${selectedDate}T12:00:00Z`);
  const [visibleMonth, setVisibleMonth] = useState(new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1, 12)));
  const cells = useMemo(() => {
    const first = new Date(visibleMonth);
    const offset = (first.getUTCDay() + 6) % 7;
    const start = new Date(first);
    start.setUTCDate(1 - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      return { key: date.toISOString().slice(0, 10), day: date.getUTCDate(), inMonth: date.getUTCMonth() === visibleMonth.getUTCMonth() };
    });
  }, [visibleMonth]);
  const moveMonth = (direction: number) => setVisibleMonth((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + direction, 1, 12)));

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Choose a diary date"><button className="modal-backdrop" onClick={onClose} aria-label="Close calendar" />
    <section className="bottom-sheet month-calendar"><div className="sheet-handle" /><div className="month-heading"><button onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft /></button><h2>{new Intl.DateTimeFormat("en-SG", { month: "long", year: "numeric", timeZone: "UTC" }).format(visibleMonth)}</h2><button onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight /></button></div>
      <div className="month-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="month-grid">{cells.map((cell) => <button key={cell.key} className={`${cell.inMonth ? "" : "outside"} ${cell.key === selectedDate ? "selected" : ""} ${cell.key === TODAY ? "today" : ""}`} onClick={() => onSelect(cell.key)}><span>{cell.day}</span>{loggedDates.includes(cell.key) && <i aria-label="Has a diary entry" />}</button>)}</div>
      <div className="month-legend"><span><i className="today-dot" />Today</span><span><i className="logged-dot" />Check-in logged</span></div>
    </section></div>;
}
