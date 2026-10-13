"use client";

import { Heart, NotebookPen } from "lucide-react";
import { Insight } from "@/src/domain/models";

export function InsightNotebookSheet({ insights, onClose, onRemove }: { insights: readonly Insight[]; onClose: () => void; onRemove: (id: string) => void }) {
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Saved insights notebook"><button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet notebook-sheet"><div className="sheet-handle" /><span className="card-kicker">YOUR NOTEBOOK</span><h2>Saved insights</h2><p>Advice you wanted to keep, all in one place.</p>
      {insights.length === 0 ? <div className="notebook-empty"><NotebookPen aria-hidden="true" /><strong>Your notebook is ready.</strong><p>Tap the heart on a daily insight to save it here.</p></div> : <div className="saved-insights">{insights.map((insight) => <article key={insight.id}><div><span>{insight.category}</span><strong>{insight.title}</strong><p>{insight.body}</p></div><button onClick={() => onRemove(insight.id)} aria-label={`Remove ${insight.title} from favourites`}><Heart fill="currentColor" aria-hidden="true" /></button></article>)}</div>}
    </section></div>;
}
