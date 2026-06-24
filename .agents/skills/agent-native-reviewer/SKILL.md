---
name: agent-native-reviewer
description: Review agent-native parity for skills, prompts, tools, commands, generated mirrors, repo workflows, and user-facing actions.
---

# Agent-Native Reviewer

Review whether an agent can perform, verify, and discover the same meaningful
action a user can.

The standard is simple:

```txt
user action -> agent route -> source owner -> proof command/artifact -> handoff
```

If one link is missing, the workflow is not agent-native.

## Use When

- `.agents/**`, `.claude/**`, `.codex/**`, skills, prompts, hooks, commands, or
  workflow docs changed.
- A feature adds or changes a user-facing action and the repo has agent
  integration.
- A reviewer asks whether Codex can reproduce, operate, verify, or maintain the
  same surface a human can.
- A repo is becoming mostly agent-maintained and needs fewer hidden human-only
  paths.

## Do Not Use When

- The task is a normal code review with no agent/tooling/workflow surface.
- The action is intentionally human-only: MFA, OAuth consent, billing payment
  entry, CAPTCHA, legal acceptance, biometric unlock, or OS permission prompts.
- The change is cosmetic and has no meaningful operation to reproduce.

## Core Principles

1. **Action parity.** Every important user action has an agent route.
2. **Context parity.** Agents can see the inputs, state, and constraints needed
   to act well.
3. **Source ownership.** Agents edit the durable source, not generated mirrors
   or copied output.
4. **Proof parity.** Agents can verify the outcome with the same authority a
   maintainer would trust.
5. **Discoverability.** The route is visible from the skill, AGENTS file,
   command docs, tool schema, or public API docs an agent is expected to read.
6. **Shared workspace.** Agent-created artifacts live where humans can inspect,
   edit, and commit them.

## Codex Capability Ladder

Assume Codex is the agent runtime unless the repo says otherwise. Prefer the
most repeatable proof and interaction layer that can cover the action:

1. **Tests and scripts first.** Unit, integration, browser-test, benchmark,
   typecheck, lint, import smoke, generated-mirror audit, and source audit are
   the default proof layer. If a behavior can be proved there, do that before
   driving an app by hand.
2. **Browser next.** Use the Browser plugin for app/browser interaction proof
   when tests cannot fully prove rendered behavior, native selection, focus,
   navigation, screenshots, console/network state, or real route behavior.
3. **Chrome after Browser.** Use Chrome when the task depends on the user's
   existing Chrome state, profile, tabs, extensions, cookies, or a site state
   that Browser cannot access.
4. **Computer Use last.** Use Computer Use for OS-level or native-app actions
   that tests, Browser, and Chrome cannot reach. Treat it as powerful but
   brittle; record exact manual proof and any limits.

Do not jump straight to UI automation when a focused test, command, or source
audit gives stronger evidence. Do not claim a behavior is agent-native unless
the selected layer can be rerun or described precisely enough for another agent
to repeat.

## Dotai Integrations

- Use `autogoal` for durable or measurable work. The first checkpoint must copy
  agent-native requirements into the plan before implementation.
- Use `sync-skills` when a skill, rule, template, or generated mirror crosses
  repo boundaries. Shared behavior belongs in dotai; repo policy stays local.
- Use `sync-vision` when the missing parity is reusable taste or doctrine, not
  just one task's mechanics.
- Use `resolve-pr-feedback` for PR review feedback. It must end with
  `autoreview` in the destination repo when that repo owns an autoreview gate.
- Use `hard-cut` when stale compatibility, fake aliases, dead commands, or
  duplicate agent routes should be deleted rather than wrapped.
- Use `tdd` or `diagnosing-bugs` when the parity gap is a real behavior bug,
  flaky proof, or unclear failure path.

## Review Process

### 1. Identify the Changed Surface

Classify the action surface:

| Surface | Examples |
|---|---|
| Skill/workflow | `SKILL.md`, `.mdc`, plan template, generated mirror, lockfile |
| Command/tool | CLI command, script, MCP tool, GitHub workflow, package script |
| Public API | exported package API, docs example, release artifact |
| Product action | button, form, keyboard shortcut, browser route, OS/device path |
| Maintainer action | issue triage, PR feedback, security advisory, release lane |

