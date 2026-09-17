# StartupPerks Open Dataset

Open, cited data on **startup perks**: the credits, free plans, discounts, and rewards that
1,076 companies offer to startups, with each program's provider, category, benefit value,
eligibility, and the primary source it was taken from. One machine-readable dataset, released
under **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.

Maintained and kept current by **[StartupPerks](https://startupperks.co?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)**,
an independent, always-current index of startup credits, perks, and deals. The website is the
canonical, always-current source and re-verifies programs against their own pages on a running
cadence; this repository is a periodic snapshot of it, regenerated from the live export with
[`generate.mjs`](generate.mjs).
<!--STAMP-->Generated 2026-09-17; data last verified against source 2026-09-17.<!--/STAMP-->

> **Attribution (required by the licence):** if you use this data, credit **StartupPerks** with a
> link to <https://startupperks.co>. That is the whole ask.

## What is in here

`data/startupperks-dataset.*` holds **1,076 startup-perk programs from 1,063 distinct providers**,
across 9 categories. Every row carries the provider, the benefit type and its value (both as the
provider states it and, where a specific dollar figure is published, a normalized USD amount),
who qualifies, the geographies it applies to, a confidence flag, and the **primary-source URL** the
program was read from.

- **Benefit mix:** 543 free or startup plans, 280 credit programs, 182 discounts, 44 cash /
  rewards programs, and 27 structured programs.
- **Dollar values:** 193 of the 1,076 programs publish a specific benefit figure. Among those the
  **median is $10,000**, with the largest verified cloud programs reaching $250,000 to $350,000
  (Google for Startups, Cloudflare, Snowflake). These figures are *advertised maximums*, not
  additive: a startup qualifies for a subset, and the top-of-band amount is rarely the amount most
  companies receive.
- **Openness:** the large majority of tracked programs are open to any startup, with no accelerator,
  incubator, or investor referral required (our analysis of the full catalog puts this at roughly 9
  in 10). The folklore that the good deals need a YC badge does not hold up against the data. See the
  write-up: [What 1,076 startup perk programs reveal](https://startupperks.co/blog/what-1076-startup-perk-programs-reveal-2026?utm_source=github&utm_medium=readme&utm_campaign=open-dataset).
- **Confidence:** 587 programs are flagged high-confidence (read from the provider's own page);
  the rest are medium or low pending a primary re-read.

## Files

| File | Rows | Format |
|------|------|--------|
| `data/startupperks-dataset.json` | 1,076 programs | JSON, with a self-describing envelope (name, licence, fields, `last_verified`) plus the records |
| `data/startupperks-dataset.csv` | 1,076 programs | CSV (RFC 4180), one row per program |

See **[DATA_DICTIONARY.md](DATA_DICTIONARY.md)** for every field.

## The nine categories

| Category | Programs |
|----------|---------:|
| Developer Tools | 195 |
| Security, Legal & HR | 185 |
| Cloud & Infrastructure | 123 |
| AI & ML | 118 |
| Banking & Fintech | 108 |
| Productivity & SaaS | 102 |
| Finance & Ops | 92 |
| Marketing & Sales | 84 |
| Databases & Data | 69 |

## A few of the programs

Explore any of these in context on the site (every figure links to the provider's own page):

- [Google for Startups Cloud Program](https://startupperks.co/programs/google-for-startups-cloud-program?utm_source=github&utm_medium=readme&utm_campaign=open-dataset) up to $350,000 in cloud credits (Cloud & Infrastructure)
- [Cloudflare for Startups](https://startupperks.co/programs/cloudflare-for-startups?utm_source=github&utm_medium=readme&utm_campaign=open-dataset) up to $350,000 (Cloud & Infrastructure)
- [Snowflake Startup Program](https://startupperks.co/programs/snowflake-startup-program-startup-accelerator?utm_source=github&utm_medium=readme&utm_campaign=open-dataset) up to $250,000 (Databases & Data)
- Cloud, AI-compute, banking, and dev-tool programs from AWS, Microsoft, NVIDIA, Brex, Ramp, Mercury, OpenAI, and 1,000+ more.

Browse everything: [all programs](https://startupperks.co/programs?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)
 · [by category](https://startupperks.co/categories?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)
 · [ranked by value](https://startupperks.co/value?utm_source=github&utm_medium=readme&utm_campaign=open-dataset)
 · or [match your own startup](https://startupperks.co/?utm_source=github&utm_medium=readme&utm_campaign=open-dataset).

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

No key is required; the endpoint is public and read-only, so anyone can reproduce this snapshot
exactly. For always-current data, query the live API directly, filterable by category:

```bash
curl https://startupperks.co/api/dataset                 # full dataset, JSON
curl https://startupperks.co/api/dataset?format=csv      # full dataset, CSV
curl https://startupperks.co/api/dataset?category=ai-ml  # one category
```

## Licence

[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
You may share and adapt the data for any purpose, including commercially, as long as you credit
**StartupPerks** with a link to <https://startupperks.co>. See [LICENSE](LICENSE).
