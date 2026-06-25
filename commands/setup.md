---
description: Install and set up the `oto` CLI (pipx + browser extra) and prepare LinkedIn automation.
---

Set up the `oto` CLI on this machine so the user can run Oto tools locally (including LinkedIn outreach). Do this step by step, checking each prerequisite:

1. **Check if already installed**: run `oto --version`. If it works and is ≥ 1.4.1, skip to step 5.

2. **Prerequisites**:
   - Python ≥ 3.10 (`python3 --version`).
   - `pipx` (`pipx --version`; if missing, install it per the OS and run `pipx ensurepath`).
   - **Google Chrome** installed — required. The LinkedIn tools drive real Chrome (channel `chrome`); do NOT use Chromium (`patchright install chromium`), LinkedIn flags its fingerprint. If Chrome is absent, tell the user to install Google Chrome and stop.

3. **Install**:
   ```bash
   pipx install "oto-cli[browser]"
   ```

4. **Verify**: `oto --help` should list the namespaces.

5. **LinkedIn login** (only if the user wants LinkedIn): this step is **human** — instruct the user to run it themselves, because it opens a real browser window and may require 2FA:
   ```
   oto linkedin login
   ```
   Tell them: log in to LinkedIn in the window that opens, confirm you reach your feed, then close the window. The session is saved and reused automatically.

6. **Oto MCP in claude.ai** (optional, for the hosted tools — company data, CRM, search, enrichment, Gmail): this plugin does **not** auto-add it (to avoid a duplicate connector). Tell the user to add it once in **claude.ai** → Settings → Connectors → Add custom connector: URL `https://mcp.oto.ninja/mcp`, OAuth client ID `7p8h7cypq5mmpwmj2taao` (PKCE, no secret). It then also syncs into Claude Code. LinkedIn outreach does not need it (it's CLI-only).

7. **API keys** (optional): for paid tools (Serper, Hunter, Kaspr…), the user adds their own keys on `app.oto.ninja/account`, or sets them as env vars. LinkedIn needs no key.

After setup, the `oto` skill explains how to discover and use the tools (`oto --help`, `oto <namespace> --help`).
