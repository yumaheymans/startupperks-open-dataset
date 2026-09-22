#!/usr/bin/env node
/**
 * Regenerate the StartupPerks open-dataset snapshot from the live public export.
 *
 * No credentials are required: https://startupperks.co/api/dataset is public and read-only.
 * Run: `node generate.mjs`. Writes data/startupperks-dataset.{json,csv} and refreshes the
 * date stamp, statistics and examples in README.md. Refuses to overwrite the snapshot
 * if the API returns no records or the README's generated sections are absent.
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
  const readme = await readFile("README.md", "utf8");
  for (const section of ["STAMP", "CATALOG", "EXAMPLES"]) {
    if (!readme.includes(`<!--${section}-->`) || !readme.includes(`<!--/${section}-->`)) {
      throw new Error(`README is missing the ${section} generated section`);
    }
  }
  const records = json.records;
  const fmt = n => n.toLocaleString("en-US");
  const count = fmt(records.length);
  const providers = fmt(new Set(records.map(r => r.provider_slug)).size);
  const categories = new Map();
  const benefits = new Map();
  for (const r of records) {
    categories.set(r.category_label, (categories.get(r.category_label) || 0) + 1);
    benefits.set(r.benefit_type, (benefits.get(r.benefit_type) || 0) + 1);
  }
  const values = records.map(r => r.value_usd).filter(v => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median = values.length ? (values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2) : null;
  const siteLink = path => {
    const url = new URL(path, json.source);
    url.searchParams.set("utm_source", "github");
    url.searchParams.set("utm_medium", "readme");
    url.searchParams.set("utm_campaign", "open-dataset");
    return url.href;
  };
  const stats = `## What is in here

**${count} program records from ${providers} providers**, across ${categories.size} categories.
Each record carries the provider, benefit type, stated value, eligibility, geography,
confidence and source URL. Values are advertised terms, not guaranteed awards or additive savings.

- **Benefit types:** ${[...benefits].map(([label, n]) => `${label}: ${fmt(n)}`).join(", ")}.
- **Positive USD values:** ${fmt(values.length)} programs${median === null ? "." : `; median $${fmt(median)} and maximum $${fmt(values.at(-1))}.`}
- **Confidence:** ${fmt(records.filter(r => r.confidence === "high").length)} records carry the catalog's high-confidence classification; check each record's source and verification date before relying on current terms.

## Files

| File | Rows | Format |
|------|------|--------|
| data/startupperks-dataset.json | ${count} | JSON with metadata, field definitions and records |
| data/startupperks-dataset.csv | ${count} | CSV, one row per program |

See [DATA_DICTIONARY.md](DATA_DICTIONARY.md) for every field.

## Categories

| Category | Programs |
|----------|---------:|
${[...categories].sort((a, b) => b[1] - a[1]).map(([label, n]) => `| ${label} | ${fmt(n)} |`).join("\n")}
`;
  const exampleKeys = ["google-for-startups-cloud-program", "cloudflare-for-startups", "snowflake-startup-program-startup-accelerator"];
  const examples = `## A few of the programs

Terms in this snapshot, with links to their cited program pages:

${exampleKeys.map(key => records.find(r => r.key === key)).filter(Boolean).map(r => `- [${r.name}](${siteLink(r.url)})${r.value_text ? `: ${r.value_text}` : ""}`).join("\n")}
`;

  const csvRes = await fetch(`${BASE}?format=csv`);
  if (!csvRes.ok) throw new Error(`dataset CSV fetch failed: ${csvRes.status}`);
  const csv = await csvRes.text();

  await writeFile("data/startupperks-dataset.json", `${JSON.stringify(json, null, 2)}\n`);
  await writeFile("data/startupperks-dataset.csv", csv);

  // Keep the README's date stamp honest with the export it was built from.
  const gen = (json.generated_at || new Date().toISOString()).slice(0, 10);
  const ver = (json.last_verified || gen).slice(0, 10);
  const stamp = `<!--STAMP-->Generated ${gen}; newest per-record verification ${ver}. Dates vary by record.<!--/STAMP-->`;
  await writeFile("README.md", readme
    .replace(/<!--STAMP-->[\s\S]*?<!--\/STAMP-->/, () => stamp)
    .replace(/<!--CATALOG-->[\s\S]*?<!--\/CATALOG-->/, () => `<!--CATALOG-->\n${stats}<!--/CATALOG-->`)
    .replace(/<!--EXAMPLES-->[\s\S]*?<!--\/EXAMPLES-->/, () => `<!--EXAMPLES-->\n${examples}<!--/EXAMPLES-->`));

  console.log(`Wrote ${json.records.length} programs. Generated ${gen}, verified ${ver}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
