import { err, Result } from "@/src/core/result";
import { RoutineStep } from "@/src/domain/models";
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
  private readonly storage = new VersionedStorage("shelflife.routine", 1, seedRoutine, isRoutineList);
  async getToday(): Promise<Result<readonly RoutineStep[]>> { return this.storage.read(); }
  async toggle(stepId: string): Promise<Result<readonly RoutineStep[]>> {
    const current = this.storage.read();
    if (!current.ok) return current;
    if (!current.value.some((step) => step.id === stepId)) return err("not_found", "That routine step no longer exists.");
    return this.storage.write(current.value.map((step) => step.id === stepId ? { ...step, complete: !step.complete } : step));
  }
  async replace(steps: readonly RoutineStep[]): Promise<Result<readonly RoutineStep[]>> {
    const clean = steps.map((step) => ({ ...step, name: step.name.trim(), instruction: step.instruction.trim() }));
    if (clean.length === 0 || clean.some((step) => !step.name || !step.instruction)) {
      return err("validation", "Keep at least one step and complete every routine field.");
    }
    if (new Set(clean.map((step) => step.id)).size !== clean.length) {
      return err("validation", "Routine steps must be unique.");
    }
    return this.storage.write(clean);
  }
}
