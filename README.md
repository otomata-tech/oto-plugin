# oto — Claude Code plugin

The **CLI companion** for the Oto B2B automation toolkit inside Claude Code.

Installing this plugin gives you:

- **One universal `oto` skill** — teaches Claude to discover and drive the toolkit (it does *not* duplicate per-tool manuals; the CLI is self-documenting via `--help`, à la Blitz/GR doctrine).
- **`/oto:setup`** — installs the `oto` CLI (`pipx install "oto-cli[browser]"`) and walks through LinkedIn login.

The **Oto MCP** is *not* declared here on purpose — you add it once in **claude.ai** (so it's available in claude.ai **and** syncs into Claude Code), avoiding a duplicate connector. See the bootstrap below.

## Surfaces

- **MCP** (hosted, added in claude.ai): company data, CRM, search, enrichment, Gmail, LinkedIn **read**.
- **CLI** (local, via this plugin's skill + setup): the same toolkit as commands, **plus LinkedIn outreach** (connect/message), which the MCP doesn't expose and which only runs locally.

## Install

```bash
# distribution (public github marketplace)
claude plugin marketplace add otomata-tech/oto-plugin
# ou dev local (édition en place)
claude plugin marketplace add /data/oto/plugin
claude plugin install oto@otomata-oto
```

## Bootstrap for a new user

1. **Add the Oto MCP in claude.ai** — Settings → Connectors → Add custom connector:
   URL `https://mcp.oto.ninja/mcp`, OAuth client ID `7p8h7cypq5mmpwmj2taao` (PKCE, no secret).
   Authenticate (the popup also signs you up). It then also appears inside Claude Code.
2. **Install this plugin** (above) → Claude Code gets the `oto` skill + `/oto:setup`.
3. `/oto:setup` → installs the `oto` CLI.
4. `oto linkedin login` → human step (headed browser, 2FA), once.

Steps 1 and 4 are the only irreducibly manual actions. Note: LinkedIn **outreach** runs through the local CLI, so it needs Claude Code (or a terminal) — claude.ai alone can't run it.

## Layout

```
.claude-plugin/{plugin,marketplace}.json   # manifest + local marketplace
skills/oto/SKILL.md                         # the universal skill
commands/setup.md                           # /oto:setup
```

The tools live in the `oto-cli` package (PyPI) and the Oto MCP server — this plugin only bundles the skill (doctrine) + the CLI setup command.
