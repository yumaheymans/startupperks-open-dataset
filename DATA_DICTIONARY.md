# Data dictionary

The dataset is one table: **one row per startup-perk program** (the README states the current count). The JSON file wraps
the records in a self-describing envelope (`name`, `description`, `license`, `attribution`,
`methodology`, `generated_at`, `last_verified`, `record_count`, `fields`, `records`); the CSV is the
records only, with the header below. Blank / null means "not published or unknown", never a guess.

In CSV, list fields (`stages`, `geographies`) are joined with `; `. In JSON they are arrays.

| Field | Type | Meaning |
|-------|------|---------|
| `key` | string | Stable unique identifier for the program. |
| `name` | string | Program name as the provider presents it. |
| `provider` | string | The company offering the perk. |
| `provider_slug` | string | Provider identifier (matches /providers/[slug]). |
| `category` | string | Category key, e.g. cloud-infra, ai-ml, banking-fintech. |
| `category_label` | string | Human-readable category label. |
| `benefit_type` | string | Kind of benefit: Credits, Discount, Free, Cash & rewards, etc. |
| `value_text` | string \| null | Headline benefit value exactly as the provider states it. |
| `value_usd` | number \| null | Maximum headline value in USD. Null when the amount is non-USD, a partner-bundle total, or a billing threshold (never additive). |
| `eligibility` | string | Primary funding/backing gate, e.g. Any startup, VC / accelerator-backed. |
| `stages` | string[] | Startup stages that qualify (empty means any stage). |
| `max_funding_raised_usd` | number \| null | Maximum total funding raised the program allows, if any. |
| `max_company_age_years` | number \| null | Maximum company age in years the program allows, if any. |
| `geographies` | string[] | Regions the program is open to (empty means global). |
| `recurring_or_expiry` | string \| null | Whether the benefit recurs or when it expires, as stated. |
| `other_requirements` | string \| null | Any other stated requirement (e.g. new customers only). |
| `confidence` | string | How well-verified the record is: high, medium, or low. |
| `last_verified` | string \| null | ISO timestamp this record was last re-verified against the source, or null if only in the dated static catalog. |
| `source_url` | string \| null | The provider's official page stating the terms (the source of record). |
| `apply_url` | string \| null | The provider's own application URL. |
| `url` | string | The StartupPerks page for this program. |

## Confidence

`high` = read from the provider's own page. `medium` = from a reputable secondary
source pending a primary re-read. `low` = tracked but not yet re-verified. Programs are re-checked
against their source on a running weekly cadence; `last_verified` carries the date of the last check.

## A note on `value_usd`

`value_usd` is populated only when the provider publishes a specific dollar
figure and it is a genuine USD amount. Foreign-currency headline values are kept in `value_text` and
left out of `value_usd` rather than silently converted. Values are advertised maximums and are **not
additive** across programs. See <https://startupperks.co/methodology>.
