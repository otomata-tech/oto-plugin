# oto — Claude Code plugin

The Claude Code companion for the Oto B2B automation toolkit: the hosted **Oto MCP** carries the tools, this plugin teaches Claude to drive them and installs the local `oto` CLI alongside.

Installing this plugin gives you:

- **One universal `oto` skill** — teaches Claude to discover and drive the toolkit (it does *not* duplicate per-tool manuals: the MCP catalogue is served by `oto_list_my_tools`, and the CLI is self-documenting via `--help`).
- **`/oto:setup`** — installs the `oto` CLI (`pipx install "oto-cli[browser]"`) and connects the user's LinkedIn account.

The **Oto MCP** is *not* declared here on purpose — you add it once in **claude.ai** (so it's available in claude.ai **and** syncs into Claude Code), avoiding a duplicate connector. See the bootstrap below.

## Surfaces

- **MCP** (hosted, added in claude.ai): company data, CRM, search, enrichment, Gmail, and LinkedIn — sourcing **and outreach** (`linkedin_unipile_network` op `invite`, `linkedin_unipile_chat` op `send`). The LinkedIn session is held by Unipile, our provider; nothing runs on your machine.
- **CLI** (local, via this plugin's skill + setup): the same toolkit as composable commands — for shell pipelines, and as a fallback when the MCP is unavailable.

## Install

```bash
# distribution (public github marketplace)
claude plugin marketplace add otomata-tech/oto-plugin
# ou depuis un clone local (édition en place)
claude plugin marketplace add ./oto-plugin
claude plugin install oto@otomata-oto
```

## Bootstrap for a new user

1. **Add the Oto MCP in claude.ai** — Settings → Connectors → Add custom connector:
   URL `https://mcp.oto.cx/mcp`, OAuth client ID `7p8h7cypq5mmpwmj2taao` (PKCE, no secret).
   Authenticate (the popup also signs you up). It then also appears inside Claude Code.
2. **Install this plugin** (above) → Claude Code gets the `oto` skill + `/oto:setup`.
3. `/oto:setup` → installs the `oto` CLI.
4. **Connect LinkedIn** (only if you want LinkedIn) → human step, once: ask for a hosted
   connect URL (`unipile_connect_start`), open it, sign in there (2FA/captcha included).
   The link finalises by itself, server-side.

Steps 1 and 4 are the only irreducibly manual actions. LinkedIn — sourcing **and** outreach — runs through the hosted MCP, so it works from claude.ai just as well as from Claude Code.

## Layout

```
.claude-plugin/{plugin,marketplace}.json   # manifest + local marketplace
skills/oto/SKILL.md                         # the universal skill
commands/setup.md                           # /oto:setup
```

The tools live in the `oto-cli` package (PyPI) and the Oto MCP server — this plugin only bundles the skill (doctrine) + the CLI setup command.
