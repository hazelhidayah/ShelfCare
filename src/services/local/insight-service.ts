import { err, ok, Result } from "@/src/core/result";
import { Insight } from "@/src/domain/models";
import { VersionedStorage } from "@/src/platform/versioned-storage";
import { InsightService } from "@/src/services/contracts";

type InsightSeed = Omit<Insight, "favourite">;

const library: readonly InsightSeed[] = [
  { id: "vitamin-c-order", title: "Layer with intention", body: "Your vitamin C works best before moisturiser and SPF.", category: "Routine" },
  { id: "jar-hygiene", title: "Keep jars cleaner", body: "Use a clean spatula instead of fingers to help jar products stay fresh.", category: "Shelf care" },
  { id: "spf-amount", title: "Give SPF enough room", body: "Use roughly two finger lengths of sunscreen for your face and neck.", category: "Routine" },
  { id: "patch-test", title: "Introduce slowly", body: "Patch-test one new active at a time so reactions are easier to trace.", category: "Ingredients" },
  { id: "cool-storage", title: "Choose a calm shelf", body: "Heat and direct sunlight can shorten the useful life of many formulas.", category: "Shelf care" },
  { id: "texture-check", title: "Trust a changed texture", body: "A new smell, colour or separation can be a sign that a product should be replaced.", category: "Shelf care" },
  { id: "simple-routine", title: "Consistency beats complexity", body: "A gentle routine you repeat often can outperform a crowded one.", category: "Routine" },
];

const isStringList = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");

export class LocalInsightService implements InsightService {
  private readonly favourites = new VersionedStorage<string[]>("shelflife.favourite-insights", 1, [], isStringList);

  async getDaily(date: Date): Promise<Result<Insight>> {
    const start = Date.UTC(date.getUTCFullYear(), 0, 0);
    const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86_400_000);
    const seed = library[Math.abs(day) % library.length];
    const saved = this.favourites.read();
    if (!saved.ok) return saved;
    return ok({ ...seed, favourite: saved.value.includes(seed.id) });
  }

  async listFavourites(): Promise<Result<readonly Insight[]>> {
    const saved = this.favourites.read();
    if (!saved.ok) return saved;
    return ok(library.filter((item) => saved.value.includes(item.id)).map((item) => ({ ...item, favourite: true })));
  }

  async setFavourite(insightId: string, favourite: boolean): Promise<Result<Insight>> {
    const seed = library.find((item) => item.id === insightId);
    if (!seed) return err("not_found", "That insight is no longer available.");
    const saved = this.favourites.read();
    if (!saved.ok) return saved;
    const next = favourite ? [...new Set([...saved.value, insightId])] : saved.value.filter((id) => id !== insightId);
    const written = this.favourites.write(next);
    return written.ok ? ok({ ...seed, favourite }) : written;
  }
}
