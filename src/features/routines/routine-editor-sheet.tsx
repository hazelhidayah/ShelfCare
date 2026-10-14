"use client";

import { CSSProperties, DragEvent as ReactDragEvent, FormEvent, PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { MAX_ROUTINE_STEPS, RoutinePeriod, RoutineStep } from "@/src/domain/models";

type SwipeGesture = { id: string; startX: number; startY: number; axis: "x" | "y" | null };

export function RoutineEditorSheet({ period, steps, onClose, onSave }: { period: RoutinePeriod; steps: readonly RoutineStep[]; onClose: () => void; onSave: (steps: readonly RoutineStep[]) => Promise<void> }) {
  const [drafts, setDrafts] = useState<RoutineStep[]>(steps.map((step) => ({ ...step })));
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({});
  const activeDrag = useRef<string | null>(null);
  const swipeGesture = useRef<SwipeGesture | null>(null);
  const swipeOffsetsRef = useRef<Record<string, number>>({});

  const update = (id: string, field: "name" | "instruction", value: string) => setDrafts((current) => current.map((step) => step.id === id ? { ...step, [field]: value } : step));
  const add = () => setDrafts((current) => current.length >= MAX_ROUTINE_STEPS ? current : [...current, { id: `step-${Date.now()}`, name: "", instruction: "", complete: false }]);
  const remove = (id: string) => {
    setDrafts((current) => current.length === 1 ? current : current.filter((step) => step.id !== id));
    const nextOffsets = { ...swipeOffsetsRef.current }; delete nextOffsets[id]; swipeOffsetsRef.current = nextOffsets;
    setSwipeOffsets((current) => { const next = { ...current }; delete next[id]; return next; });
  };
  const reorder = (sourceId: string, targetId: string) => setDrafts((current) => {
    const from = current.findIndex((step) => step.id === sourceId);
    const to = current.findIndex((step) => step.id === targetId);
    if (from < 0 || to < 0 || from === to) return current;
    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  });
  const moveBy = (id: string, offset: number) => setDrafts((current) => {
    const from = current.findIndex((step) => step.id === id);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= current.length) return current;
    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  });
  const beginDrag = (id: string) => { activeDrag.current = id; setDraggingId(id); };
  const endDrag = () => { activeDrag.current = null; setDraggingId(null); };
  const dragStart = (event: ReactDragEvent<HTMLDivElement>, id: string) => {
    if (!(event.target as Element).closest(".routine-drag-handle")) { event.preventDefault(); return; }
    beginDrag(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };
  const drop = (event: ReactDragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || activeDrag.current;
    if (sourceId) reorder(sourceId, targetId);
    endDrag();
  };
  const dragPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!activeDrag.current) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-routine-id]");
    if (target?.dataset.routineId) reorder(activeDrag.current, target.dataset.routineId);
  };
  const swipeStart = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    if ((event.target as Element).closest("button,input")) return;
    swipeGesture.current = { id, startX: event.clientX, startY: event.clientY, axis: null };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const swipeMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = swipeGesture.current;
    if (!gesture) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (!gesture.axis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 8) gesture.axis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
    if (gesture.axis !== "x") return;
    event.preventDefault();
    setSwipingId(gesture.id);
    const offset = Math.max(-96, Math.min(0, deltaX));
    swipeOffsetsRef.current = { ...swipeOffsetsRef.current, [gesture.id]: offset };
    setSwipeOffsets((current) => ({ ...current, [gesture.id]: offset }));
  };
  const swipeEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = swipeGesture.current;
    if (!gesture) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const shouldDelete = (swipeOffsetsRef.current[gesture.id] ?? 0) <= -72 && drafts.length > 1;
    swipeGesture.current = null;
    setSwipingId(null);
    if (shouldDelete) remove(gesture.id);
    else { swipeOffsetsRef.current = { ...swipeOffsetsRef.current, [gesture.id]: 0 }; setSwipeOffsets((current) => ({ ...current, [gesture.id]: 0 })); }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); await onSave(drafts); setSaving(false); };

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`Edit ${period} routine`}><button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet routine-editor"><div className="sheet-handle" /><span className="card-kicker">EDIT {period.toUpperCase()} ROUTINE</span><h2>Make it yours</h2><p>Update the steps and guidance shown in your {period} routine.</p><div className="routine-limit-row"><span>{drafts.length} of {MAX_ROUTINE_STEPS} steps</span><small aria-live="polite">{drafts.length >= MAX_ROUTINE_STEPS ? "Maximum reached" : `${MAX_ROUTINE_STEPS - drafts.length} available`}</small></div>
      <form onSubmit={submit}><div className="routine-edit-list">{drafts.map((step, index) => <div className="routine-swipe-shell" key={step.id} data-routine-id={step.id} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => drop(event, step.id)}><div className="routine-delete-underlay" aria-hidden="true"><Trash2 /><span>Delete</span></div><div className={`routine-edit-row ${draggingId === step.id ? "dragging" : ""} ${swipingId === step.id ? "swiping" : ""}`} draggable onDragStart={(event) => dragStart(event, step.id)} onDragEnd={endDrag} onPointerDown={(event) => swipeStart(event, step.id)} onPointerMove={swipeMove} onPointerUp={swipeEnd} onPointerCancel={swipeEnd} style={{ "--swipe-x": `${swipeOffsets[step.id] ?? 0}px` } as CSSProperties}><span className="routine-step-number">{index + 1}</span><div className="routine-step-fields"><label>Step name<input required value={step.name} onChange={(event) => update(step.id, "name", event.target.value)} /></label><label>Guidance<input required value={step.instruction} onChange={(event) => update(step.id, "instruction", event.target.value)} /></label></div><div className="routine-row-actions"><button type="button" className="routine-drag-handle" onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); beginDrag(step.id); }} onPointerMove={dragPointerMove} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); endDrag(); }} onPointerCancel={endDrag} onKeyDown={(event) => { if (event.key === "ArrowUp") { event.preventDefault(); moveBy(step.id, -1); } if (event.key === "ArrowDown") { event.preventDefault(); moveBy(step.id, 1); } }} aria-label={`Reorder ${step.name || `step ${index + 1}`}. Position ${index + 1} of ${drafts.length}. Use up and down arrow keys to move.`}><GripVertical aria-hidden="true" /></button><button type="button" className="remove-routine-step" onClick={() => remove(step.id)} aria-label={`Remove ${step.name || `step ${index + 1}`}`} disabled={drafts.length === 1}><Trash2 aria-hidden="true" /></button></div></div></div>)}</div>
        <button type="button" className="add-routine-step" onClick={add} disabled={drafts.length >= MAX_ROUTINE_STEPS}><Plus aria-hidden="true" /> {drafts.length >= MAX_ROUTINE_STEPS ? `Maximum ${MAX_ROUTINE_STEPS} steps reached` : "Add another step"}</button><div className="sheet-actions"><button type="button" className="scan-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving || drafts.length === 0}>{saving ? "Saving…" : "Save routine"}</button></div>
      </form>
    </section></div>;
}
