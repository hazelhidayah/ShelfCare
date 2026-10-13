"use client";

import { useCallback, useEffect, useState } from "react";
import { AppError } from "@/src/core/result";
import { Insight } from "@/src/domain/models";
import { InsightService } from "@/src/services/contracts";

export function useInsights(service: InsightService, selectedDate: string) {
  const [daily, setDaily] = useState<Insight | null>(null);
  const [favourites, setFavourites] = useState<readonly Insight[]>([]);
  const [error, setError] = useState<AppError | null>(null);

  const refreshFavourites = useCallback(async () => {
    const result = await service.listFavourites();
    if (result.ok) { setFavourites(result.value); setError(null); } else setError(result.error);
    return result;
  }, [service]);

  useEffect(() => {
    let active = true;
    void Promise.all([service.getDaily(new Date(`${selectedDate}T12:00:00Z`)), service.listFavourites()]).then(([today, saved]) => {
      if (!active) return;
      if (today.ok) setDaily(today.value); else setError(today.error);
      if (saved.ok) setFavourites(saved.value); else setError(saved.error);
    });
    return () => { active = false; };
  }, [selectedDate, service]);

  const toggleDailyFavourite = useCallback(async () => {
    if (!daily) return null;
    const next = !daily.favourite;
    setDaily({ ...daily, favourite: next });
    const result = await service.setFavourite(daily.id, next);
    if (!result.ok) { setDaily(daily); setError(result.error); return result; }
    setDaily(result.value);
    await refreshFavourites();
    return result;
  }, [daily, refreshFavourites, service]);

  const removeFavourite = useCallback(async (insightId: string) => {
    const result = await service.setFavourite(insightId, false);
    if (result.ok) {
      setFavourites((current) => current.filter((item) => item.id !== insightId));
      setDaily((current) => current?.id === insightId ? { ...current, favourite: false } : current);
    } else setError(result.error);
    return result;
  }, [service]);

  return { daily, favourites, error, toggleDailyFavourite, removeFavourite, refreshFavourites };
}
