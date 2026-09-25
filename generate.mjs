#!/usr/bin/env node
/**
 * Regenerate the StartupPerks open dataset AND its browsable lists from the live public export.
 *
 * No credentials are required: https://startupperks.co/api/dataset is public and read-only.
 * Run: `node generate.mjs`. Writes data/startupperks-dataset.{json,csv}, one Markdown list per
 * category plus cross-category lists in lists/, and refreshes the date stamp, the list index and
 * the statistics in README.md. Refuses to overwrite anything if the API returns no records or the
 * README's generated sections are absent.
 *
 * Every row is rendered from the export's own fields. Nothing is summarised by hand, so a list can
 * never disagree with the dataset it ships beside.
 */
import { writeFile, readFile, mkdir } from "node:fs/promises";

const BASE = "https://startupperks.co/api/dataset";
const LIST_DIR = "lists";

/** One list per dataset category. `topic` describes what the category holds; titles match how people search. */
const CATEGORY_LISTS = [
  { category: "ai-ml", file: "ai-and-ml.md", title: "AI Startup Credits and Perks: LLM APIs, Inference, GPUs and Voice AI", topic: "AI and ML products: LLM and inference APIs, AI and GPU clouds, speech and voice AI, and generative media platforms" },
  { category: "cloud-infra", file: "cloud-and-infrastructure.md", title: "Cloud Credits for Startups: AWS, Google Cloud, Azure, GPU Clouds and More", topic: "cloud and infrastructure: hyperscalers, GPU clouds, hosting and platforms, storage, CDN and edge" },
  { category: "dev-tools", file: "developer-tools.md", title: "Developer Tool Perks for Startups: Observability, CI/CD, APIs and Internal Tools", topic: "developer tools: observability, API platforms, experimentation and product analytics, internal tools and CI/CD" },
  { category: "databases-data", file: "databases-and-data.md", title: "Database and Data Platform Credits for Startups", topic: "databases and data: warehouses, managed databases, data pipelines and BI" },
  { category: "banking-fintech", file: "banking-and-fintech.md", title: "Startup Banking and Fintech Perks: Business Accounts, Cards and Payments", topic: "banking and fintech: business accounts, corporate cards, payments and treasury" },
  { category: "finance-ops", file: "finance-and-ops.md", title: "Finance and Operations Perks for Startups: Accounting, Tax and Incorporation", topic: "finance and operations: accounting and tax, incorporation and compliance, spend management and back office" },
  { category: "marketing-sales", file: "marketing-and-sales.md", title: "Marketing and Sales Tools for Startups: CRM, Analytics and Messaging Credits", topic: "marketing and sales: CRM, product analytics, messaging and communications APIs, email and sales tools" },
  { category: "productivity-saas", file: "productivity-and-saas.md", title: "Productivity and SaaS Deals for Startups", topic: "productivity and SaaS: content management, project management, collaboration, no-code, automation and e-signature" },
  { category: "security-legal-hr", file: "security-legal-and-hr.md", title: "Security, Compliance, Legal and HR Perks for Startups", topic: "security, legal and HR: compliance automation, identity and verification, password management, security testing and global HR" },
];

/** Programs whose only gate is being a startup (or incorporated): no investor backing, no referral. */
const NO_VC_GATES = new Set(["Any startup", "No funding needed", "Incorporated"]);

const SECTIONS = [
  { type: "Credits", heading: "Credits" },
  { type: "Discount", heading: "Discounts" },
  { type: "Program", heading: "Programs" },
  { type: "Cash & rewards", heading: "Cash and rewards" },
  { type: "Free plan", heading: "Free plans" },
];

const ELIGIBILITY = {
  "Any startup": "Any startup",
  "No funding needed": "No funding required",
  "Incorporated": "Incorporated companies",
  "VC / accelerator-backed": "VC- or accelerator-backed",
  "Accelerator-backed": "Accelerator-backed",
  "Referral required": "Partner referral required",
};
const STAGES = ["idea", "pre-seed", "seed", "series-a", "series-b-plus"];
const STAGE_LABEL = { idea: "idea", "pre-seed": "pre-seed", seed: "seed", "series-a": "Series A", "series-b-plus": "Series B+" };
const REGION_ALIAS = { US: "United States", UK: "United Kingdom", UAE: "United Arab Emirates", "Asia Pacific": "Asia-Pacific", cis: "CIS" };

