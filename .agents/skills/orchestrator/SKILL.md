---
name: orchestrator
description: Turn the current Codex thread into a coordination thread that routes explicitly delegated work to durable reusable child tasks with the project's checkout, proof and delivery policy.
---

# Orchestrator

Use this skill when the user wants the current thread to act as a chief-of-staff
thread: route work, keep context, supervise child threads, arbitrate conflicts,
and avoid doing implementation locally.

## Commands

- `$orchestrator on`: activate orchestration-only mode for this thread.
- `$orchestrator off`: return this thread to normal local execution.
- `$orchestrator status`: report mode, active child threads, checkout slots,
  branches, ports, data strategies, blockers, and push state.

Routing is automatic while orchestrator mode is on. Do not invent a manual
routing command.

## Mode And Claim Discipline

Worktrees alone are not orchestrator mode.

Within the active authority, the parent may prepare assigned worktrees, copy
required environment files, install dependencies and serialize delivery. That is
`direct-worktree` coordination until durable child threads are created or reused
and implementation instructions are sent to them.

Before code-changing work starts under an orchestrator claim:

1. Record `orchestrator mode: on` in the active plan or status.
2. Find the durable Codex thread tools.
3. Create or reuse one child thread per checkout or workstream key.
4. Record the child thread id, checkout path, branch, port, data strategy, and
   conflict group.
5. Send implementation instructions before the child mutates code.

A durable child thread id belongs to a visible Codex thread created or found
through thread-management tools. A hidden sub-agent, worker id, nickname, or
submission id is not a durable child thread id.

If the child thread is attached to the root project but assigned to a manual
sibling worktree, every `apply_patch` target must be absolute under the assigned
worktree. Bare relative patches may hit the root checkout. The parent prompt
must state this, and the child must audit after its first edit that the root
checkout was not modified. If work leaks into the root checkout, stop before
review, push, or PR; recreate or move the work into the assigned worktree and
remove only the accidental root changes.

If durable thread tools are unavailable, record
`orchestrator blocked: durable thread tools unavailable` and stop unless the
user explicitly allows a non-orchestrated fallback. Never execute locally and
still call the run orchestrated.

Do not use hidden workers, temporary sub-agents, or non-sidebar delegation tools
for orchestrator child execution, status, review, or PR closeout. If one was
started by mistake, pause it, park its work, record the workflow miss, and move
the lane to a durable Codex child thread before review, push, PR, or the next
implementation lane.

## Core Contract

When orchestrator mode is on:

- Keep the parent for intake, status, source context, conflict arbitration and authorized delivery.
- Reuse the durable task for each workstream. Use the current task for ordinary work unless the user explicitly requests durable task coordination.
- Creating a new task requires an explicit new-task request under the native tool contract. Mode activation alone does not authorize creating tasks or checkouts. Reuse authorized existing tasks; report a missing creation decision when it is required.
- Never mutate the same checkout concurrently. Serial work can use an explicitly assigned existing checkout. For independently writable work, use permitted separate directories or user-authorized worktrees.
- Project and user rules own branch, PR target, checkout selection and publication. Do not impose main, move current work, create isolation or ship because this skill lists a possible operation.
- Preserve the exact proof, runtime/data ownership and handoff for each child. A hidden worker id is not a durable task id.
- Archive tasks and reclaim disposable slots only within the authorized lifecycle and after their work and evidence are preserved.

## Implementation Work

Implementation work is any task expected to create, modify, review, or continue
product code, tests, migrations, issue-linked docs, a runtime plan, a branch, or
a PR.

Examples:

- Ticket or issue execution.
- API or data migration work.
- PR feedback resolution.
- Code-changing bugs, features, refactors, or upgrades.
- Goal-backed work that touches files or checkout state.
- Follow-ups such as `continue`, `fix CI`, `push`, `commit`, `that slot`, or
  `that checkout` when they refer to code-changing work.

Not implementation work by default:

- One-off answers.
- Read-only status summaries or reviews.
- Cross-thread triage.
- External context intake.
- Parent-owned plans or agent guidance in the assigned project checkout.
- Asking which child owns a checkout when the mapping is missing.

## Workspace and delivery policy

Resolve each child's existing project and assigned checkout from returned tool metadata and the active request. Record one of:

