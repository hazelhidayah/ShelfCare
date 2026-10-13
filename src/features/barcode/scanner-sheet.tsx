"use client";

import { FormEvent, useState } from "react";

export function ScannerSheet({ scanning, message, onClose, onLookup }: { scanning: boolean; message: string | null; onClose: () => void; onLookup: (barcode: string) => Promise<void> }) {
  const [barcode, setBarcode] = useState("8809572890474");
  const submit = async (event: FormEvent) => { event.preventDefault(); await onLookup(barcode); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Scan a product">
    <button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet"><div className="sheet-handle" /><form className="scan-content" onSubmit={submit}>
      <span className="card-kicker">BARCODE MICROSERVICE</span><h2>Line up the barcode</h2><p>The scanner returns product data without knowing anything about your shelf.</p>
      <div className="scanner"><div className="scan-line" /><span>▥</span></div>
      <label className="barcode-input">Barcode<input inputMode="numeric" value={barcode} onChange={(event) => setBarcode(event.target.value.replace(/\D/g, ""))} /></label>
      {message && <p className="inline-error" role="alert">{message}</p>}
      <button className="primary-button" disabled={scanning}>{scanning ? "Looking up…" : "Look up barcode"}</button>
    </form></section>
  </div>;
}
