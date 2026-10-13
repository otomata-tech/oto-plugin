#!/usr/bin/env node
// PreToolUse guard: asks the human before any OUTBOUND message leaves — email, chat,
// social network. Reads, drafts and dry runs go through freely.
//
// An Oto messaging send has its own tool (oto-backend#1189): the writers (`whatsapp_send`,
// `linkedin_unipile_send`/`_invite`/`_publish`…) ask on every call. Until 10/12/2026
// included, the server still serves the readers' old send ops (`whatsapp_chat` op=send,
// `linkedin_unipile_post` op=create…), deprecated: the guard keeps asking on them. A few
// other tools also carry a send in an `op` or a `mode`, so the guard judges the tool AND
// its operation.
// `oto_call(name, arguments)` is unwrapped: the target is judged as a direct call.
// Anything unreadable asks: the guard never fails open.
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
    case "whatsapp_send":
    case "telegram_send":
    case "instagram_send":
    case "linkedin_unipile_send": // a DM, a reaction, a thread's state
    case "linkedin_unipile_invite": // send, answer or withdraw an invitation
    case "linkedin_unipile_publish": // a post, a comment, a reaction on a post
      return true;
    // Readers whose old send ops are served until 10/12/2026 (oto-backend#1189).
    case "whatsapp_chat":
    case "telegram_chat":
    case "instagram_chat":
      return op === "send";
    case "linkedin_unipile_chat":
      return op === "send" || op === "update" || op === "react";
    case "linkedin_unipile_network":
      return op === "invite" || op === "handle" || op === "cancel";
    case "linkedin_unipile_post":
      return op === "create" || op === "comment" || op === "react";
    case "outlook_compose":
      return args.mode === "send";
    case "teams_message":
      return op === "post" || op === "reply";
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
