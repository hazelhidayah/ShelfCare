const SHELFCARE_STORAGE_PREFIX = "shelflife.";

export function exportShelfCareData(): number {
  const data: Record<string, unknown> = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(SHELFCARE_STORAGE_PREFIX)) continue;
    const raw = window.localStorage.getItem(key);
    if (raw === null) continue;
    try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
  }

  const backup = { app: "ShelfCare", exportedAt: new Date().toISOString(), formatVersion: 1, data };
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `shelfcare-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return Object.keys(data).length;
}
