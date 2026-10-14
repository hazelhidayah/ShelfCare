import { err, Result } from "@/src/core/result";
import { MAX_ROUTINE_STEPS, RoutinePeriod, RoutineStep } from "@/src/domain/models";
import { VersionedStorage } from "@/src/platform/versioned-storage";
import { RoutineService } from "@/src/services/contracts";
import { isRoutineList } from "./guards";

const seedRoutine: RoutineStep[] = [
  { id: "cleanse", name: "Gentle cleanser", instruction: "Rinse · 30 sec", complete: true },
  { id: "essence", name: "Hydrating essence", instruction: "Pat in · 1 min", complete: true },
  { id: "vitamin-c", name: "Vitamin C serum", instruction: "3 drops · 1 min", complete: true },
  { id: "moisturise", name: "Moisturiser", instruction: "Face + neck · 1 min", complete: false },
  { id: "spf", name: "SPF 50", instruction: "Two-finger rule · 2 min", complete: false },
];

export class LocalRoutineService implements RoutineService {
  private readonly morningStorage = new VersionedStorage("shelflife.routine", 1, seedRoutine, isRoutineList);
  private readonly nightStorage = new VersionedStorage<RoutineStep[]>("shelflife.routine.night", 1, [], isRoutineList);
  private storageFor(period: RoutinePeriod) { return period === "morning" ? this.morningStorage : this.nightStorage; }

  async get(period: RoutinePeriod): Promise<Result<readonly RoutineStep[]>> { return this.storageFor(period).read(); }
  async toggle(period: RoutinePeriod, stepId: string): Promise<Result<readonly RoutineStep[]>> {
    const storage = this.storageFor(period);
    const current = storage.read();
    if (!current.ok) return current;
    if (!current.value.some((step) => step.id === stepId)) return err("not_found", "That routine step no longer exists.");
    return storage.write(current.value.map((step) => step.id === stepId ? { ...step, complete: !step.complete } : step));
  }
  async replace(period: RoutinePeriod, steps: readonly RoutineStep[]): Promise<Result<readonly RoutineStep[]>> {
    const clean = steps.map((step) => ({ ...step, name: step.name.trim(), instruction: step.instruction.trim() }));
    if (clean.length === 0 || clean.some((step) => !step.name || !step.instruction)) {
      return err("validation", "Keep at least one step and complete every routine field.");
    }
    if (clean.length > MAX_ROUTINE_STEPS) {
      return err("validation", `A routine can have up to ${MAX_ROUTINE_STEPS} steps.`);
    }
    if (new Set(clean.map((step) => step.id)).size !== clean.length) {
      return err("validation", "Routine steps must be unique.");
    }
    return this.storageFor(period).write(clean);
  }
}
