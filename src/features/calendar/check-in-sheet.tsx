"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarCheckIn, CalendarDay, Product } from "@/src/domain/models";
import { SheetCloseButton, useSheetClose } from "@/src/ui/sheet-controls";

const skinOptions: CalendarCheckIn["skinStatus"][] = ["Calm", "Glowy", "Dry", "Sensitive"];

type Props = {
  day: CalendarDay;
  products: readonly Product[];
  routineCompleted: number;
  routineTotal: number;
  onClose: () => void;
  onSave: (input: CalendarCheckIn) => Promise<void>;
};

export function CheckInSheet({ day, products, routineCompleted, routineTotal, onClose, onSave }: Props) {
  const [skinStatus, setSkinStatus] = useState<CalendarCheckIn["skinStatus"]>(day.skinStatus === "Unlogged" ? "Calm" : day.skinStatus);
  const [selectedIds, setSelectedIds] = useState<string[]>(day.productsUsed.map((item) => item.id));
  const [overrideRoutine, setOverrideRoutine] = useState(day.skinStatus !== "Unlogged" && (day.routineCompleted !== routineCompleted || day.routineTotal !== routineTotal));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const requestClose = useSheetClose(onClose, dirty);
  const selectedProducts = useMemo(() => products.filter((product) => selectedIds.includes(product.id)).map(({ id, name }) => ({ id, name })), [products, selectedIds]);

  const toggleProduct = (id: string) => { setDirty(true); setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    await onSave({
      date: day.date,
      skinStatus,
      mood: String(form.get("mood") ?? "Good"),
      routineCompleted: overrideRoutine ? Number(form.get("routineCompleted") ?? 0) : routineCompleted,
      routineTotal,
      productsUsed: selectedProducts,
      note: String(form.get("note") ?? ""),
    });
    setSaving(false);
  };

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Daily skin check-in"><button className="modal-backdrop" onClick={requestClose} aria-label="Close check-in" />
    <section className="bottom-sheet checkin-sheet"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close check-in" /><form onSubmit={submit} onChange={() => setDirty(true)}>
      <h2>How is your skin?</h2><p>A quick log helps reveal patterns over time.</p>
      <fieldset><legend>Skin today</legend><div className="choice-chips">{skinOptions.map((option) => <button key={option} type="button" className={skinStatus === option ? "selected" : ""} onClick={() => { setSkinStatus(option); setDirty(true); }} aria-pressed={skinStatus === option}>{option}</button>)}</div></fieldset>
      <label>Mood<select name="mood" defaultValue={day.skinStatus === "Unlogged" ? "Good" : day.mood}><option>Good</option><option>Rested</option><option>Bright</option><option>Tired</option><option>Stressed</option></select></label>
      <div className="routine-sync-summary"><span><strong>{overrideRoutine ? day.routineCompleted : routineCompleted}/{routineTotal}</strong> routine steps</span><button type="button" onClick={() => { setOverrideRoutine((value) => !value); setDirty(true); }}>{overrideRoutine ? "Use live progress" : "Adjust"}</button></div>
      {overrideRoutine && <label>Completed steps<input name="routineCompleted" type="number" min="0" max={routineTotal} defaultValue={day.routineCompleted} /></label>}
      <fieldset><legend>Products used from your shelf</legend>{products.length === 0 ? <p className="empty-inline">Add products to your shelf to select them here.</p> : <div className="product-chips">{products.map((product) => <button key={product.id} type="button" className={selectedIds.includes(product.id) ? "selected" : ""} onClick={() => toggleProduct(product.id)} aria-pressed={selectedIds.includes(product.id)}>{product.name}</button>)}</div>}</fieldset>
      <label>Quick note<textarea name="note" rows={2} defaultValue={day.note ?? ""} placeholder="Anything feel different today?" /></label>
      <button className="primary-button checkin-save" disabled={saving}>{saving ? "Saving…" : "Save check-in"}</button>
    </form></section>
  </div>;
}
