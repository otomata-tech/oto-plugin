---
description: Install and set up the local `oto` CLI (pipx + browser extra), and connect the user's LinkedIn account to the hosted connector.
---

Set up the `oto` CLI on this machine so the user can run Oto tools from a shell, and connect their LinkedIn account. Do this step by step, checking each prerequisite:

1. **Check if already installed**: run `oto --version`. If it works and is ≥ 1.4.1, skip to step 5.

2. **Prerequisites**:
   - Python ≥ 3.10 (`python3 --version`).
   - `pipx` (`pipx --version`; if missing, install it per the OS and run `pipx ensurepath`).
   - **Google Chrome** — only needed for the *local* browser commands (`oto browser …`), which drive real Chrome (channel `chrome`); do NOT use Chromium (`patchright install chromium`), LinkedIn flags its fingerprint. LinkedIn itself no longer needs it (see step 5), so a missing Chrome is not a blocker.

3. **Install**:
   ```bash
   pipx install "oto-cli[browser]"
   ```

4. **Verify**: `oto --help` should list the namespaces.

5. **Connect LinkedIn** (only if the user wants LinkedIn): this runs on the **hosted** connector, not on this machine. Call `unipile_connect_start` (MCP) to get an auth URL and give it to the user — this step is **human**: they sign in on that page (2FA/captcha included). The link then finalises by itself, server-side; check it with `oto_instance(op='verify', connector='unipile')`. If they have a Recruiter or Sales Navigator seat and want to use it, pass `premium=` on that same call — adding it later means reconnecting.

6. **Oto MCP in claude.ai** (for the hosted tools — company data, CRM, search, enrichment, Gmail, LinkedIn): this plugin does **not** auto-add it (to avoid a duplicate connector). Tell the user to add it once in **claude.ai** → Settings → Connectors → Add custom connector: URL `https://mcp.oto.cx/mcp`, OAuth client ID `7p8h7cypq5mmpwmj2taao` (PKCE, no secret). It then also syncs into Claude Code. LinkedIn goes through it — step 5 is pointless without it.

7. **API keys** (optional): for paid tools (Serper, Hunter, Kaspr…), the user adds their own keys on `manage.oto.cx/account`, or sets them as env vars. LinkedIn needs no key.

After setup, the `oto` skill explains how to discover and use the tools (`oto --help`, `oto <namespace> --help`).
