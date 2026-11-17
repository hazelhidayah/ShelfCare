"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { BarcodeMatch, NewProduct, PRODUCT_CATEGORIES } from "@/src/domain/models";
import Image from "next/image";
import { SheetCloseButton, useSheetClose } from "@/src/ui/sheet-controls";

export function ProductSheet({ prefill, onClose, onAdd, onScan }: { prefill: BarcodeMatch | null; onClose: () => void; onAdd: (product: NewProduct) => Promise<void>; onScan: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(prefill?.imageUrl ?? null);
  const [dirty, setDirty] = useState(false);
  const requestClose = useSheetClose(onClose, dirty);
  const switchToBarcode = () => {
    if (dirty && !window.confirm("Discard these product details and enter a barcode instead?")) return;
    onScan();
  };
  const loadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImageUrl(typeof reader.result === "string" ? reader.result : null); setDirty(true); };
    reader.readAsDataURL(file);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await onAdd({
      name: String(form.get("name") ?? ""), brand: String(form.get("brand") ?? ""),
      category: String(form.get("category")) as NewProduct["category"], daysLeft: Number(form.get("days")),
      barcode: prefill?.barcode, imageUrl, description: String(form.get("description") ?? ""), ingredients: prefill?.ingredients ?? [],
    });
  };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Add a product">
    <button className="modal-backdrop" onClick={requestClose} aria-label="Close product form" />
    <section className="bottom-sheet"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close product form" /><form onSubmit={submit} onChange={() => setDirty(true)}>
      <h2>{prefill ? "Review product details" : "Add to your shelf"}</h2><p>{prefill ? "Check the match before saving it to your shelf." : "Add the details that help you track freshness and routines."}</p>
      <div className="product-image-input">{imageUrl ? <Image src={imageUrl} alt="Product preview" width={76} height={76} unoptimized /> : <span>Product image</span>}<label><input type="file" accept="image/*" onChange={loadImage} />{imageUrl ? "Change photo" : "Upload photo"}</label></div>
      <label>Product name<input required name="name" defaultValue={prefill?.name} placeholder="e.g. Water Sleeping Mask" /></label>
      <label>Brand<input required name="brand" defaultValue={prefill?.brand} placeholder="e.g. Laneige" /></label>
      <label>Description<textarea name="description" rows={2} defaultValue={prefill?.description ?? ""} placeholder="Texture, finish, purpose…" /></label>
      <div className="form-row"><label>Category<select name="category" defaultValue={prefill?.category}>{PRODUCT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><label>Days until expiry<input name="days" type="number" defaultValue="90" min="1" max="3650" /></label></div>
      <div className="sheet-actions"><button type="button" className="scan-button" onClick={switchToBarcode}>Enter barcode instead</button><button className="primary-button" type="submit">Add product</button></div>
    </form></section>
  </div>;
}