const fmt = (n) => n.toLocaleString("en-US");
const compactUsd = (n) => (n >= 1_000_000 ? `$${+(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${+(n / 1_000).toFixed(1)}K` : `$${fmt(n)}`);
/** Table-safe text: one line, no stray pipes, no link-breaking brackets, no em dashes (house style). */
const cell = (s) => String(s ?? "").replace(/\s*\u2014\s*/g, ", ").replace(/\s+/g, " ").trim().replace(/\|/g, "\\|");
const linkText = (s) => cell(s).replace(/([[\]])/g, "\\$1");
/** Program names are sometimes generic ("Free Plan", "Fast Forward"); lead those with the provider. */
const NAME_NOISE = new Set(["the", "inc", "cloud", "for", "and", "labs", "app", "com", "startup", "startups", "program", "free", "plan", "business", "group", "technologies", "technology", "software", "systems", "platform", "ltd", "llc", "gmbh"]);
function displayName(r) {
  const provider = String(r.provider ?? "").replace(/\s*\([^)]*\)/g, "").trim();
  const name = String(r.name ?? "");
  const lower = name.toLowerCase();
  const tokens = String(r.provider ?? "").toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !NAME_NOISE.has(t));
  const named = !provider || lower.includes(provider.toLowerCase()) || tokens.some((t) => lower.includes(t));
  return named ? name : `${provider}: ${name}`;
}
const anchor = (heading) => heading.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-");

function region(geographies) {
  const names = [...new Set((geographies || []).map((g) => {
    const alias = REGION_ALIAS[g] ?? g;
    return alias === alias.toLowerCase() ? alias.replace(/\b\w/g, (c) => c.toUpperCase()) : alias;
  }))];
  if (names.length === 0) return "Global";
  return names.length > 3 ? `${names.slice(0, 3).join(", ")} +${names.length - 3} more` : names.join(", ");
}

function stageRange(stages) {
  const idx = [...new Set(stages || [])].map((s) => STAGES.indexOf(s)).filter((i) => i >= 0).sort((a, b) => a - b);
  if (idx.length === 0 || (stages || []).includes("any") || idx.length === STAGES.length) return null;
  if (idx.length === 1) return `${STAGE_LABEL[STAGES[idx[0]]]} stage`;
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  return contiguous
    ? `${STAGE_LABEL[STAGES[idx[0]]]} to ${STAGE_LABEL[STAGES[idx.at(-1)]]}`
    : idx.map((i) => STAGE_LABEL[STAGES[i]]).join(", ");
}

function whoQualifies(r) {
  const parts = [ELIGIBILITY[r.eligibility] ?? r.eligibility];
  const stage = stageRange(r.stages);
  if (stage) parts.push(stage);
  if (Number.isFinite(r.max_company_age_years) && r.max_company_age_years > 0) {
    parts.push(`under ${r.max_company_age_years} year${r.max_company_age_years === 1 ? "" : "s"} old`);
  }
  if (Number.isFinite(r.max_funding_raised_usd) && r.max_funding_raised_usd > 0) {
    parts.push(`raised under ${compactUsd(r.max_funding_raised_usd)}`);
  }
  return parts.filter(Boolean).join("; ");
}

/** Largest stated USD value first; unpriced benefits after, alphabetically. */
const byValue = (a, b) => (b.value_usd ?? -1) - (a.value_usd ?? -1) || a.name.localeCompare(b.name);

