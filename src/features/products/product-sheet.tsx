"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { BarcodeMatch, NewProduct, PRODUCT_CATEGORIES } from "@/src/domain/models";
import Image from "next/image";

export function ProductSheet({ prefill, onClose, onAdd, onScan }: { prefill: BarcodeMatch | null; onClose: () => void; onAdd: (product: NewProduct) => Promise<void>; onScan: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(prefill?.imageUrl ?? null);
  const loadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await onAdd({
      name: String(form.get("name") ?? ""), brand: String(form.get("brand") ?? ""),
      category: String(form.get("category")) as NewProduct["category"], daysLeft: Number(form.get("days")),
      barcode: prefill?.barcode, imageUrl, description: String(form.get("description") ?? ""),
    });
  };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Add a product">
    <button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet"><div className="sheet-handle" /><form onSubmit={submit}>
      <span className="card-kicker">{prefill ? "SCAN RESULT" : "NEW PRODUCT"}</span><h2>{prefill ? "We found your product" : "Add to your shelf"}</h2><p>{prefill ? "Review the details before adding it to your inventory." : "Track freshness, routines, and reminders."}</p>
      <div className="product-image-input">{imageUrl ? <Image src={imageUrl} alt="Product preview" width={76} height={76} unoptimized /> : <span>Product image</span>}<label><input type="file" accept="image/*" onChange={loadImage} />{imageUrl ? "Change photo" : "Upload photo"}</label></div>
      <label>Product name<input required name="name" defaultValue={prefill?.name} placeholder="e.g. Water Sleeping Mask" /></label>
      <label>Brand<input required name="brand" defaultValue={prefill?.brand} placeholder="e.g. Laneige" /></label>
      <label>Description<textarea name="description" rows={2} defaultValue={prefill?.description ?? ""} placeholder="Texture, finish, purpose…" /></label>
      <div className="form-row"><label>Category<select name="category" defaultValue={prefill?.category}>{PRODUCT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><label>Days until expiry<input name="days" type="number" defaultValue="90" min="1" max="3650" /></label></div>
      <div className="sheet-actions"><button type="button" className="scan-button" onClick={onScan}>▥ Scan instead</button><button className="primary-button" type="submit">Add product</button></div>
    </form></section>
  </div>;
}
