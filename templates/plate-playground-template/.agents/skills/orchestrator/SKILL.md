---
name: orchestrator
description: Turn the current Codex thread into a coordination thread that routes implementation work to durable reusable child threads in disposable worktrees with short-lived branches targeting main.
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

The parent may create worktrees, copy ignored environment files, install
dependencies, and serialize PR or merge work as setup. That is
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

- Do not implement product code in the parent thread.
- Route code-changing work to durable child threads automatically.
- Reuse the same child thread for the same checkout slot or workstream.
- Keep the parent for intake, triage, routing, status, summaries, context
  forwarding, conflict arbitration, push serialization, merge coordination,
  and closeout.
- Keep the root checkout for coordination and repo-owned planning or agent
  guidance unless the repo explicitly assigns another parent-only surface.
- If implementation or PR work is already on the root checkout, stop before
  review, push, or PR. Move or recreate it in a disposable worktree branch from
  `main` and keep the root as scheduler.
- For every implementation or PR branch, create or reuse a durable child thread
  first, then assign a disposable worktree with a short-lived branch from
  `main`, even when work is serial.
- Fan out independently runnable packets across separate worktrees. Expected
  merge conflicts are not enough to serialize; record a conflict group and
  resolve conflicts when they become real.
- Open ready PRs back to `main` after repo-required checks and relevant proof
  pass. Merge when repository policy and the hosting service allow it.
- After merge and tracker or handoff closure, delete the disposable worktree,
  archive the finished child thread, and release its slot unless a recorded
  blocker still owns it.
- If mode state is unclear for implementation work, find or create the child
  thread before executing.

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
- Parent-owned plans or agent guidance that repo instructions keep on `main`.
- Asking which child owns a checkout when the mapping is missing.

## Workspace Modes

Choose the lightest honest mode:

- `parent-root`: coordination, non-mutating triage, merge arbitration, and
  parent-owned planning or agent guidance. It is not an implementation or PR
  review checkout.
- `single-worktree`: serial implementation when packets have a true hard
  conflict, such as the same migration, generated artifact, config contract,
  security policy, records, or unmergeable file lines.
- `same-checkout`: non-mutating child coordination only. Never let two child
  threads mutate the same checkout concurrently.
- `worktree`: every implementation packet and PR branch. Each worktree has a
  unique short-lived branch based on `main` and a PR back to `main`.

Nearby components, the same product area, or a few expected merge conflicts are
not hard conflicts.

## `main` Policy

- `main` is the default integration branch and PR target.
- Base every child branch on current `main`.
- Before opening or updating a PR, fetch `origin main` when it exists, integrate
  `origin/main` using the repo's required strategy, rerun required checks and
  proof, then push the short-lived branch.
- PRs are ready unless the user or repo instructions require draft state.
- Merge into `main` when checks pass and repository policy allows it.
- Never force push.
- If integration conflicts are non-trivial, the child reports them to the
  parent instead of widening scope.
- The parent serializes push, PR, merge, and cleanup when concurrent lanes could
  race.
- After merge and release, return `main` to the root checkout. Do not leave a
  disposable scheduler worktree as the long-lived owner of `main`.
- Never hide active run deliverables in a stash just to switch the root
  checkout. Park them on an explicit branch or report the blocker.

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

## Slot Conventions

- Derive the root checkout name and path at runtime.
- Name sibling worktrees with numeric suffixes such as `<repo>-1`, `<repo>-2`,
  and `<repo>-N` unless repo instructions define another convention.
- Reclaim stale merged or abandoned slots before allocation.
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
- Delete disposable worktrees after merge or abandonment. A warm slot needs a
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
7. Otherwise create a child thread titled:

```text
<CHECKOUT-OR-WORKSTREAM> <short task title>
```

8. Send the exact request, source context, acceptance criteria, non-goals,
   assigned worktree, `main` base and PR target, port, data strategy, runtime
   owner, conflict group, proof expectations, and push or tracker expectations.
9. Tell the child to follow the repo's implementation and review skills and to
   report checkout, branch, PR, tests, runtime proof, blockers, conflict risk,
   and next owner.
10. Record the cleanup rule: after merge, required deployed or runtime proof,
    and handoff closure, remove the worktree, archive the child thread, and
    release the slot.
11. Record the mapping:

```md
| Checkout / workstream | Child thread | Mode | Path | Branch | Port | Data | Conflict group | Status | Last update | Next |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

## Thread Tool Boundary

Use durable Codex thread tools only. Search for them by exact
namespace-qualified name:

- `codex_app.list_projects`
- `codex_app.create_thread`
- `codex_app.list_threads`
- `codex_app.read_thread`
- `codex_app.send_message_to_thread`
- `codex_app.set_thread_archived`

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
- Branch based on `main`; PR target `main`.
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
- Before push, integrate current `origin/main`, rerun required proof, and never force push.
- Report checkout, branch, PR URL/state, data strategy, push state, tests, runtime proof, blockers, and next owner.
```

## Status Check

On heartbeat or `$orchestrator status`:

1. Read known child status when tools allow it.
2. Ask stale child threads for a short update.
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
- Do not impose an arbitrary lane cap. Start every independently runnable lane
  that has a safe slot, data strategy, runtime owner, and durable child thread.
- Never force push.
- Keep one-line local questions in the parent.
- If the user says `do it here`, `local`, or `$orchestrator off`, turn mode off
  before executing locally.

## Success Criteria

- Mode can be turned on, off, and reported.
- Implementation work routes automatically.
- Every implementation lane has a visible durable child thread and assigned
  disposable worktree before mutation.
- Follow-ups reuse the same checkout or workstream thread.
- Missing durable tools produce a clear blocker, not a hidden-worker fallback.
- Independently runnable packets can fan out without an arbitrary slot cap.
- Feature branches and PRs target `main`.
- Runtime and data ownership prevent cross-lane collisions.
- Pushes and merges are coordinated, checked, and never forced.
- Merged or abandoned worktrees are reclaimed promptly.
- Finished child threads are archived after closeout.
- Final handoff leaves the root checkout on `main` or reports the exact blocker.
- The orchestrator remains a coordination thread, not an implementation thread.
