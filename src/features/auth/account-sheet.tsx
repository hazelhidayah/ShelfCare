"use client";

import { Cloud, Download, HardDrive, X } from "lucide-react";
import { AccountMode } from "./auth-flow";

export function AccountSheet({ mode, onClose, onOpenAuth, onExport }: { mode: AccountMode; onClose: () => void; onOpenAuth: () => void; onExport: () => void }) {
  const local = mode === "local";

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Account and data settings"><button className="modal-backdrop" onClick={onClose} aria-label="Close account settings" />
    <section className="bottom-sheet account-sheet">
      <div className="sheet-handle" />
      <div className="sheet-title"><div><span className="card-kicker">ACCOUNT & DATA</span><h2>{local ? "Saved on this device" : "Your data is synced"}</h2></div><button onClick={onClose} aria-label="Close account settings"><X /></button></div>
      <section className={`account-status ${local ? "local" : "synced"}`}>
        <span>{local ? <HardDrive aria-hidden="true" /> : <Cloud aria-hidden="true" />}</span>
        <div><strong>{local ? "Local mode" : "Online account"}</strong><p>{local ? "Your ShelfCare data is stored only in this browser. It is not uploaded or shared between devices." : "Your shelf, routines, and check-ins can be available whenever you sign in on another device."}</p></div>
      </section>
      {local && <section className="sync-benefit"><Cloud aria-hidden="true" /><div><strong>Want ShelfCare on every device?</strong><p>Create an account or sign in to save a secure online copy and keep your information in sync.</p></div></section>}
      {local && <button className="auth-primary account-sync-button" onClick={onOpenAuth}>Create account or sign in</button>}
      <button className="export-data-button" onClick={onExport}><Download aria-hidden="true" /><span><strong>Export my ShelfCare data</strong><small>Download a portable JSON backup</small></span><span aria-hidden="true">›</span></button>
      <p className="export-note">The export includes only ShelfCare information saved in this browser.</p>
    </section>
  </div>;
}
