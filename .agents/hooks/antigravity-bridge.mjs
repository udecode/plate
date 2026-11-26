#!/usr/bin/env node
// Translates Antigravity hooks.json events (camelCase stdin/stdout) to Plate's
// existing Claude-format guard and lifecycle scripts so Neon shares the same
// safety rails without duplicating guard logic.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const event = process.argv[2] ?? '';

let payload = {};
try {
  const raw = readFileSync(0, 'utf8').trim();
  if (raw) payload = JSON.parse(raw);
} catch {
  // Malformed stdin: fail open for non-destructive lifecycle hooks.
}

const cwd =
  typeof payload.cwd === 'string' && payload.cwd.length > 0
    ? payload.cwd
    : ROOT;
const env = { ...process.env, CLAUDE_PROJECT_DIR: ROOT };

function runScript(relPath, args = [], stdinObj = null, timeout = 15_000) {
  const fullPath = join(ROOT, relPath);
  if (!existsSync(fullPath)) return null;
  const run = spawnSync(process.execPath, [fullPath, ...args], {
    cwd,
    env,
    encoding: 'utf8',
    input: stdinObj === null ? undefined : JSON.stringify(stdinObj),
    timeout,
  });
  return run;
}

function parseDeny(run) {
  if (!run?.stdout) return null;
  const text = run.stdout.trim();
  if (!text) return null;
  try {
    const out = JSON.parse(text);
    const decision = out?.hookSpecificOutput?.permissionDecision;
    if (decision === 'deny') {
      return (
        out.hookSpecificOutput.permissionDecisionReason ||
        'Blocked by Plate hook guard.'
      );
    }
  } catch {
    // Non-JSON informational output is not a denial.
  }
  return null;
}

function mapToolCall(toolCall) {
  if (!toolCall || typeof toolCall !== 'object') return null;
  const name = String(toolCall.name ?? '');
  const args =
    toolCall.args && typeof toolCall.args === 'object' ? toolCall.args : {};

  switch (name) {
    case 'run_command':
      return {
        tool_name: 'Bash',
        tool_input: { command: String(args.CommandLine ?? '') },
      };
    case 'edit_file':
      return {
        tool_name: 'Edit',
        tool_input: {
          file_path: String(args.Path ?? ''),
          old_string: String(args.Target ?? ''),
          new_string: String(args.Replacement ?? ''),
        },
      };
    case 'write_file':
      return {
        tool_name: 'Write',
        tool_input: {
          file_path: String(args.Path ?? ''),
          content: String(args.Content ?? ''),
        },
      };
    case 'read_file':
      return {
        tool_name: 'Read',
        tool_input: { file_path: String(args.Path ?? '') },
      };
    case 'invoke_subagent':
      return {
        tool_name: 'Agent',
        tool_input: args,
      };
    default:
      return null;
  }
}

if (event === 'PreToolUse') {
  const mapped = mapToolCall(payload.toolCall);
  if (!mapped) {
    process.stdout.write('{"decision":"allow"}\n');
    process.exit(0);
  }

  const claudeEvent = {
    cwd,
    session_id: payload.conversationId ?? '',
    tool_name: mapped.tool_name,
    tool_input: mapped.tool_input,
  };

  const guards = [];
  if (
    mapped.tool_name === 'Bash' ||
    mapped.tool_name === 'Edit' ||
    mapped.tool_name === 'Write'
  ) {
    guards.push(['.agents/pstack/guard.mjs', []]);
  }
  if (mapped.tool_name === 'Bash') {
    guards.push(['tooling/scripts/type-probe-guard.mjs', []]);
  }
  if (
    mapped.tool_name === 'Read' ||
    mapped.tool_name === 'Bash' ||
    mapped.tool_name === 'Edit' ||
    mapped.tool_name === 'Write' ||
    mapped.tool_name === 'Agent'
  ) {
    guards.push(['tooling/scripts/read-budget.mjs', []]);
  }

  for (const [script, args] of guards) {
    const reason = parseDeny(runScript(script, args, claudeEvent, 10_000));
    if (reason) {
      process.stdout.write(
        `${JSON.stringify({ decision: 'deny', reason })}\n`
      );
      process.exit(0);
    }
  }

  process.stdout.write('{"decision":"allow"}\n');
  process.exit(0);
}

if (event === 'PreInvocation') {
  // Reset per-turn read budget at the start of each new user turn only.
  if (payload.invocationNum === 1 && payload.conversationId) {
    runScript(
      'tooling/scripts/read-budget.mjs',
      ['--reset'],
      { cwd, session_id: payload.conversationId },
      5_000
    );
  }
  process.stdout.write('{}\n');
  process.exit(0);
}

if (event === 'SessionStart') {
  const notes = [];
  runScript('.agents/pstack/head.mjs', [], null, 15_000);
  const priv = runScript(
    'tooling/scripts/git-private.mjs',
    ['start', '--hook'],
    { cwd },
    30_000
  );
  if (priv?.stdout?.trim()) notes.push(priv.stdout.trim());
  const scan = runScript(
    '.agents/skills/cleanup/scripts/scan.mjs',
    ['--brief', '--auto', '--repo', ROOT],
    null,
    20_000
  );
  if (scan?.stdout?.trim()) notes.push(scan.stdout.trim());
  const doctor = runScript(
    '.agents/skills/contributor-setup/scripts/doctor.mjs',
    ['--hook'],
    { cwd },
    20_000
  );
  if (doctor?.stdout?.trim()) notes.push(doctor.stdout.trim());

  if (notes.length > 0) {
    process.stdout.write(
      `${JSON.stringify({
        injectSteps: [
          { systemMessage: { systemMessage: notes.join('\n') } },
        ],
      })}\n`
    );
  } else {
    process.stdout.write('{}\n');
  }
  process.exit(0);
}

if (event === 'Stop') {
  runScript(
    'tooling/scripts/git-private.mjs',
    ['autosave', '--hook'],
    { cwd },
    25_000
  );
  process.stdout.write('{}\n');
  process.exit(0);
}

process.stdout.write('{}\n');
