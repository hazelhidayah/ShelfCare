import { err, ok, Result } from "@/src/core/result";
import { addDays, toDateKey } from "@/src/domain/date";
import { CalendarCheckIn, CalendarDay, CalendarProductRef } from "@/src/domain/models";
import { VersionedStorage } from "@/src/platform/versioned-storage";
import { CalendarService } from "@/src/services/contracts";

const product = (id: string, name: string): CalendarProductRef => ({ id, name });

function seedDiary(): CalendarDay[] {
  const today = toDateKey();
  const templates: Array<Omit<CalendarDay, "date" | "isFuture">> = [
    { skinStatus: "Dry", mood: "Tired", routineCompleted: 4, routineTotal: 5, productsUsed: [product("krave-barrier", "Barrier Cream")], note: "Skin felt tight after an air-conditioned day." },
    { skinStatus: "Calm", mood: "Rested", routineCompleted: 5, routineTotal: 5, productsUsed: [product("cosrx-snail", "Snail 96 Essence"), product("krave-barrier", "Barrier Cream")], note: "Finished the full routine before work." },
    { skinStatus: "Sensitive", mood: "Stressed", routineCompleted: 3, routineTotal: 5, productsUsed: [product("krave-barrier", "Barrier Cream")], note: "Skipped vitamin C after noticing redness." },
    { skinStatus: "Glowy", mood: "Bright", routineCompleted: 5, routineTotal: 5, productsUsed: [product("cosrx-snail", "Snail 96 Essence"), product("innisfree-uv", "Daily UV Defense")], note: "Makeup sat especially well today." },
    { skinStatus: "Calm", mood: "Good", routineCompleted: 3, routineTotal: 5, productsUsed: [product("cosrx-snail", "Snail 96 Essence"), product("innisfree-uv", "Daily UV Defense")], note: "Moisturiser and SPF are still left for this morning." },
  ];
  return [
    ...templates.map((entry, index) => ({ ...entry, date: addDays(today, index - 4), isFuture: false })),
    { date: addDays(today, 1), skinStatus: "Unlogged", mood: "Not checked in", routineCompleted: 0, routineTotal: 5, productsUsed: [], note: null, isFuture: true },
    { date: addDays(today, 2), skinStatus: "Unlogged", mood: "Not checked in", routineCompleted: 0, routineTotal: 5, productsUsed: [], note: null, isFuture: true },
  ];
}

const isProductRef = (value: unknown): value is CalendarProductRef => typeof value === "object" && value !== null &&
  "id" in value && typeof value.id === "string" && "name" in value && typeof value.name === "string";

const isCalendarDays = (value: unknown): value is CalendarDay[] => Array.isArray(value) && value.every((item) => {
  if (typeof item !== "object" || item === null) return false;
  const day = item as Record<string, unknown>;
  return typeof day.date === "string" && typeof day.skinStatus === "string" && typeof day.mood === "string" &&
    typeof day.routineCompleted === "number" && typeof day.routineTotal === "number" && Array.isArray(day.productsUsed) &&
    day.productsUsed.every(isProductRef) && (typeof day.note === "string" || day.note === null) && typeof day.isFuture === "boolean";
});

export class LocalCalendarService implements CalendarService {
  private readonly storage = new VersionedStorage<CalendarDay[]>("shelflife.calendar.v2", 2, seedDiary(), isCalendarDays);

  private migrateLegacy() {
    if (typeof window === "undefined" || window.localStorage.getItem("shelflife.calendar.v2")) return;
    try {
      const parsed = JSON.parse(window.localStorage.getItem("shelflife.calendar") ?? "null") as { data?: unknown } | null;
      if (!parsed || !Array.isArray(parsed.data)) return;
      const knownIds: Record<string, string> = { "Snail 96 Essence": "cosrx-snail", "Soft Pinch Blush": "rare-blush", "Daily UV Defense": "innisfree-uv", "Barrier Cream": "krave-barrier", "Fine Hair Mask": "ouai-mask", "The Body Lotion": "necessaire-lotion" };
      const legacy: unknown[] = parsed.data.flatMap((value) => {
        if (typeof value !== "object" || value === null) return [];
        const day = value as Record<string, unknown>;
        if (typeof day.date !== "string" || !Array.isArray(day.productsUsed) || !day.productsUsed.every((item) => typeof item === "string")) return [];
        return [{ ...day, productsUsed: day.productsUsed.map((name) => ({ id: knownIds[name] ?? `legacy-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name })), isFuture: day.date > toDateKey() }];
      });
      const legacyDates = new Set(legacy.map((day) => typeof day === "object" && day !== null && "date" in day ? String(day.date) : ""));
      const merged: unknown[] = [...legacy, ...seedDiary().filter((seed) => !legacyDates.has(seed.date))];
      if (isCalendarDays(merged)) this.storage.write(merged);
    } catch { /* Keep the current-date seed diary when legacy data is malformed. */ }
  }

  async getWeek(): Promise<Result<readonly CalendarDay[]>> { this.migrateLegacy(); return this.storage.read(); }

  async getDay(date: string): Promise<Result<CalendarDay>> {
    this.migrateLegacy();
    const saved = this.storage.read();
    if (!saved.ok) return saved;
    const day = saved.value.find((item) => item.date === date);
    if (day) return ok({ ...day, isFuture: date > toDateKey() });
    return ok({ date, skinStatus: "Unlogged", mood: "Not checked in", routineCompleted: 0, routineTotal: 5, productsUsed: [], note: null, isFuture: date > toDateKey() });
  }

  async saveCheckIn(input: CalendarCheckIn): Promise<Result<CalendarDay>> {
    this.migrateLegacy();
    if (input.date > toDateKey()) return err("validation", "Check-ins can only be saved for today or an earlier date.");
    if (!input.mood.trim() || input.routineTotal < 1 || input.routineCompleted < 0 || input.routineCompleted > input.routineTotal) return err("validation", "Check the mood and routine progress before saving.");
    const saved = this.storage.read();
    if (!saved.ok) return saved;
    const uniqueProducts = [...new Map(input.productsUsed.map((item) => [item.id, { id: item.id.trim(), name: item.name.trim() }])).values()].filter((item) => item.id && item.name);
    const entry: CalendarDay = { ...input, mood: input.mood.trim(), productsUsed: uniqueProducts, note: input.note?.trim() || null, isFuture: false };
    const next = saved.value.some((day) => day.date === input.date) ? saved.value.map((day) => day.date === input.date ? entry : day) : [...saved.value, entry].sort((a, b) => a.date.localeCompare(b.date));
    const written = this.storage.write(next);
    return written.ok ? ok(entry) : written;
  }
}
