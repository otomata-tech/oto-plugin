---
name: oto
description: "Oto — B2B automation toolkit: research companies & people, LinkedIn sourcing AND outreach (connect/message), enrich contacts (email/phone), drive Attio/Notion CRM, Google Workspace, Slack/WhatsApp. Use whenever the user wants company/people intelligence, prospecting, LinkedIn automation, contact enrichment, or to act on a CRM/inbox from Claude."
---

# Oto

Oto is a B2B automation toolkit with two surfaces, one account:

- **Oto MCP** — hosted tools, already available in this Claude when the `oto` connector is authenticated (`/mcp`). Covers the API stuff: French company data (`fr_*`), Attio CRM (`attio_*`), web search (`serper_*`), email enrichment (`hunter_*`, `kaspr_*`), Gmail (`gmail_*`), per-user datastore (`data_*`), LinkedIn **read** (`linkedin_scrape_*`, `linkedin_search_*`), etc.
- **`oto` CLI** — runs locally. Same toolkit as composable commands, **plus LinkedIn outreach** (sending messages / connection invitations), which the MCP does not have.

## Discover tools — don't guess

The CLI is self-documenting. Never invent a command:

```bash
oto --help            # list namespaces (fr, browser, attio, google, enrichment, …)
oto <namespace> --help        # commands in a namespace
oto <namespace> <command> --help   # arguments
```

Output is JSON on stdout, composable with pipes (`oto fr search "fintech" | jq …`).

If `oto` is not installed, run `/oto:setup`.

## MCP vs CLI — which to use

- Prefer the **MCP tools** (already in your toolset) for company data, CRM, search, enrichment, Gmail — no shell needed.
- Use the **CLI** for **LinkedIn outreach** and anything not exposed as an MCP tool.

## LinkedIn — the non-obvious doctrine

`--help` gives syntax; these rules it does not:

1. **Login once** (human, headed browser, handles 2FA):
   ```bash
   oto linkedin login
   ```
   The session persists in a default profile and is reused automatically by every LinkedIn command — no `--profile` flag needed (that's only for juggling multiple accounts). Injected cookies do **not** work (LinkedIn TLS fingerprinting); the logged-in profile is the credential.

2. **Sourcing** (read): `oto linkedin search-people "<keywords>"`, `oto linkedin employees <company> --keywords "DAF,CFO"`, `oto linkedin profile <url>`, `oto linkedin company <url>`.

3. **Outreach** (the cold-prospecting flow):
   - `oto linkedin connect <url> --note "…"` → connection **invitation** (works for anyone; note ≤300 chars). This is the cold-outreach primitive.
   - `oto linkedin send <url> "<message>"` → **direct message**, only works for **1st-degree** connections (no Message button otherwise → it errors).
   - Typical flow: **find** (`search-people`/`employees`) → **connect --note** (invite) → after they accept, **send**.

4. **Safety**: add `--dry-run` to `send`/`connect` to do everything except the final click (saves a screenshot) — validate without contacting anyone. Rate limiting is **on by default** (conservative caps, ~40 msg/day, 15 invitations/day); don't disable it — it protects the account. Space actions out. If a command returns "session expired", re-run `oto linkedin login`.

## Account & secrets

The Oto account (`app.oto.ninja/account`) holds per-user config: your own API keys (Serper, Hunter, Kaspr, Attio…), an `OTO_API_KEY` for the CLI, tool toggles. LinkedIn needs **no** API key. Set API keys there (or as env vars); the CLI can also pull them from your account via `OTO_API_KEY` (`oto ninja secrets …`).