For incremental reviews, start from the changed files and expand only to the
source owner, generated mirror, lockfile, command, or docs that prove parity.

### 2. Build the Parity Map

Use this map for every meaningful action:

| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|
| action | skill/tool/command | file/path | generated/config/doc | command/artifact | pass/gap/N/A |

Status rules:

- `pass`: source owner, route, proof, and discoverability are present.
- `gap`: agent cannot safely perform or verify the action.
- `N/A`: intentionally human-only or outside the current repo authority, with a
  concrete reason.

### 3. Check Source Ownership

Flag any workflow that asks agents to edit output instead of source.

Common source boundaries:

| Output | Source owner |
|---|---|
| `.agents/skills/**/SKILL.md` installed mirror | external skill package or `.agents/rules/**` source |
| `.claude/skills/**/SKILL.md` installed mirror | external skill package or `.agents/rules/**` source |
| root `AGENTS.md` generated block | `.agents/AGENTS.md` or repo generator input |
| generated barrel/export file | package source plus barrel generator command |
| generated docs/template output | registry/package/docs source named by repo policy |
| copied skill in many repos | dotai source plus Skills CLI install/update |

Finding severity is high when the wrong owner would make future agents lose the
fix during sync.

### 4. Check Agent Route

The route must be usable without hidden human context:

- skill name or tool is discoverable from the available skill list, `AGENTS.md`,
  README, or command docs;
- arguments are explicit enough for an agent to call correctly;
- required credentials, browser state, local env, or external access are named;
- authority boundaries are clear: read-only, patch, commit, push, comment,
  merge, publish, delete.

Do not demand a wrapper skill for every small action. Prefer patching the owner
skill, AGENTS routing, or command docs when an existing route fits.

### 5. Check Proof

Every important agent action needs a verification path:

- exact command, cwd, and expected result;
- generated mirror or lockfile audit;
- browser route/screenshot/console caveat when UI behavior changed;
- issue/PR/security fetch when public maintainer state changed;
- source audit when the claim is structural;
- `N/A` reason when no automated proof fits.

Proof must run in the owning workspace. A downstream install is not proved by a
source-package validation alone, and a source-package change is not proved by a
downstream command alone.

### 6. Check Context

Agents need the same operational context a human maintainer uses:

- the relevant vision/doctrine file is linked or routed;
- project-specific commands live in the project, not in dotai;
- final handoff tells the user what changed, what needs attention, and what was
  not verified;
- recurring misses are written into the durable owner, not left in chat.

If the missing context is reusable taste, route to `sync-vision`. If it is
workflow mechanics, patch the skill/template. If it is one-off, record it in the
active plan or final handoff.

## Findings

Use severity by consequence:

- `P0`: agent can perform a destructive/public action without authority or
  proof.
- `P1`: important user or maintainer action has no safe agent route, or the
  source/generated boundary is wrong.
- `P2`: route exists but is hard to discover, lacks proof, or will rot during
  sync.
- `P3`: wording or docs polish that would improve agent success but is not a
  blocker.

Suppress low-confidence guesses. If runtime observation is required, ask for or
run the proof instead of inventing a finding.

## What Not To Flag

- Human-only security/legal/payment ceremonies.
- Cosmetic UI actions without operational meaning.
- Missing automation for rare admin tasks when the repo has no safe authority
  model for agents.
- A repo-local fork that intentionally keeps product policy out of dotai.
- A generated mirror that is stale only because the required sync command has
  not run yet; request the sync/proof instead.

## Output Format

```md
## Agent-Native Review

### Verdict
PASS | NEEDS WORK

### Capability Map
| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|

### Findings
1. [P1] Title -- `file:line`
   Impact: ...
   Fix: ...
   Proof: ...

### Accepted / Rejected
- Accepted: ...
- Rejected: ... because ...

### Verification
- command or source audit -> result

### Needs Attention
- ...
```
