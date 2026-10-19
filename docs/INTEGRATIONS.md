# Feed One: External Integrations Register

This document tracks all external API integrations, their verified endpoints, authentication mechanisms, constraints, and audit dates.

## 1. TinyFish Integration

**Verification Date:** 19 October 2026  
**Status:** [VERIFIED-EXT] (Checked against official TinyFish documentation)  
**Provider Adapter:** `src/server/discovery/`

### 1.1 Search API
- **Endpoint:** `GET https://api.search.tinyfish.ai`
- **Authentication:** Header `X-API-Key` (case-sensitive) via server-side `process.env.TINYFISH_API_KEY`. Never exposed to client.
- **Key Parameters:**
  - `query` (string, required): 3–200 characters.
  - `location` (string, optional): Geographic hint.
  - `purpose` (string, optional, $\le 2000$ chars): e.g. *"Find public information about food rescue recipient organisations"*.
  - `domain_type` (string): Defaults to `'web'`.
- **Response Structure:** `{ query, results: [{ position, site_name, title, snippet, url }], total_results, page }`

### 1.2 Fetch API
- **Endpoint:** `POST https://api.fetch.tinyfish.ai` (JSON body)
- **Authentication:** Header `X-API-Key`
- **Key Parameters:**
  - `urls` (string array, max 10 per batch request).
  - `format`: `'markdown'` (default).
  - `ttl`: `0` (forces live retrieval, ensuring accurate `retrieved_at` timestamp).
- **Response Structure:** `{ results: [{ url, final_url, title, description, language, format, text }], errors: [{ url, error }] }`
- **Partial Failure Handling:** HTTP 200 may be returned even when individual URLs fail. Each item in `errors[]` must be recorded as an individual `source_records` entry with `parse_status = 'fetch_failed'`.

### 1.3 Internal Safeguards & Rate Caps
- **Daily Caps (Internal):** Max 50 searches/day, max 100 URL fetches/day, enforced via `discovery_runs` table counts.
- **Content Excerpts:** Stored raw text truncated to 2,000 characters for auditability (`source_records.excerpt`).
- **Data Provenance:** Extracted facts are assigned `public_source` provenance. Per D24, they can never satisfy hard constraints C1–C4 (yielding `unknown`).
- **Isolation Guarantee:** TinyFish is strictly sequestered to coordinator discovery. It is never invoked during donation creation, matching, offer dispatch, or handover.
- **Offline Mock Provider:** When `DISCOVERY_PROVIDER="mock"` or `TINYFISH_API_KEY` is unset, the system uses `src/server/discovery/mock.provider.ts` backed by `fixtures/discovery/*.json`, flagging all outputs as `simulated = true`.

## 2. Supabase Integration
- **Postgres Database:** Relational data store connected via direct connection string `DATABASE_URL` using `postgres-js` driver with Drizzle ORM.
- **Auth:** Email/Password authentication for seeded demo accounts (`POST /api/demo/sign-in`).
- **Row-Level Security (RLS):** Enabled on all tables with deny-by-default policies for public/anon roles. All application mutations execute server-side.
