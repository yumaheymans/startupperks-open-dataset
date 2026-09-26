# Startup Credits, Perks and Deals: the Open List

An open list of the credits, free plans, discounts and rewards that providers offer startups: cloud
and GPU credits, LLM and AI API credits, banking and fintech perks, developer tools, data platforms
and SaaS. Every program links to the provider's own page, and the whole list is also published as a
machine-readable JSON/CSV dataset under **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.

Maintained and kept current by **[StartupPerks](https://startupperks.co?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)**,
an independent index of startup credits, perks, and deals. The website is the
canonical source and re-verifies programs against their own pages on a running
cadence; this repository is a periodic snapshot of it, regenerated from the live export with
[`generate.mjs`](generate.mjs).
<!--STAMP-->Generated 2026-09-26; newest per-record verification 2026-09-26. Dates vary by record.<!--/STAMP-->

> **Attribution (required by the licence):** if you use this data, credit **StartupPerks** with a
> link to <https://startupperks.co>. That is the whole ask.

<!--LISTS-->
## Browse the lists

1,058 programs, one Markdown list per category plus cross-category lists, each program linked to the provider's own page:

| List | Programs | Largest stated values include |
|------|---------:|-------------------------------|
| [AI Startup Credits and Perks](lists/ai-and-ml.md) | 118 | Nebius, Anthropic, Daytona |
| [Cloud Credits for Startups](lists/cloud-and-infrastructure.md) | 123 | Denvr Dataworks, Cloudflare, Google Cloud |
| [Developer Tool Perks for Startups](lists/developer-tools.md) | 177 | Datadog, Grafana Labs, Kong |
| [Database and Data Platform Credits for Startups](lists/databases-and-data.md) | 69 | Snowflake, Databricks, Aiven |
| [Startup Banking and Fintech Perks](lists/banking-and-fintech.md) | 108 | Stripe |
| [Finance and Operations Perks for Startups](lists/finance-and-ops.md) | 92 | Fondo, RevenueCat, doola |
| [Marketing and Sales Tools for Startups](lists/marketing-and-sales.md) | 84 | Vonage, Infobip, Netcore Cloud |
| [Productivity and SaaS Deals for Startups](lists/productivity-and-saas.md) | 102 | Sanity, Grain, Bubble |
| [Security, Compliance, Legal and HR Perks for Startups](lists/security-legal-and-hr.md) | 185 | ComplyCube, Drata, LowerPlane |
| [Startup credits you can get without VC funding](lists/no-vc-funding-required.md) | 244 | Denvr Dataworks, Cloudflare, Google Cloud |

Looking for the ones your startup qualifies for? [Describe your startup](https://startupperks.co/?utm_source=github&utm_medium=readme&utm_campaign=open-dataset) and StartupPerks ranks the programs you can actually get.
<!--/LISTS-->

## Use it from an AI assistant (MCP)

The same catalog is available to AI assistants through the StartupPerks MCP server: a free, read-only
remote server with no account or API key, listed in the Official MCP Registry as
`co.startupperks/startup-perks`.

```
https://startupperks.co/mcp
```

Your assistant can rank the programs a startup qualifies for (`find_startup_perks`), search by provider
or topic (`search_startup_perks`) and read one program's full terms (`get_startup_perk`), with every
answer linked to its source. Setup for Claude, ChatGPT, Cursor and VS Code:
[startupperks.co/mcp-server](https://startupperks.co/mcp-server?utm_source=github&utm_medium=readme&utm_campaign=open-dataset).
In Claude Code:

```bash
claude mcp add --transport http startupperks https://startupperks.co/mcp
```

<!--CATALOG-->
## What is in the dataset

**1,058 program records from 1,048 providers**, across 9 categories.
Each record carries the provider, benefit type, stated value, eligibility, geography,
confidence and source URL. Values are advertised terms, not guaranteed awards or additive savings.

- **Benefit types:** Discount: 182, Credits: 280, Free plan: 543, Cash & rewards: 30, Program: 23.
- **Positive USD values:** 175 programs; median $9,000 and maximum $500,000.
- **Confidence:** 584 records carry the catalog's high-confidence classification; check each record's source and verification date before relying on current terms.

## Files

| File | Rows | Format |
|------|------|--------|
| data/startupperks-dataset.json | 1,058 | JSON with metadata, field definitions and records |
| data/startupperks-dataset.csv | 1,058 | CSV, one row per program |
| lists/*.md | 10 lists | Markdown tables for reading, generated from the same records |

See [DATA_DICTIONARY.md](DATA_DICTIONARY.md) for every field.

## Categories

| Category | Programs |
|----------|---------:|
| Security, Legal & HR | 185 |
| Developer Tools | 177 |
| Cloud & Infrastructure | 123 |
| AI & ML | 118 |
| Banking & Fintech | 108 |
| Productivity & SaaS | 102 |
| Finance & Ops | 92 |
| Marketing & Sales | 84 |
| Databases & Data | 69 |
<!--/CATALOG-->

On the website: [all programs](https://startupperks.co/programs?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)
 · [by category](https://startupperks.co/categories?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)
 · [ranked by value](https://startupperks.co/value?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)
 · or [match your own startup](https://startupperks.co/?utm_source=github&utm_medium=readme&utm_campaign=open-dataset).

Research based on the earlier 1,076-program catalog: [What startup perk programs reveal](https://startupperks.co/blog/what-1076-startup-perk-programs-reveal-2026?utm_source=github&utm_medium=readme&utm_campaign=open-dataset).

## Methodology and integrity

- **Every program is cited to a primary source.** The `source_url` on each record is the provider's
  own page the benefit was read from, never an affiliate redirect or a competing list.
- **Confidence is explicit.** Each record is flagged `high`, `medium`, or `low`. Nothing is
  presented as confirmed that has not been read from the provider.
- **Nothing is invented.** Where a program publishes no dollar figure, the USD value is blank, not
  estimated. Unknown eligibility is blank. Foreign-currency amounts are not silently converted into
  a USD field.
- **Values are honest, not inflated.** Advertised maximums are labelled as such; they are not summed
  into a single headline number, because a startup qualifies for a subset and rarely receives the
  top of the band.
- **The site is canonical.** These files are a snapshot; the live pages re-verify on a running
  cadence, so for the current state always check
  [startupperks.co](https://startupperks.co?utm_source=github&utm_medium=readme&utm_campaign=open-dataset).
  The full methodology is documented at
  [/methodology](https://startupperks.co/methodology?utm_source=github&utm_medium=readme&utm_campaign=open-dataset).

## Regenerating

The snapshot is produced from the live StartupPerks export by [`generate.mjs`](generate.mjs), which
fetches the public dataset API and rewrites the files in `data/`, the Markdown lists in `lists/`, and
the generated sections of this README:

```bash
node generate.mjs
```

No key is required; the endpoint is public and read-only, so anyone can regenerate a current snapshot. For always-current data, query the live API directly, filterable by category:

```bash
curl https://startupperks.co/api/dataset                 # full dataset, JSON
curl https://startupperks.co/api/dataset?format=csv      # full dataset, CSV
curl https://startupperks.co/api/dataset?category=ai-ml  # one category
```

## Licence

[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
You may share and adapt the data for any purpose, including commercially, as long as you credit
**StartupPerks** with a link to <https://startupperks.co>. See [LICENSE](LICENSE).
