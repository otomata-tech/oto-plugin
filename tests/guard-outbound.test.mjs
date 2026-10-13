// The outbound guard: every send asks, every read passes, and nothing unreadable
// fails open. Run: `node --test "tests/*.test.mjs"`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { decide } from "../hooks/guard-outbound.mjs";

const mcp = (name, input = {}) => ({ tool_name: `mcp__claude_ai_Oto__${name}`, tool_input: input });

const ASK = [
  ["whatsapp send", mcp("whatsapp_send", { text: "x", chat_id: "c" })],
  ["telegram send", mcp("telegram_send", { text: "x", recipient_id: "r" })],
  ["instagram send", mcp("instagram_send", {})],
  ["linkedin dm", mcp("linkedin_unipile_send", { text: "x" })],
  ["linkedin dm, explicit op", mcp("linkedin_unipile_send", { op: "send" })],
  ["linkedin message reaction", mcp("linkedin_unipile_send", { op: "react" })],
  ["linkedin thread update", mcp("linkedin_unipile_send", { op: "update" })],
  ["linkedin invite", mcp("linkedin_unipile_invite", { provider_id: "p" })],
  ["linkedin accept invitation", mcp("linkedin_unipile_invite", { op: "handle" })],
  ["linkedin withdraw invitation", mcp("linkedin_unipile_invite", { op: "cancel" })],
  ["linkedin publish", mcp("linkedin_unipile_publish", { text: "x" })],
  ["linkedin comment", mcp("linkedin_unipile_publish", { op: "comment" })],
  ["linkedin post reaction", mcp("linkedin_unipile_publish", { op: "react" })],
  // A reader's old send op is still served until 10/12/2026 (oto-backend#1189).
  ["whatsapp_chat old send op", mcp("whatsapp_chat", { op: "send", text: "x" })],
  ["telegram_chat old send op", mcp("telegram_chat", { op: "send" })],
  ["instagram_chat old send op", mcp("instagram_chat", { op: "send" })],
  ["linkedin_unipile_chat old send op", mcp("linkedin_unipile_chat", { op: "send" })],
  ["linkedin_unipile_chat old update op", mcp("linkedin_unipile_chat", { op: "update" })],
  ["linkedin_unipile_chat old react op", mcp("linkedin_unipile_chat", { op: "react" })],
  ["linkedin_unipile_network old invite op", mcp("linkedin_unipile_network", { op: "invite" })],
  ["linkedin_unipile_network old handle op", mcp("linkedin_unipile_network", { op: "handle" })],
  ["linkedin_unipile_network old cancel op", mcp("linkedin_unipile_network", { op: "cancel" })],
  ["linkedin_unipile_post old create op", mcp("linkedin_unipile_post", { op: "create" })],
  ["linkedin_unipile_post old comment op", mcp("linkedin_unipile_post", { op: "comment" })],
  ["linkedin_unipile_post old react op", mcp("linkedin_unipile_post", { op: "react" })],
  ["oto_call wraps an old send op", mcp("oto_call", { name: "whatsapp_chat", arguments: { op: "send" } })],
  ["gmail compose", mcp("gmail_compose", {})],
  ["outlook send", mcp("outlook_compose", { mode: "send" })],
  ["teams post", mcp("teams_message", { op: "post" })],
  ["teams_send post", mcp("teams_send", { op: "post" })],
  ["teams_send reply", mcp("teams_send", { op: "reply" })],
  ["google chat send", mcp("chat_send", { space: "s", text: "x" })],
  ["chat_message old send op", mcp("chat_message", { op: "send", text: "x" })],
  ["teams reply", mcp("teams_message", { op: "reply" })],
  ["email_send", mcp("email_send", {})],
  ["slack post", mcp("slack_post_message", {})],
  ["apollo send", mcp("apollo_email", { op: "send", message_id: "1" })],
  ["apollo send, dry_run 'no'", mcp("apollo_email", { op: "send", dry_run: "no" })],
  ["hellostock real", mcp("hellostock_demande_send", { dry_run: false })],
  ["hellostock 'False'", mcp("hellostock_demande_send", { dry_run: "False" })],
  ["hellostock 0", mcp("hellostock_demande_send", { dry_run: 0 })],
  ["oto_call wraps a send", mcp("oto_call", { name: "whatsapp_send", arguments: { text: "x" } })],
  ["oto_call wraps an invite", mcp("oto_call", { name: "linkedin_unipile_invite", arguments: {} })],
  ["oto_call arguments not an object", mcp("oto_call", { name: "whatsapp_send", arguments: "{\"text\":\"x\"}" })],
  ["oto_call without a name", mcp("oto_call", { arguments: {} })],
  ["oto cli gmail send", { tool_name: "Bash", tool_input: { command: "oto -a otomata google gmail send x" } }],
  ["no tool_name", { tool_input: {} }],
  ["tool_input not an object", { tool_name: "mcp__x__whatsapp_send", tool_input: "text=x" }],
  ["not an object", "garbage"],
];

