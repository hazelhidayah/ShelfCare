"use client";

import { FormEvent, useEffect, useState } from "react";
import { BellRing, CircleHelp, ShieldCheck } from "lucide-react";
import { SheetCloseButton, useSheetClose } from "@/src/ui/sheet-controls";

const skinTypes = ["Oily", "Dry", "Combination", "Sensitive", "Not sure"];
const goals = ["Reduce acne", "Improve hydration", "Brighten complexion", "Support healthy ageing"];

export function SkinProfileSheet({ initialSkin, initialGoals, onClose, onSave }: { initialSkin: string; initialGoals: readonly string[]; onClose: () => void; onSave: (skin: string, goals: readonly string[]) => void }) {
  const [skin, setSkin] = useState(initialSkin);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([...initialGoals]);
  const dirty = skin !== initialSkin || selectedGoals.join("|") !== initialGoals.join("|");
  const requestClose = useSheetClose(onClose, dirty);
  const submit = (event: FormEvent) => { event.preventDefault(); onSave(skin, selectedGoals); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Skin profile settings"><button className="modal-backdrop" onClick={requestClose} aria-label="Close skin profile" /><section className="bottom-sheet preferences-sheet"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close skin profile" /><div className="settings-sheet-icon"><ShieldCheck aria-hidden="true" /></div><h2>Skin profile</h2><p>These details help keep ingredient notes and care tips relevant to you.</p><form onSubmit={submit}><fieldset><legend>Skin type</legend><div className="choice-chips">{skinTypes.map((option) => <button type="button" key={option} className={skin === option ? "selected" : ""} aria-pressed={skin === option} onClick={() => setSkin(option)}>{option}</button>)}</div></fieldset><fieldset><legend>Care goals</legend><div className="product-chips">{goals.map((goal) => <button type="button" key={goal} className={selectedGoals.includes(goal) ? "selected" : ""} aria-pressed={selectedGoals.includes(goal)} onClick={() => setSelectedGoals((current) => current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal])}>{goal}</button>)}</div></fieldset><button className="primary-button checkin-save">Save profile</button></form></section></div>;
}

type ReminderPreferences = { expiry: boolean; routine: boolean; insight: boolean };
const defaultReminders: ReminderPreferences = { expiry: true, routine: false, insight: false };

export function ReminderPreferencesSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [preferences, setPreferences] = useState(defaultReminders);
  const [initial, setInitial] = useState(defaultReminders);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const saved = JSON.parse(window.localStorage.getItem("shelflife.reminder-preferences") ?? "null") as Partial<ReminderPreferences> | null; if (saved) { const next = { ...defaultReminders, ...saved }; setPreferences(next); setInitial(next); } } catch { /* Safe defaults remain selected. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const dirty = JSON.stringify(preferences) !== JSON.stringify(initial);
  const requestClose = useSheetClose(onClose, dirty);
  const save = () => { window.localStorage.setItem("shelflife.reminder-preferences", JSON.stringify(preferences)); setInitial(preferences); onSaved(); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Reminder preferences"><button className="modal-backdrop" onClick={requestClose} aria-label="Close reminder preferences" /><section className="bottom-sheet preferences-sheet"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close reminder preferences" /><div className="settings-sheet-icon"><BellRing aria-hidden="true" /></div><h2>Reminder preferences</h2><p>Choose which gentle nudges you want from ShelfCare.</p><div className="toggle-list">{([['expiry', 'Expiry reminders', 'A heads-up before tracked products expire.'], ['routine', 'Routine reminders', 'A daily prompt for your morning or night routine.'], ['insight', 'Weekly insights', 'A short recap of patterns in your diary.']] as const).map(([key, title, description]) => <label key={key}><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} /></label>)}</div><button className="primary-button checkin-save" onClick={save}>Save reminders</button></section></div>;
}

export function HelpSheet({ onClose }: { onClose: () => void }) {
  const requestClose = useSheetClose(onClose);
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Help and about ShelfCare"><button className="modal-backdrop" onClick={requestClose} aria-label="Close help" /><section className="bottom-sheet preferences-sheet help-sheet"><div className="sheet-handle" /><SheetCloseButton onClose={requestClose} label="Close help" /><div className="settings-sheet-icon"><CircleHelp aria-hidden="true" /></div><h2>Help & about</h2><p>ShelfCare keeps your beauty shelf, routines, and skin diary in one calm place.</p><article><h3>How shelf health works</h3><p>Your score has a 56-point baseline, plus up to 44 points based on the share of products with at least 30 days remaining. A shelf where every product has 30 days or more scores 100.</p></article><article><h3>Where your data lives</h3><p>In local mode, your data stays in this browser. Use Account & data to export a backup or create an account for cross-device sync.</p></article><article><h3>Barcode lookup</h3><p>Enter the digits printed below a barcode. If ShelfCare does not have a match, you can add the product manually.</p></article></section></div>;
}
