"use client";

import { useCallback, useEffect, useState } from "react";
import { AppError } from "@/src/core/result";
import { RoutinePeriod, RoutineStep } from "@/src/domain/models";
import { RoutineService } from "@/src/services/contracts";

export function useRoutine(service: RoutineService, period: RoutinePeriod) {
  const [steps, setSteps] = useState<readonly RoutineStep[]>([]);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    const result = await service.get(period);
    if (result.ok) { setSteps(result.value); setError(null); } else setError(result.error);
  }, [period, service]);

  useEffect(() => {
    let active = true;
    void service.get(period).then((result) => {
      if (!active) return;
      if (result.ok) { setSteps(result.value); setError(null); } else setError(result.error);
    });
    return () => { active = false; };
  }, [period, service]);

  const toggle = useCallback(async (stepId: string) => {
    const snapshot = steps;
    setSteps((current) => current.map((step) => step.id === stepId ? { ...step, complete: !step.complete } : step));
    const result = await service.toggle(period, stepId);
    if (result.ok) { setSteps(result.value); setError(null); }
    else { setSteps(snapshot); setError(result.error); }
    return result;
  }, [period, service, steps]);

  const replace = useCallback(async (nextSteps: readonly RoutineStep[]) => {
    const result = await service.replace(period, nextSteps);
    if (result.ok) { setSteps(result.value); setError(null); }
    else setError(result.error);
    return result;
  }, [period, service]);

  return { steps, doneCount: steps.filter((step) => step.complete).length, error, toggle, replace, refresh };
}
