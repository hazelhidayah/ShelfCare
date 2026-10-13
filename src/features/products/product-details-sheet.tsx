"use client";

import { useState } from "react";
import { IngredientFinding, Product } from "@/src/domain/models";
import { IngredientService, ReminderService } from "@/src/services/contracts";

const demoIngredients = ["Water", "Glycerin", "Niacinamide", "Fragrance"];

export function ProductDetailsSheet({ product, ingredients, reminders, onClose, onNotice }: { product: Product; ingredients: IngredientService; reminders: ReminderService; onClose: () => void; onNotice: (message: string) => void }) {
  const [findings, setFindings] = useState<readonly IngredientFinding[] | null>(null);
  const analyze = async () => { const result = await ingredients.analyze(demoIngredients); if (result.ok) setFindings(result.value); else onNotice(result.error.message); };
  const remind = async () => { const result = await reminders.setExpiryReminder(product.id, 7); onNotice(result.ok ? "Expiry reminder set for 7 days before" : result.error.message); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`${product.name} details`}><button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet detail-sheet"><div className="sheet-handle" /><span className="card-kicker">PRODUCT TRACKING SERVICE</span><h2>{product.name}</h2><p>{product.brand} · {product.category} · {product.daysLeft} days left</p>
      <div className="detail-actions"><button onClick={analyze}>⌁ Analyze ingredients</button><button onClick={remind}>◷ Set reminder</button></div>
      {findings && <div className="ingredient-results"><span className="card-kicker">INGREDIENT SERVICE RESULT</span>{findings.map((item) => <div key={item.ingredient} className={item.level}><strong>{item.ingredient}</strong><small>{item.reason}</small></div>)}</div>}
    </section></div>;
}
