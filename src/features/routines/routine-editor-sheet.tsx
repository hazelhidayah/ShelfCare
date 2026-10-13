"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { RoutineStep } from "@/src/domain/models";

export function RoutineEditorSheet({ steps, onClose, onSave }: { steps: readonly RoutineStep[]; onClose: () => void; onSave: (steps: readonly RoutineStep[]) => Promise<void> }) {
  const [drafts, setDrafts] = useState<RoutineStep[]>(steps.map((step) => ({ ...step })));
  const [saving, setSaving] = useState(false);
  const update = (id: string, field: "name" | "instruction", value: string) => setDrafts((current) => current.map((step) => step.id === id ? { ...step, [field]: value } : step));
  const add = () => setDrafts((current) => [...current, { id: `step-${Date.now()}`, name: "", instruction: "", complete: false }]);
  const remove = (id: string) => setDrafts((current) => current.filter((step) => step.id !== id));
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); await onSave(drafts); setSaving(false); };

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Edit morning routine"><button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet routine-editor"><div className="sheet-handle" /><span className="card-kicker">EDIT ROUTINE</span><h2>Make it yours</h2><p>Update the steps and guidance shown in your morning routine.</p>
      <form onSubmit={submit}><div className="routine-edit-list">{drafts.map((step, index) => <div className="routine-edit-row" key={step.id}><span>{index + 1}</span><div><label>Step name<input required value={step.name} onChange={(event) => update(step.id, "name", event.target.value)} /></label><label>Guidance<input required value={step.instruction} onChange={(event) => update(step.id, "instruction", event.target.value)} /></label></div><button type="button" onClick={() => remove(step.id)} aria-label={`Remove ${step.name || `step ${index + 1}`}`} disabled={drafts.length === 1}><Trash2 aria-hidden="true" /></button></div>)}</div>
        <button type="button" className="add-routine-step" onClick={add}><Plus aria-hidden="true" /> Add another step</button><div className="sheet-actions"><button type="button" className="scan-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save routine"}</button></div>
      </form>
    </section></div>;
}
