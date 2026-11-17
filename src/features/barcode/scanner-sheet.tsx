"use client";

import { FormEvent, useState } from "react";
import { ScanBarcode } from "lucide-react";
import { SheetCloseButton, useSheetClose } from "@/src/ui/sheet-controls";

export function ScannerSheet({ scanning, message, onClose, onLookup }: { scanning: boolean; message: string | null; onClose: () => void; onLookup: (barcode: string) => Promise<void> }) {
  const [barcode, setBarcode] = useState("");
  const requestClose = useSheetClose(onClose);
  const submit = async (event: FormEvent) => { event.preventDefault(); await onLookup(barcode); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Scan a product">
    <button className="modal-backdrop" onClick={requestClose} aria-label="Close barcode lookup" />
    <section className="bottom-sheet"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close barcode lookup" /><form className="scan-content" onSubmit={submit}>
      <div className="scanner honest-scanner"><ScanBarcode aria-hidden="true" /></div>
      <h2>Find a product by barcode</h2><p>Enter the 8–14 digit number printed below the barcode. ShelfCare will look for a matching product.</p>
      <label className="barcode-input">Barcode number<input required autoFocus inputMode="numeric" minLength={8} maxLength={14} placeholder="e.g. 8809572890474" value={barcode} onChange={(event) => setBarcode(event.target.value.replace(/\D/g, ""))} /></label>
      {message && <p className="inline-error" role="alert">{message}</p>}
      <button className="primary-button" disabled={scanning || barcode.length < 8}>{scanning ? "Looking up…" : "Find product"}</button>
    </form></section>
  </div>;
}
