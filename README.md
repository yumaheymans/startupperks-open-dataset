# StartupPerks Open Dataset

Open, cited data on **startup perks**: the credits, free plans, discounts, and rewards that
providers offer to startups, with each program's provider, category, benefit value,
eligibility, and the primary source it was taken from. One machine-readable dataset, released
under **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.

Maintained and kept current by **[StartupPerks](https://startupperks.co?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)**,
an independent index of startup credits, perks, and deals. The website is the
canonical source and re-verifies programs against their own pages on a running
cadence; this repository is a periodic snapshot of it, regenerated from the live export with
[`generate.mjs`](generate.mjs).
<!--STAMP-->Generated 2026-09-22; newest per-record verification 2026-09-22. Dates vary by record.<!--/STAMP-->

> **Attribution (required by the licence):** if you use this data, credit **StartupPerks** with a
> link to <https://startupperks.co>. That is the whole ask.

<!--CATALOG-->
## What is in here

**1,058 program records from 1,048 providers**, across 9 categories.
Each record carries the provider, benefit type, stated value, eligibility, geography,
confidence and source URL. Values are advertised terms, not guaranteed awards or additive savings.

- **Benefit types:** Discount: 182, Credits: 280, Free plan: 543, Cash & rewards: 30, Program: 23.
- **Positive USD values:** 192 programs; median $10,000 and maximum $500,000.
- **Confidence:** 583 records carry the catalog's high-confidence classification; check each record's source and verification date before relying on current terms.

## Files

| File | Rows | Format |
|------|------|--------|
| data/startupperks-dataset.json | 1,058 | JSON with metadata, field definitions and records |
| data/startupperks-dataset.csv | 1,058 | CSV, one row per program |

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

<!--EXAMPLES-->
## A few of the programs

Terms in this snapshot, with links to their cited program pages:

- [Google for Startups Cloud Program](https://startupperks.co/programs/google-for-startups-cloud-program?utm_source=github&utm_medium=readme&utm_campaign=open-dataset): Up to $200,000 USD in Google Cloud (up to $350,000 USD for AI startups)
- [Cloudflare for Startups](https://startupperks.co/programs/cloudflare-for-startups?utm_source=github&utm_medium=readme&utm_campaign=open-dataset): Up to $350,000 in credits
- [Snowflake Startup Program / Startup Accelerator](https://startupperks.co/programs/snowflake-startup-program-startup-accelerator?utm_source=github&utm_medium=readme&utm_campaign=open-dataset): Up to $250K credits
<!--/EXAMPLES-->

Browse everything: [all programs](https://startupperks.co/programs?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)
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
fetches the public dataset API and rewrites the files in `data/`:

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
