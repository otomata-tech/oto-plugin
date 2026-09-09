---
name: oto
description: "Oto — B2B automation toolkit: research companies & people, LinkedIn sourcing AND outreach (connect/message), enrich contacts (email/phone), drive Attio/Notion CRM, Google Workspace, Slack/WhatsApp. Use whenever the user wants company/people intelligence, prospecting, LinkedIn automation, contact enrichment, or to act on a CRM/inbox from Claude."
---

# Oto

Oto is a B2B automation toolkit with two surfaces, one account:

- **Oto MCP** — hosted tools, available once the `oto` connector is added in claude.ai (URL `https://mcp.oto.cx/mcp`, client ID `7p8h7cypq5mmpwmj2taao`) — it then syncs into Claude Code too. Covers the API stuff: French company data (`fr_*`), CRM (`folk_*`, `attio_*`, `hubspot_*`, `salesforce_*`…), web search (`serper_*`), email enrichment (`hunter_*`, `kaspr_*`), Gmail (`gmail_*`), per-user datastore (`data_*`), LinkedIn — sourcing **and** outreach (`linkedin_unipile_*`, plus bought data via `linkedin_aiark_*`), etc. The catalogue is large and it is served, not guessed: read it with `oto_list_my_tools`, then `oto_tool_schema(name)` before calling.
- **`oto` CLI** — runs locally. Same toolkit as composable commands, for shell pipelines and as a fallback when the MCP is unavailable.

## Discover tools — don't guess

The CLI is self-documenting. Never invent a command:

```bash
oto --help            # list namespaces (fr, browser, google, enrichment, folk, serper, …)
oto <namespace> --help        # commands in a namespace
oto <namespace> <command> --help   # arguments
```

Output is JSON on stdout, composable with pipes (`oto fr search "fintech" | jq …`).

If `oto` is not installed, run `/oto:setup`.

## MCP vs CLI — which to use

- Prefer the **MCP tools** (already in your toolset) for everything — company data, CRM, search, enrichment, Gmail, LinkedIn. No shell needed. A tool that is not currently mounted can still be called with `oto_call(name, arguments)`; its absence from your toolset never means the capability is missing.
- Use the **CLI** for shell pipelines (`| jq`), and as the fallback when the MCP is unavailable.

## LinkedIn — the non-obvious doctrine

LinkedIn runs on the **hosted MCP tools** (`linkedin_unipile_*`): the session lives at
Unipile, our provider, not on the user's machine. No local browser, no cookie injection.

1. **Connect once** (human, one time): `unipile_connect_start` returns an auth URL — give
   it to the user, they sign in on that page (2FA/captcha included), and the link
   finalises by itself server-side. Check with `oto_instance(op='verify', connector='unipile')`.
   If they have a **Recruiter** or **Sales Navigator** seat and want it, pass `premium=`
   on that same call — the two are exclusive, and adding one later means reconnecting.

2. **Sourcing** (read): `linkedin_unipile_search` (resolve filter *names* into ids first
   with `linkedin_unipile_facets`), `linkedin_unipile_profile`, `linkedin_unipile_post`,
   `linkedin_unipile_job`, `linkedin_unipile_network` op `relations`. Bought data, no
   LinkedIn session needed and billed per credit: `linkedin_aiark_search`,
   `linkedin_aiark_person`.

3. **Outreach** (the cold-prospecting flow):
   - `linkedin_unipile_network(op="invite", provider_id=…, message=…)` → connection
     **invitation** (note ≤300 chars). The cold-outreach primitive; `provider_id` comes
     from a `linkedin_unipile_search` or `linkedin_unipile_profile` result.
   - `linkedin_unipile_chat(op="send", recipient_id=…, text=…)` → **direct message** in a
     new thread; pass `chat_id=` instead to reply in an existing one.
   - Typical flow: **find** (search) → **invite** with a note → once accepted, **send**.

4. **Local fallback**: the CLI still drives a real Chrome under `oto browser linkedin …`
   (`login`, `search-people`, `employees`, `profile`, `company`, `connect`, `send`), with
   `--dry-run` on `connect`/`send` and rate limiting on by default. It is a fallback, not
   the path to recommend — read the `--help`, and prefer the hosted tools above.

## Account & secrets

The Oto account (`manage.oto.cx/account`) holds per-user config: your own API keys (Serper, Hunter, Kaspr, Attio…), an `OTO_API_KEY` for the CLI, tool toggles. LinkedIn needs **no** API key. Set API keys there (or as env vars); the CLI can also pull them from your account via `OTO_API_KEY` (`oto ninja secrets …`).
