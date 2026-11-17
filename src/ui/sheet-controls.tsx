"use client";

import { X } from "lucide-react";
import { useCallback, useEffect } from "react";

export function useSheetClose(onClose: () => void, dirty = false) {
  const requestClose = useCallback(() => {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    onClose();
  }, [dirty, onClose]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); requestClose(); }
      if (event.key !== "Tab") return;

      const dialogs = document.querySelectorAll<HTMLElement>('.modal-layer[role="dialog"]');
      const dialog = dialogs.item(dialogs.length - 1);
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter((element) => element.getAttribute("aria-hidden") !== "true" && element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleKey);
    const frame = window.requestAnimationFrame(() => {
      const dialogs = document.querySelectorAll<HTMLElement>('.modal-layer[role="dialog"]');
      dialogs.item(dialogs.length - 1)?.querySelector<HTMLElement>(".sheet-close-button")?.focus();
    });
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("keydown", handleKey); };
  }, [requestClose]);

  return requestClose;
}

export function SheetCloseButton({ onClose, label = "Close" }: { onClose: () => void; label?: string }) {
  return <button type="button" className="sheet-close-button" onClick={onClose} aria-label={label}><X aria-hidden="true" /></button>;
}
