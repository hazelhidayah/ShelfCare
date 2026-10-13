"use client";

import { FormEvent, useState } from "react";
import { CalendarCheckIn, CalendarDay } from "@/src/domain/models";

const skinOptions: CalendarCheckIn["skinStatus"][] = ["Calm", "Glowy", "Dry", "Sensitive"];
const productOptions = ["Gentle Cleanser", "Snail 96 Essence", "Vitamin C Serum", "Barrier Cream", "Daily UV Defense"];

export function CheckInSheet({ day, onClose, onSave }: { day: CalendarDay; onClose: () => void; onSave: (input: CalendarCheckIn) => Promise<void> }) {
  const [skinStatus, setSkinStatus] = useState<CalendarCheckIn["skinStatus"]>(day.skinStatus === "Unlogged" ? "Calm" : day.skinStatus);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([...day.productsUsed]);
  const [saving, setSaving] = useState(false);

  const toggleProduct = (product: string) => setSelectedProducts((current) => current.includes(product) ? current.filter((item) => item !== product) : [...current, product]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    await onSave({
      date: day.date,
      skinStatus,
      mood: String(form.get("mood") ?? "Good"),
      routineCompleted: Number(form.get("routineCompleted") ?? 0),
      routineTotal: 5,
      productsUsed: selectedProducts,
      note: String(form.get("note") ?? ""),
    });
    setSaving(false);
  };

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Daily skin check-in"><button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet checkin-sheet"><div className="sheet-handle" /><form onSubmit={submit}>
      <span className="card-kicker">DAILY CHECK-IN</span><h2>How is your skin?</h2><p>A quick log helps reveal patterns over time.</p>
      <fieldset><legend>Skin today</legend><div className="choice-chips">{skinOptions.map((option) => <button key={option} type="button" className={skinStatus === option ? "selected" : ""} onClick={() => setSkinStatus(option)} aria-pressed={skinStatus === option}>{option}</button>)}</div></fieldset>
      <div className="checkin-row"><label>Mood<select name="mood" defaultValue={day.skinStatus === "Unlogged" ? "Good" : day.mood}><option>Good</option><option>Rested</option><option>Bright</option><option>Tired</option><option>Stressed</option></select></label><label>Routine steps<input name="routineCompleted" type="number" min="0" max="5" defaultValue={day.routineCompleted} /></label></div>
      <fieldset><legend>Products used</legend><div className="product-chips">{productOptions.map((product) => <button key={product} type="button" className={selectedProducts.includes(product) ? "selected" : ""} onClick={() => toggleProduct(product)} aria-pressed={selectedProducts.includes(product)}>{product}</button>)}</div></fieldset>
      <label>Quick note<textarea name="note" rows={2} defaultValue={day.note ?? ""} placeholder="Anything feel different today?" /></label>
      <button className="primary-button checkin-save" disabled={saving}>{saving ? "Saving…" : "Save check-in"}</button>
    </form></section>
  </div>;
}
