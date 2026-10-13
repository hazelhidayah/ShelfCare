"use client";

import { ImagePlus, ScanBarcode } from "lucide-react";

export function AddProductChoiceSheet({ onClose, onScan, onManual }: { onClose: () => void; onScan: () => void; onManual: () => void }) {
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Add a product"><button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet add-choice-sheet"><div className="sheet-handle" /><span className="card-kicker">ADD A PRODUCT</span><h2>How would you like to add it?</h2><p>Scan for instant details, or enter them yourself.</p>
      <div className="add-methods"><button onClick={onScan}><span><ScanBarcode aria-hidden="true" /></span><strong>Scan barcode</strong><small>Find product details instantly</small></button><button onClick={onManual}><span><ImagePlus aria-hidden="true" /></span><strong>Add manually</strong><small>Enter details and upload a photo</small></button></div>
    </section></div>;
}