async function main() {
  const jsonRes = await fetch(BASE, { headers: { accept: "application/json" } });
  if (!jsonRes.ok) throw new Error(`dataset JSON fetch failed: ${jsonRes.status}`);
  const json = await jsonRes.json();
  if (!Array.isArray(json.records) || json.records.length === 0) {
    throw new Error("dataset returned no records; refusing to overwrite the snapshot");
  }
  const readme = await readFile("README.md", "utf8");
  for (const section of ["STAMP", "LISTS", "CATALOG"]) {
    if (!readme.includes(`<!--${section}-->`) || !readme.includes(`<!--/${section}-->`)) {
      throw new Error(`README is missing the ${section} generated section`);
    }
  }
  const records = json.records;
  const gen = (json.generated_at || new Date().toISOString()).slice(0, 10);
  const ver = (json.last_verified || gen).slice(0, 10);
  const year = gen.slice(0, 4);
  const recentSince = new Date(new Date(gen).getTime() - 30 * 86_400_000).toISOString().slice(0, 10);

  const siteLink = (path, medium) => {
    const url = new URL(path, json.source);
    url.searchParams.set("utm_source", "github");
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", "open-dataset");
    return url.href;
  };
  const matcher = (medium) => siteLink("/", medium);

  function row(r) {
    const href = r.source_url || r.apply_url;
    const status = r.application_status === "paused" ? " (applications paused)"
      : r.application_status === "closed" ? " (applications closed)" : "";
    const program = href ? `[${linkText(displayName(r))}](${href})${status}` : `${linkText(displayName(r))}${status}`;
    return `| ${program} | ${cell(r.value_text) || "See provider page"} | ${cell(whoQualifies(r))} | ${cell(region(r.geographies))} | [Details](${siteLink(r.url, "list")}) |`;
  }

  function renderList({ title, intro, rows }) {
    const sections = SECTIONS.map((s) => ({ ...s, rows: rows.filter((r) => r.benefit_type === s.type).sort(byValue) }))
      .filter((s) => s.rows.length > 0);
    const other = rows.filter((r) => !SECTIONS.some((s) => s.type === r.benefit_type)).sort(byValue);
    if (other.length > 0) sections.push({ heading: "Other benefits", rows: other });
    const recent = rows.filter((r) => r.last_verified && r.last_verified.slice(0, 10) >= recentSince).length;
    const jump = sections.map((s) => `[${s.heading}](#${anchor(s.heading)}) (${fmt(s.rows.length)})`).join(" · ");
    return `# ${title} (${year})

${intro} Each program links to the provider's own page, where its terms are published. **Details** opens the program's StartupPerks page with eligibility, verification notes and similar programs.

Generated ${gen} from the [StartupPerks open dataset](../README.md). ${fmt(recent)} of these ${fmt(rows.length)} programs were re-checked against the provider's page in the 30 days before that date; terms change, so confirm on the provider's page before you apply.

${sections.length > 1 ? `**Jump to:** ${jump}\n\n` : ""}> Want only the programs your startup qualifies for? [Describe your startup on StartupPerks](${matcher("list")}) and it ranks the ones you can actually get.

${sections.map((s) => `## ${s.heading}

Programs with a comparable US dollar figure come first, largest first; the rest (credit units, percentages, other currencies, free tiers) follow alphabetically. Stated values are advertised maximums, not guaranteed awards, and they do not add up across programs.

| Program | Stated value | Who qualifies | Region | More |
|---------|--------------|---------------|--------|------|
${s.rows.map(row).join("\n")}
`).join("\n")}
---

Data: [StartupPerks open dataset](../README.md), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit **StartupPerks** with a link to <https://startupperks.co> when you reuse it. More lists: [browse all](../README.md#browse-the-lists).
`;
  }

  const lists = [];
  for (const def of CATEGORY_LISTS) {
    const rows = records.filter((r) => r.category === def.category);
    if (rows.length === 0) continue;
    lists.push({
      label: def.title.split(":")[0],
      file: def.file,
      rows,
      body: renderList({ title: def.title, intro: `${fmt(rows.length)} startup programs for ${def.topic}.`, rows }),
    });
  }
  const noVc = records.filter((r) => r.benefit_type === "Credits" && NO_VC_GATES.has(r.eligibility));
  lists.push({
    label: "Startup credits you can get without VC funding",
    file: "no-vc-funding-required.md",
    rows: noVc,
    body: renderList({
      title: "Startup Credits You Can Get Without VC Funding",
      intro: `${fmt(noVc.length)} credit programs whose only stated gate is being a startup (or an incorporated company): no investor backing and no partner referral required. Useful for bootstrapped and pre-funding teams. Some still cap company age, stage or funding raised; the **Who qualifies** column says so.`,
      rows: noVc,
    }),
  });
  for (const l of lists) {
    if (l.rows.length === 0) throw new Error(`list ${l.file} is empty; refusing to publish it`);
  }

  // Index table for the README: every list, its size, and its three largest named programs. Only programs
  // that state a US dollar value can be "largest"; unpriced ones sort alphabetically and are never named here.
  const includes = (rows) => {
    const priced = [...new Set([...rows].filter((r) => r.value_usd > 0).sort(byValue).map((r) => r.provider))].slice(0, 3);
    return priced.length ? priced.join(", ") : "Mostly free plans and non-USD benefits";
  };
  const listIndex = `## Browse the lists

${fmt(records.length)} programs, one Markdown list per category plus cross-category lists, each program linked to the provider's own page:

| List | Programs | Largest stated values include |
|------|---------:|-------------------------------|
${lists.map((l) => `| [${l.label}](${LIST_DIR}/${l.file}) | ${fmt(l.rows.length)} | ${cell(includes(l.rows))} |`).join("\n")}

Looking for the ones your startup qualifies for? [Describe your startup](${matcher("readme")}) and StartupPerks ranks the programs you can actually get.
`;

  const providers = fmt(new Set(records.map((r) => r.provider_slug)).size);
  const categories = new Map();
  const benefits = new Map();
  for (const r of records) {
    categories.set(r.category_label, (categories.get(r.category_label) || 0) + 1);
    benefits.set(r.benefit_type, (benefits.get(r.benefit_type) || 0) + 1);
  }
  const values = records.map((r) => r.value_usd).filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median = values.length ? (values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2) : null;
  const stats = `## What is in the dataset

**${fmt(records.length)} program records from ${providers} providers**, across ${categories.size} categories.
Each record carries the provider, benefit type, stated value, eligibility, geography,
confidence and source URL. Values are advertised terms, not guaranteed awards or additive savings.

- **Benefit types:** ${[...benefits].map(([label, n]) => `${label}: ${fmt(n)}`).join(", ")}.
- **Positive USD values:** ${fmt(values.length)} programs${median === null ? "." : `; median $${fmt(median)} and maximum $${fmt(values.at(-1))}.`}
- **Confidence:** ${fmt(records.filter((r) => r.confidence === "high").length)} records carry the catalog's high-confidence classification; check each record's source and verification date before relying on current terms.

## Files

| File | Rows | Format |
|------|------|--------|
| data/startupperks-dataset.json | ${fmt(records.length)} | JSON with metadata, field definitions and records |
| data/startupperks-dataset.csv | ${fmt(records.length)} | CSV, one row per program |
| lists/*.md | ${fmt(lists.length)} lists | Markdown tables for reading, generated from the same records |

See [DATA_DICTIONARY.md](DATA_DICTIONARY.md) for every field.

## Categories

| Category | Programs |
|----------|---------:|
${[...categories].sort((a, b) => b[1] - a[1]).map(([label, n]) => `| ${label} | ${fmt(n)} |`).join("\n")}
`;

  const csvRes = await fetch(`${BASE}?format=csv`);
  if (!csvRes.ok) throw new Error(`dataset CSV fetch failed: ${csvRes.status}`);
  const csv = await csvRes.text();

  await writeFile("data/startupperks-dataset.json", `${JSON.stringify(json, null, 2)}\n`);
  await writeFile("data/startupperks-dataset.csv", csv);
  await mkdir(LIST_DIR, { recursive: true });
  for (const l of lists) await writeFile(`${LIST_DIR}/${l.file}`, l.body);

  // Keep the README's date stamp honest with the export it was built from.
  const stamp = `<!--STAMP-->Generated ${gen}; newest per-record verification ${ver}. Dates vary by record.<!--/STAMP-->`;
  await writeFile("README.md", readme
    .replace(/<!--STAMP-->[\s\S]*?<!--\/STAMP-->/, () => stamp)
    .replace(/<!--LISTS-->[\s\S]*?<!--\/LISTS-->/, () => `<!--LISTS-->\n${listIndex}<!--/LISTS-->`)
    .replace(/<!--CATALOG-->[\s\S]*?<!--\/CATALOG-->/, () => `<!--CATALOG-->\n${stats}<!--/CATALOG-->`));

  console.log(`Wrote ${records.length} programs and ${lists.length} lists. Generated ${gen}, verified ${ver}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
