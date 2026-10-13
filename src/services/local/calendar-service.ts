import { err, ok, Result } from "@/src/core/result";
import { CalendarCheckIn, CalendarDay } from "@/src/domain/models";
import { VersionedStorage } from "@/src/platform/versioned-storage";
import { CalendarService } from "@/src/services/contracts";

const diary: CalendarDay[] = [
  { date: "2026-07-27", skinStatus: "Dry", mood: "Tired", routineCompleted: 4, routineTotal: 5, productsUsed: ["Gentle Cleanser", "Barrier Cream"], note: "Skin felt tight after an air-conditioned day.", isFuture: false },
  { date: "2026-07-28", skinStatus: "Calm", mood: "Rested", routineCompleted: 5, routineTotal: 5, productsUsed: ["Snail 96 Essence", "Barrier Cream", "Daily UV Defense"], note: "Finished the full routine before work.", isFuture: false },
  { date: "2026-07-29", skinStatus: "Sensitive", mood: "Stressed", routineCompleted: 3, routineTotal: 5, productsUsed: ["Gentle Cleanser", "Barrier Cream"], note: "Skipped vitamin C after noticing redness.", isFuture: false },
  { date: "2026-07-30", skinStatus: "Glowy", mood: "Bright", routineCompleted: 5, routineTotal: 5, productsUsed: ["Snail 96 Essence", "Vitamin C Serum", "Daily UV Defense"], note: "Makeup sat especially well today.", isFuture: false },
  { date: "2026-07-31", skinStatus: "Calm", mood: "Good", routineCompleted: 3, routineTotal: 5, productsUsed: ["Gentle Cleanser", "Snail 96 Essence", "Vitamin C Serum"], note: "Moisturiser and SPF are still left for this morning.", isFuture: false },
  { date: "2026-08-01", skinStatus: "Unlogged", mood: "Not checked in", routineCompleted: 0, routineTotal: 5, productsUsed: [], note: null, isFuture: true },
  { date: "2026-08-02", skinStatus: "Unlogged", mood: "Not checked in", routineCompleted: 0, routineTotal: 5, productsUsed: [], note: null, isFuture: true },
];

const isCalendarDays = (value: unknown): value is CalendarDay[] => Array.isArray(value) && value.every((item) => {
  if (typeof item !== "object" || item === null) return false;
  const day = item as Record<string, unknown>;
  return typeof day.date === "string" && typeof day.skinStatus === "string" && typeof day.mood === "string" &&
    typeof day.routineCompleted === "number" && typeof day.routineTotal === "number" && Array.isArray(day.productsUsed) &&
    day.productsUsed.every((product) => typeof product === "string") && (typeof day.note === "string" || day.note === null) && typeof day.isFuture === "boolean";
});

export class LocalCalendarService implements CalendarService {
  private readonly storage = new VersionedStorage<CalendarDay[]>("shelflife.calendar", 1, diary, isCalendarDays);

  async getWeek(): Promise<Result<readonly CalendarDay[]>> { return this.storage.read(); }

  async getDay(date: string): Promise<Result<CalendarDay>> {
    const saved = this.storage.read();
    if (!saved.ok) return saved;
    const day = saved.value.find((item) => item.date === date);
    return day ? ok(day) : err("not_found", "No diary entry is available for that date.");
  }

  async saveCheckIn(input: CalendarCheckIn): Promise<Result<CalendarDay>> {
    if (!input.mood.trim() || input.routineTotal < 1 || input.routineCompleted < 0 || input.routineCompleted > input.routineTotal) {
      return err("validation", "Check the mood and routine progress before saving.");
    }
    const saved = this.storage.read();
    if (!saved.ok) return saved;
    const entry: CalendarDay = {
      ...input,
      mood: input.mood.trim(),
      productsUsed: input.productsUsed.map((product) => product.trim()).filter(Boolean),
      note: input.note?.trim() || null,
      isFuture: false,
    };
    const next = saved.value.some((day) => day.date === input.date)
      ? saved.value.map((day) => day.date === input.date ? entry : day)
      : [...saved.value, entry].sort((a, b) => a.date.localeCompare(b.date));
    const written = this.storage.write(next);
    return written.ok ? ok(entry) : written;
  }
}
