# oto — Claude Code plugin

One-step entry point to the **Oto** B2B automation toolkit inside Claude Code.

Installing this plugin gives you:

- **The Oto MCP connector**, auto-configured (`.mcp.json`) — no manual URL/client_id paste. Run `/mcp` and authenticate (the popup also signs you up the first time).
- **One universal `oto` skill** — teaches Claude to discover and drive the toolkit (it does *not* duplicate per-tool manuals; the CLI is self-documenting via `--help`, à la Blitz/GR doctrine).
- **`/oto:setup`** — installs the `oto` CLI (`pipx install "oto-cli[browser]"`) and walks through LinkedIn login.

## Surfaces

- **MCP** (hosted, in Claude): company data, CRM, search, enrichment, Gmail, LinkedIn **read**.
- **CLI** (local): the same toolkit as commands, **plus LinkedIn outreach** (connect/message), which the MCP doesn't expose.

## Install

```bash
# distribution (public github marketplace)
claude plugin marketplace add otomata-tech/oto-plugin
# ou dev local (édition en place)
claude plugin marketplace add /data/oto/plugin
claude plugin install oto@otomata-oto
```

Then in Claude: `/mcp` → authenticate the `oto` server, and `/oto:setup` for the CLI.

## Bootstrap for a new user

1. Install the plugin (above).
2. `/mcp` → authenticate (creates the oto.ninja account self-serve).
3. `/oto:setup` → installs the CLI.
4. `oto linkedin login` → human step (headed, 2FA), once.

Steps 2 and 4 are the only irreducibly manual actions.

## Layout

```
.claude-plugin/{plugin,marketplace}.json   # manifest + local marketplace
.mcp.json                                   # Oto MCP (http + pre-registered OAuth client_id)
skills/oto/SKILL.md                         # the universal skill
commands/setup.md                           # /oto:setup
```

The tools themselves live in the `oto-cli` package (PyPI) and the Oto MCP server — this plugin only bundles the connector + doctrine.
