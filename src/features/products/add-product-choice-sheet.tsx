"use client";

import { ImagePlus, ScanBarcode } from "lucide-react";
import { SheetCloseButton, useSheetClose } from "@/src/ui/sheet-controls";

export function AddProductChoiceSheet({ onClose, onScan, onManual }: { onClose: () => void; onScan: () => void; onManual: () => void }) {
  const requestClose = useSheetClose(onClose);
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Add a product"><button className="modal-backdrop" onClick={requestClose} aria-label="Close add product choices" />
    <section className="bottom-sheet add-choice-sheet"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close add product choices" /><h2>How would you like to add it?</h2><p>Look up a barcode number, or enter the details yourself.</p>
      <div className="add-methods"><button onClick={onScan}><span><ScanBarcode aria-hidden="true" /></span><strong>Enter barcode</strong><small>Look up saved product details</small></button><button onClick={onManual}><span><ImagePlus aria-hidden="true" /></span><strong>Add manually</strong><small>Enter details and upload a photo</small></button></div>
    </section></div>;
}
