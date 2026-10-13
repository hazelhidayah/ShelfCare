"use client";

import { useCallback, useEffect, useState } from "react";
import { AppError } from "@/src/core/result";
import { RoutineStep } from "@/src/domain/models";
import { RoutineService } from "@/src/services/contracts";

export function useRoutine(service: RoutineService) {
  const [steps, setSteps] = useState<readonly RoutineStep[]>([]);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    const result = await service.getToday();
    if (result.ok) { setSteps(result.value); setError(null); } else setError(result.error);
  }, [service]);

  useEffect(() => {
    let active = true;
    void service.getToday().then((result) => {
      if (!active) return;
      if (result.ok) { setSteps(result.value); setError(null); } else setError(result.error);
    });
    return () => { active = false; };
  }, [service]);

  const toggle = useCallback(async (stepId: string) => {
    const snapshot = steps;
    setSteps((current) => current.map((step) => step.id === stepId ? { ...step, complete: !step.complete } : step));
    const result = await service.toggle(stepId);
    if (result.ok) { setSteps(result.value); setError(null); }
    else { setSteps(snapshot); setError(result.error); }
    return result;
  }, [service, steps]);

  const replace = useCallback(async (nextSteps: readonly RoutineStep[]) => {
    const result = await service.replace(nextSteps);
    if (result.ok) { setSteps(result.value); setError(null); }
    else setError(result.error);
    return result;
  }, [service]);

  return { steps, doneCount: steps.filter((step) => step.complete).length, error, toggle, replace, refresh };
}
