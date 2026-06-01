---
name: orchestrator
description: Turn the current Codex thread into a coordination thread that routes per-branch implementation work to durable reusable child threads without worktrees.
---

# Orchestrator

Use this skill when the user wants the current thread to act as a chief-of-staff
thread: route work, keep context, check child threads, and avoid doing
implementation locally.

## Commands

- `$orchestrator on`: activate orchestration-only mode for this thread.
- `$orchestrator off`: return this thread to normal local execution.
- `$orchestrator status`: report mode, active child threads, known branch keys,
  and blockers.

Do not add a manual routing command. In orchestrator mode, routing is automatic.

## Core Contract

When orchestrator mode is on:

- Do not implement product code in this thread.
- Do not create or suggest worktrees.
- Automatically route any per-branch task to a child thread.
- Reuse the same child thread for future work on the same branch.
- Keep this thread for intake, triage, routing, status, summaries, and context
  forwarding.
- If mode state is unclear, ask once before executing locally.

## Per-Branch Task

A per-branch task is any work that is expected to create, modify, review, or
continue a code branch, PR, or branch-scoped implementation plan.

Examples:

- Ticket execution.
- Issue execution.
- API migration work.
- PR feedback resolution.
- Code-changing bug, feature, refactor, or migration.
- Goal-backed implementation that would touch files or branch state.
- Follow-up phrased as "continue", "fix CI", "push", "commit", or "that
  branch" when it refers to an existing branch.

Not per-branch by default:

- One-off answers.
- Read-only status summaries.
- Cross-thread triage.
- External context intake.
- Asking which child thread owns a branch when the mapping is missing.

## Routing Rules

1. Classify the request.
2. If it is not per-branch, handle it in the orchestrator thread.
3. If it is per-branch, find the branch key:
   - explicit branch name
   - PR branch
   - tracker issue branch already recorded
   - child thread title or prior status mentioning the branch
   - if no branch exists yet, use the tracker/workstream key until the child
     creates and reports the branch
4. Find an existing child thread for that branch key.
5. If found, send the new instruction to that child thread.
6. If not found, create a new child thread with a title like:

```text
<BRANCH-OR-TICKET> <short task title>
```

7. Tell the child thread exactly what skill/request to run and include the
   source context the orchestrator already gathered.
8. Ask the child thread to report its branch key, PR URL, blockers, and next
   owner in its closeout.
9. Record the mapping in the orchestrator status:

```md
| Branch / key | Child thread | Status | Last update | Next |
| --- | --- | --- | --- | --- |
```

## Thread Tool Boundary

Use durable Codex thread tools only. Search for them first by exact
namespace-qualified name:

- `codex_app.create_thread`
- `codex_app.list_threads`
- `codex_app.read_thread`
- `codex_app.send_message_to_thread`
- `codex_app.set_thread_title`
- `codex_app.set_thread_pinned`
- `codex_app.set_thread_archived`

If these tools are not available, stop and report that durable Codex thread
routing is unavailable in the current runtime. Do not use `spawn_agent`,
temporary sub-agents, or parallel workers as a fallback for orchestrator child
threads. They are not reusable threads and they break the point of this skill.

## Child Prompt Shape

When creating or reusing a child thread, send a compact prompt:

```md
You are the child execution thread for `<branch-or-ticket>`.

Run: <exact user skill/request>

Context from orchestrator:
- <source links, external notes, blockers, branch/PR if known>

Rules:
- Do not create a worktree.
- Reuse this thread for future work on this branch.
- If code changes, follow repo branch/PR rules.
- Report branch, PR, tests, browser proof, blockers, and next owner.
```

## Status Check

On heartbeat or `$orchestrator status`:

1. Read known child thread status when tools allow it.
2. Ask stale child threads for a short update.
3. Forward relevant external context to the owning child thread.
4. Surface only actionable blockers and ready-for-review items to the user.
5. Keep the status short; do not dump child thread transcripts.

## Safety

- Never run code-changing work in both orchestrator and child thread for the
  same branch.
- Never start two code-changing child threads on the same checkout at the same
  time unless the user explicitly accepts branch/file conflicts.
- Do not route purely local one-line questions away from the orchestrator.
- If the user says "do it here", "local", or `$orchestrator off`, execute in the
  current thread after mode is off.

## Success Criteria

- Orchestrator mode can be turned on, off, and reported.
- Per-branch tasks are routed automatically.
- Same-branch follow-ups reuse the same child thread.
- Durable thread tools are used for child threads.
- Missing durable thread tools produce a clear blocked status, not a sub-agent
  fallback.
- Worktrees are not created.
- The orchestrator remains a coordination thread, not an implementation thread.