- `parent-root`: coordination and project-owned planning.
- `same-checkout`: one writer at a time in an explicitly assigned existing checkout.
- `worktree`: a user-authorized independent checkout with its own branch, runtime and data ownership.

Read the selected project's isGitRepository metadata from `list_projects` to choose the environment when a new task is explicitly requested. Follow the actual `create_thread` contract: Git projects default to a worktree unless the user requested the saved project directly. Do not invent a starting branch or silently move existing work.

The user's request and project rules select the integration branch, PR base and proof requirements. Preserve existing checkout work. Commit, push, PR, merge, cleanup and messages to others need their actual authority. Use the project delivery method and serialize actions that can race. A green check is evidence, not publication authority. Never force-push merely to simplify coordination.

## Data And Runtime Policy

- Shared local data is acceptable for read-only work or clearly disjoint
  writes.
- Use a per-slot database or data fixture for schema work, migrations, seeds,
  destructive cleanup, broad mutation tests, or overlapping record writes.
- If shared-data conflict risk appears mid-run, pause the packet and ask the
  parent to serialize it or move it to isolated data.
- Runtime ownership must be explicit. A parent-owned runtime cannot be killed
  or reused by a child without reassignment.
- Each runtime-owning child gets a unique port and explicit stop condition.

## Slot conventions for authorized worktrees

- Derive the root checkout name and path at runtime.
- Name sibling worktrees with numeric suffixes such as `<repo>-1`, `<repo>-2`,
  and `<repo>-N` unless repo instructions define another convention.
- Reclaim stale slots only when cleanup is authorized and their source, untracked files and evidence are proven disposable.
- Allocate the lowest reusable suffix first. A lower slot is unavailable only
  while active work, an unmerged branch or PR, a runtime, a review, or cleanup
  risk still owns it.
- Record why any lower slot was skipped.
- Use unique short-lived branches such as
  `codex/<surface>-<YYYYMMDD-HHMMSS>` unless the user or repo names another
  branch.
- Before install or runtime work in a fresh worktree, copy required ignored
  environment files according to repo instructions. Explicitly exclude `.git`
  and dependency directories. Never print secret values.
- Immediately after copying environment files, run
  `git rev-parse --show-toplevel` in the target and verify it resolves to the
  assigned worktree before install, dispatch, or mutation.
- Serialize first-time installs when generated links or caches can collide.
- Within authorized cleanup, delete disposable worktrees after merge or abandonment. A warm slot needs a
  recorded owner, expiry, and next proof.
- Archive finished child threads after merge, handoff, and proof closeout. Keep
  active, blocked, or decision-owning threads visible with an owner and next
  poll.

## Routing Rules

1. Classify the request.
2. Handle non-implementation work in the parent.
3. For implementation work, find durable thread tools before any mutation. No
   durable child thread id means no implementation start.
4. Resolve the checkout or workstream key from the assigned slot, branch, PR,
   tracker issue, existing thread title, or task name.
5. Find an existing child thread for that key.
6. Reuse it when found.
7. If creating a new task is explicitly authorized, create a child thread titled:

```text
<CHECKOUT-OR-WORKSTREAM> <short task title>
```

8. Send the exact request, source context, acceptance criteria, non-goals,
   assigned checkout, authorized base and PR target, port, data strategy, runtime
   owner, conflict group, proof expectations, and push or tracker expectations.
9. Tell the child to follow the repo's implementation and review skills and to
   report checkout, branch, PR, tests, runtime proof, blockers, conflict risk,
   and next owner.
10. Record the cleanup rule: after merge, required deployed or runtime proof,
    and handoff closure, perform authorized worktree cleanup, archive the child task, and
    release the slot.
11. Record the mapping:

