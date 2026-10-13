"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppError } from "@/src/core/result";
import { NewProduct, Product } from "@/src/domain/models";
import { ProductTrackingService } from "@/src/services/contracts";

export function useProductTracking(service: ProductTrackingService) {
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await service.list();
    if (result.ok) { setProducts(result.value); setError(null); }
    else setError(result.error);
    setLoading(false);
  }, [service]);

  useEffect(() => {
    let active = true;
    void service.list().then((result) => {
      if (!active) return;
      if (result.ok) { setProducts(result.value); setError(null); } else setError(result.error);
      setLoading(false);
    });
    return () => { active = false; };
  }, [service]);

  const add = useCallback(async (input: NewProduct) => {
    const result = await service.add(input);
    if (result.ok) { setProducts((current) => [result.value, ...current]); setError(null); }
    else setError(result.error);
    return result;
  }, [service]);

  const shelfScore = useMemo(() => {
    const safe = products.filter((item) => item.daysLeft > 30).length;
    return Math.max(58, Math.round((safe / Math.max(products.length, 1)) * 44 + 56));
  }, [products]);

  const setFavourite = useCallback(async (productId: string, favourite: boolean) => {
    const snapshot = products;
    setProducts((current) => current.map((item) => item.id === productId ? { ...item, favourite } : item));
    const result = await service.setFavourite(productId, favourite);
    if (!result.ok) { setProducts(snapshot); setError(result.error); }
    return result;
  }, [products, service]);

  return { products, loading, error, shelfScore, add, setFavourite, refresh };
}
