#!/usr/bin/env node
// PreToolUse guard: asks the human before any OUTBOUND message leaves — email, chat,
// social network. Reads, drafts and dry runs go through freely.
//
// Oto tools carry the send in an `op` (whatsapp_chat op=send…), so the guard judges the
// tool AND its operation. `oto_call(name, arguments)` is unwrapped: the target is judged
// as a direct call. Anything unreadable asks: the guard never fails open.
//
// Answer: permissionDecision "ask", which holds even in auto mode.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const REASON =
  "Outbound message — confirmation required (draft by default; send only on an explicit go).";

const TRUTHY = new Set(["true", "1", "yes", "on"]);

/** "true" only for an unambiguous dry run, "absent" when missing, else "false". */
function dryRun(args) {
  if (!Object.hasOwn(args, "dry_run")) return "absent";
  return TRUTHY.has(String(args.dry_run).toLowerCase()) ? "true" : "false";
}

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Does this MCP call send something to someone? */
export function sends(name, args) {
  const op = args.op ?? "";
  switch (name) {
    // A send whatever the call.
    case "email_send":
    case "gmail_compose": // draft by default, but kept asking: one tool for both
    case "slack_post_message":
    case "whatsapp_send_message":
    case "chat_send":
    case "telegram_send_message":
    case "instagram_send_message":
    case "messenger_send_message":
    case "twitter_send_message":
    case "unipile_send_message":
    case "unipile_send_invitation":
      return true;
    case "outlook_compose":
      return args.mode === "send";
    case "whatsapp_chat":
    case "linkedin_unipile_chat":
      return op === "send";
    case "teams_message":
      return op === "post" || op === "reply";
    case "linkedin_unipile_network":
      return op === "invite";
    case "linkedin_unipile_post": // publish or comment on someone else's post
      return op === "create" || op === "comment";
    case "apollo_email": // sends unless an unambiguous dry run
      return op === "send" && dryRun(args) !== "true";
    case "hellostock_demande_send": // dry_run is True by default on the tool
      return dryRun(args) === "false";
    default:
      return false;
  }
}

const OTO_CLI_SEND =
  /oto( +-a +[A-Za-z._-]+)? +google +gmail +(send|reply)([\s]|$)/;

/** The decision for one hook payload: "ask" or null (let it through). */
export function decide(payload) {
  if (!isObject(payload)) return "ask";
  const tool = payload.tool_name;
  if (typeof tool !== "string") return "ask";
  const input = payload.tool_input ?? {};
  if (!isObject(input)) return "ask";

  if (tool === "Bash") {
    return OTO_CLI_SEND.test(String(input.command ?? "")) ? "ask" : null;
  }
  if (!tool.startsWith("mcp__")) return null;

  let name = tool.slice(tool.lastIndexOf("__") + 2);
  let args = input;
  if (name === "oto_call") {
    if (typeof input.name !== "string") return "ask";
    name = input.name;
    args = input.arguments ?? {};
    if (!isObject(args)) return "ask";
  }
  return sends(name, args) ? "ask" : null;
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    payload = undefined;
  }
  if (decide(payload) === "ask") {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: REASON,
      },
    }));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