```md
| Checkout / workstream | Child thread | Mode | Path | Branch | Port | Data | Conflict group | Status | Last update | Next |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

## Thread Tool Boundary

Use the current durable Codex task tools. Discover their current schemas by operation name:

- `mcp__codex_app__list_projects`
- `mcp__codex_app__create_thread`
- `mcp__codex_app__list_threads`
- `mcp__codex_app__read_thread`
- `mcp__codex_app__wait_threads`
- `mcp__codex_app__move_thread_to_sidebar_section`
- `mcp__codex_app__send_message_to_thread`
- `mcp__codex_app__set_thread_archived`

Core routing needs project lookup, thread creation, thread listing, thread
reading, and message sending. Finished-child cleanup needs thread archiving. If
archiving is unavailable, record `child archive blocked: tool unavailable` and
keep the slot unavailable until closeout evidence is copied and the parent
explicitly accepts the stale visible thread.

Before creating a child, resolve the saved Codex project whose local path
exactly matches the root checkout. Do not use a parent directory, sibling
checkout, or nearest-prefix match. If the exact project is unavailable, report
`orchestrator blocked: exact saved project unavailable`.

Preserve the configured model and reasoning effort unless the user or repo
instructions explicitly require overrides. Record any override and its
rationale in the parent plan and child prompt.

If durable thread tools are unavailable, stop. Do not substitute hidden
sub-agents, parallel workers, or temporary agents; their ids do not satisfy the
durable child-thread gate.

## Child Prompt Shape

Send a compact prompt when creating or reusing a child:

```md
You are the child execution thread for `<checkout-or-workstream>`.

Run: <exact user request or skill>

Context from orchestrator:
- Sources, decisions, blockers, branch and push state.
- Workspace mode and absolute checkout path.
- Branch and PR target from the active request and project policy.
- Port, data strategy, runtime owner, and conflict group.
- Acceptance criteria, non-goals, required proof, review, push, and tracker expectations.

Rules:
- Follow the repo's AGENTS instructions and implementation skill.
- Use only the assigned checkout.
- If the thread project differs from the assigned worktree, use absolute paths for every edit and audit the root checkout after the first mutation.
- Verify required ignored environment files without printing values. When copying them, exclude `.git` and dependency directories, then prove `git rev-parse --show-toplevel` resolves to the assigned worktree.
- Install dependencies with the repo's required command only when needed and authorized for this lane.
- Respect the assigned runtime owner, port, and data strategy.
- Keep review and PR work inside this child/worktree lane.
- Report conflicts instead of widening scope.
- Reuse this thread for future work on this checkout/workstream.
- Before an authorized push, apply the project's integration policy and rerun affected proof. Never force push by default.
- Report checkout, branch, PR URL/state, data strategy, push state, tests, runtime proof, blockers, and next owner.
```

## Status Check

On heartbeat or `$orchestrator status`:

1. Use `wait_threads` with known ids and cursors; `timeoutMs: 0` gives a compact snapshot. Batch up to the tool's supported target limit.
2. Read a task only when its summary leaves a concrete question unresolved. Wait for progress instead of sending prompts merely to poll status.
3. Forward new context to the owning child.
4. Surface only actionable blockers, push-ready work, review-ready work, and
   conflict decisions.
5. While children run checks, reviews, deployments, or merge waits, supervise
   active lanes or start the next independently runnable packet.
6. Archive children whose merge, proof, and handoff are complete.
7. Keep status short; never dump child transcripts.

## Safety

- Never mutate the same work in both parent and child.
- Never start implementation without a durable child thread id in parent
  status when thread tools exist.
- Never treat a hidden worker or sub-agent id as an orchestrator child thread.
- Never let two code-changing children mutate the same checkout concurrently.
- Never fan out without an independence check, slot table, data strategy,
  runtime ownership, and parent-owned merge plan.
- Respect current tool concurrency and resource limits. Queue remaining authorized work without dropping required slices.
- Never force push.
- Keep one-line local questions in the parent.
- If the user says `do it here`, `local`, or `$orchestrator off`, turn mode off
  before executing locally.

## Success Criteria

- Mode can be turned on, off, and reported.
- Implementation work routes automatically.
- Every implementation lane has a visible durable child thread and an explicitly assigned
  checkout before mutation.
- Follow-ups reuse the same checkout or workstream thread.
- Missing durable tools produce a clear blocker, not a hidden-worker fallback.
- Independent packets run within authorized scope and actual concurrency limits.
- Branches and PRs target the integration branch selected by the user and project.
- Runtime and data ownership prevent cross-lane collisions.
- Pushes and merges are coordinated, checked, and never forced.
- Merged or abandoned worktrees are reclaimed promptly.
- Finished child threads are archived after closeout.
- Final handoff preserves the assigned root checkout and reports exact local versus published state.
- The orchestrator remains a coordination thread, not an implementation thread.
