import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(new URL("..", import.meta.url).pathname);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? filesUnder(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return nested.flat();
}

test("declares one contract for every bounded service", async () => {
  const contracts = await readFile(path.join(root, "src/services/contracts.ts"), "utf8");
  for (const service of ["ProductTrackingService", "BarcodeService", "IngredientService", "RoutineService", "ReminderService", "CommunityService", "InsightService", "CalendarService"]) assert.match(contracts, new RegExp(`interface ${service}`));
});

test("feature modules never depend on concrete service adapters", async () => {
  const files = (await filesUnder(path.join(root, "src/features"))).filter((file) => /\.tsx?$/.test(file));
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /services\/local/, `${path.relative(root, file)} bypasses a service contract`);
  }
});

test("only the composition root constructs service adapters", async () => {
  const files = (await filesUnder(path.join(root, "src"))).filter((file) => /\.tsx?$/.test(file) && !file.endsWith("container.ts") && !file.includes(`${path.sep}services${path.sep}local${path.sep}`));
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /new Local\w+Service/, `${path.relative(root, file)} bypasses the composition root`);
  }
});

test("routine limits are shared by the editor and service", async () => {
  const models = await readFile(path.join(root, "src/domain/models.ts"), "utf8");
  const editor = await readFile(path.join(root, "src/features/routines/routine-editor-sheet.tsx"), "utf8");
  const service = await readFile(path.join(root, "src/services/local/routine-service.ts"), "utf8");
  assert.match(models, /MAX_ROUTINE_STEPS = 15/);
  assert.match(editor, /MAX_ROUTINE_STEPS/);
  assert.match(service, /clean\.length > MAX_ROUTINE_STEPS/);
});

test("data exports are restricted to ShelfCare storage", async () => {
  const exporter = await readFile(path.join(root, "src/features/auth/export-local-data.ts"), "utf8");
  assert.match(exporter, /SHELFCARE_STORAGE_PREFIX = "shelflife\."/);
  assert.match(exporter, /startsWith\(SHELFCARE_STORAGE_PREFIX\)/);
});