const PASS = [
  ["whatsapp list", mcp("whatsapp_chat", { op: "list" })],
  ["whatsapp default op", mcp("whatsapp_chat", {})],
  ["linkedin threads", mcp("linkedin_unipile_chat", { op: "read" })],
  ["linkedin relations", mcp("linkedin_unipile_network", { op: "relations" })],
  ["linkedin invitations", mcp("linkedin_unipile_network", { op: "invitations" })],
  ["linkedin feed", mcp("linkedin_unipile_post", {})],
  ["telegram list", mcp("telegram_chat", { op: "list" })],
  ["instagram read", mcp("instagram_chat", { op: "read" })],
  ["outlook draft", mcp("outlook_compose", {})],
  ["teams list", mcp("teams_message", { op: "list" })],
  ["google chat list", mcp("chat_message", { op: "list" })],
  ["google chat default op", mcp("chat_message", {})],
  ["apollo dry run", mcp("apollo_email", { op: "send", dry_run: true })],
  ["apollo draft", mcp("apollo_email", { op: "draft" })],
  ["hellostock preview (default)", mcp("hellostock_demande_send", { demande_id: 1 })],
  ["oto_call a read", mcp("oto_call", { name: "fr_search", arguments: { q: "x" } })],
  ["gmail read", mcp("gmail_message", { op: "search" })],
  ["plain bash", { tool_name: "Bash", tool_input: { command: "ls" } }],
  ["other tool", { tool_name: "Read", tool_input: { file_path: "/x" } }],
];

for (const [label, payload] of ASK) {
  test(`asks: ${label}`, () => assert.equal(decide(payload), "ask"));
}
for (const [label, payload] of PASS) {
  test(`passes: ${label}`, () => assert.equal(decide(payload), null));
}

const SCRIPT = new URL("../hooks/guard-outbound.mjs", import.meta.url).pathname;
const run = (stdin) => execFileSync("node", [SCRIPT], { input: stdin }).toString();

test("the script answers ask on stdout, in the hook format", () => {
  const out = JSON.parse(run(JSON.stringify(mcp("whatsapp_send", { text: "x" }))));
  assert.equal(out.hookSpecificOutput.hookEventName, "PreToolUse");
  assert.equal(out.hookSpecificOutput.permissionDecision, "ask");
});

test("the script stays silent on a read", () => {
  assert.equal(run(JSON.stringify(mcp("whatsapp_chat", { op: "read" }))), "");
});

test("the script asks on unparseable input", () => {
  assert.equal(JSON.parse(run("not json")).hookSpecificOutput.permissionDecision, "ask");
});

test("every tool the script knows is routed to it by hooks.json", () => {
  const hooks = JSON.parse(readFileSync(new URL("../hooks/hooks.json", import.meta.url)));
  const matcher = new RegExp(hooks.hooks.PreToolUse.find((h) => h.matcher !== "Bash").matcher);
  const source = readFileSync(SCRIPT, "utf8");
  const known = [...source.matchAll(/case "([a-z_]+)":/g)].map((m) => m[1]);
  for (const name of [...known, "oto_call"]) {
    assert.ok(matcher.test(`mcp__claude_ai_Oto__${name}`), `${name} is not routed to the guard`);
  }
});
