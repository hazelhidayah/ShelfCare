"use client";

import { useState } from "react";
import { IngredientFinding, Product } from "@/src/domain/models";
import { IngredientService, ReminderService } from "@/src/services/contracts";
import { SheetCloseButton, useSheetClose } from "@/src/ui/sheet-controls";

export function ProductDetailsSheet({ product, ingredients, reminders, onClose, onNotice }: { product: Product; ingredients: IngredientService; reminders: ReminderService; onClose: () => void; onNotice: (message: string) => void }) {
  const [findings, setFindings] = useState<readonly IngredientFinding[] | null>(null);
  const requestClose = useSheetClose(onClose);
  const analyze = async () => {
    if (product.ingredients.length === 0) { onNotice("No ingredient list is saved for this product yet"); return; }
    const result = await ingredients.analyze(product.ingredients); if (result.ok) setFindings(result.value); else onNotice(result.error.message);
  };
  const remind = async () => { const result = await reminders.setExpiryReminder(product.id, 7); onNotice(result.ok ? "Expiry reminder set for 7 days before" : result.error.message); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`${product.name} details`}><button className="modal-backdrop" onClick={requestClose} aria-label="Close product details" />
    <section className="bottom-sheet detail-sheet"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close product details" /><h2>{product.name}</h2><p>{product.brand} · {product.category} · {product.daysLeft} days left</p><p className="detail-description">{product.description}</p>
      <div className="detail-actions"><button onClick={analyze}>Review ingredients</button><button onClick={remind}>Set expiry reminder</button></div>
      {findings && <div className="ingredient-results"><h3>Ingredient notes</h3>{findings.map((item) => <div key={item.ingredient} className={item.level}><strong>{item.ingredient}</strong><small>{item.reason}</small></div>)}</div>}
    </section></div>;
}
