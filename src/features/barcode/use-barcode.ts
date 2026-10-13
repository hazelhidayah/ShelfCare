"use client";

import { useCallback, useState } from "react";
import { withTimeout } from "@/src/core/result";
import { BarcodeMatch } from "@/src/domain/models";
import { BarcodeService } from "@/src/services/contracts";

export function useBarcode(service: BarcodeService) {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const lookup = useCallback(async (barcode: string): Promise<BarcodeMatch | null> => {
    setScanning(true); setMessage(null);
    const result = await withTimeout(service.lookup(barcode));
    setScanning(false);
    if (!result.ok) { setMessage(result.error.message); return null; }
    return result.value;
  }, [service]);
  return { scanning, message, lookup };
}
