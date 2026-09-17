#!/usr/bin/env node
/**
 * Regenerate the StartupPerks open-dataset snapshot from the live public export.
 *
 * No credentials are required: https://startupperks.co/api/dataset is public and read-only.
 * Run: `node generate.mjs`. Writes data/startupperks-dataset.{json,csv} and refreshes the
 * date stamp in README.md. Refuses to overwrite the snapshot if the API returns no records.
 */
import { writeFile, readFile } from "node:fs/promises";

const BASE = "https://startupperks.co/api/dataset";

async function main() {
  const jsonRes = await fetch(BASE, { headers: { accept: "application/json" } });
  if (!jsonRes.ok) throw new Error(`dataset JSON fetch failed: ${jsonRes.status}`);
  const json = await jsonRes.json();
  if (!Array.isArray(json.records) || json.records.length === 0) {
    throw new Error("dataset returned no records; refusing to overwrite the snapshot");
  }

  const csvRes = await fetch(`${BASE}?format=csv`);
  if (!csvRes.ok) throw new Error(`dataset CSV fetch failed: ${csvRes.status}`);
  const csv = await csvRes.text();

  await writeFile("data/startupperks-dataset.json", `${JSON.stringify(json, null, 2)}\n`);
  await writeFile("data/startupperks-dataset.csv", csv);

  // Keep the README's date stamp honest with the export it was built from.
  const gen = (json.generated_at || new Date().toISOString()).slice(0, 10);
  const ver = (json.last_verified || gen).slice(0, 10);
  const stamp = `<!--STAMP-->Generated ${gen}; data last verified against source ${ver}.<!--/STAMP-->`;
  const readme = await readFile("README.md", "utf8");
  await writeFile("README.md", readme.replace(/<!--STAMP-->[\s\S]*?<!--\/STAMP-->/, stamp));

  console.log(`Wrote ${json.records.length} programs. Generated ${gen}, verified ${ver}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
