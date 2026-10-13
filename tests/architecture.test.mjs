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
