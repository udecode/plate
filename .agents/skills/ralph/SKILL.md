---
description: Generate tmp/continue.md from the active plan, set the completion state to pending, then start the next runnable slice or review pass.
name: ralph
metadata:
  skiller:
    source: .agents/rules/ralph.mdc
---

# Ralph

Generate the project continuation prompt for the active plan, mark the plan
active, then start the next runnable slice or review pass.

This is the file-backed continuation prompt skill. It turns a plan plus a
completion gate into a reusable prompt for Stop-hook or infinite-loop
execution, then immediately runs the first slice instead of stopping at prompt
generation. For review-gated plans, it can run one named pass at a time and
keep completion `pending` until every required pass is closed.

## Goal

Create one paste-ready continuation prompt that:

- starts with the project-local `continue` skill reference when available
- names the read-first plan/context files
- keeps the agent moving without babysitting
- locks scope explicitly
- names the current next owner
- names fast driver gates for iteration
- names final completion criteria
- preserves compact context grounding for the active plan
- records the current pass in the completion state file
- respects the project's completion state file when one exists
- encodes a real stop rule, not a cooldown crutch
- writes the result to `tmp/continue.md`
- sets the completion state to `pending`
- starts the active plan's next runnable slice or required review pass in the
  current turn
- runs exactly one ClawSweeper related-issue pass for Slate v2 issue-facing
  plans when the active plan has not already completed one for the touched
  surface
- updates maintainer-facing reference docs named by the active plan or governing
  skill before any lane can be called complete

## Discovery

Resolve project conventions before writing:

1. Completion state file:
   - prefer the file named by the user or active plan
   - else, for parallel sessions, use `tmp/completion-checks/<session-id>.md`
     when `COMPLETION_CHECK_ID` or `CODEX_THREAD_ID` exists; create it when
     starting or resuming a lane
   - else use `tmp/completion-check.md` if it exists
   - else use the active plan as the mutable state file
2. Continuation prompt output:
   - always use `tmp/continue.md`
3. Continue skill reference:
   - prefer `.agents/skills/continue/SKILL.md` if it exists
   - else use the available `continue` skill reference from the current runtime
   - else write plain text instructions without a skill link
4. Completion gate command:
   - prefer the command named by the user, active plan, package scripts, or
     project docs
   - else describe the completion gate generically and do not invent a command

Do not hardcode machine-specific paths, package managers, or repo names.

## Inputs To Read First

Read only what you need:

1. the user's stated goal
2. the completion state file, if present
3. the active plan or mutable state file
4. relevant research / architecture / context docs
5. context grounding fields already recorded in the plan
6. current next owner
7. current strongest safety gate
8. current strongest progress gate
9. pass schedule / pressure passes / review gates, if the active plan has them
10. ClawSweeper related-issue pass state, if this is a Slate v2 issue-facing
    plan
11. final completion checks
12. scope exclusions already made explicit

Do not dump repo trivia into the prompt.

## Workflow

1. Discover the completion state file, active plan, continue skill reference,
   and completion gate command.
2. Read the completion state file and active plan.
3. Ensure the active plan has compact context grounding, adding it when missing
   from available evidence instead of creating a separate state system.
4. Set the completion state to `pending` immediately, before prompt emission
   or execution work.
5. Generate the continuation prompt from the active plan.
6. Write the prompt to `tmp/continue.md`.
7. Update the active plan ledger, if it exists, to record that execution started
   or resumed.
8. Sync any maintainer-facing reference docs named by the active plan,
   completion file, or governing skill when the current slice changes issue
   claims, public API shape, release gates, proof status, examples, or PR-review
   narrative.
9. For Slate v2 issue-facing plans, ensure one ClawSweeper related-issue pass
   exists for the touched surface before closure. If absent, schedule/start that
   pass and update `docs/slate-v2/ledgers/fork-issue-dossier.md`. If already
   complete and the issue-facing surface has not changed, do not rerun it.
10. If the active plan declares a pass schedule, start the first unfinished
    required pass and keep completion `pending` unless that pass closes the
    whole lane.
11. Otherwise start the first runnable execution slice from the active plan.
12. Do not print the full prompt in chat.
13. Return the one-sentence Stop-hook prompt only when you need to hand back a
    hook configuration line, after execution has started, or when execution is
    impossible for an explicitly named blocker.

## Output Contract

The continuation prompt must be easy to paste into one text box.

It should start with the project-local continue skill reference when available:

```md
[$continue](.agents/skills/continue/SKILL.md)
```

If no continue skill reference exists, start with a direct instruction:

```md
Continue the active plan. Reassess after each execution slice and keep moving
unless the lane is complete, truly blocked, or the user explicitly pauses.
```

The prompt must include:

```md
Read first:

- ...

Goal:

- ...

Context grounding:

- ...

North star:

- ...

Current next owner:

- ...

Scope lock:

- ...

Memory rules:

- ...

Completion-check rules:

- ...

Current pass state:

- ...

Current driver gates:

- ...

Pass schedule, when pass-gated:

- ...

Additional gates by touched area:

- ...

Related issue sweep rules:

- ...

Execution rules:

- ...

Required checkpoint fields:

- ...

Hard rules:

- ...

Completion target:

- ...

Stall rule:

- ...

Stop rule:

- ...
```

The chat response must be one sentence with a repo-relative link:

```md
Continue prompt - Sent to Codex when completion is blocked, so the task continues instead of stopping: [tmp/continue.md](tmp/continue.md)
```

Do not stop after emitting that sentence if the user asked to start execution
and a runnable next move exists.

## Rules

### Rule 1: Wire `continue`

Use the project-local `continue` skill if it exists.

Do not use a specialized duplicate continue skill when the generic `continue`
can govern the loop.

### Rule 2: Read-First Beats Repetition

Move stable task context into docs and link those docs from the prompt.

Prefer:

- active plan
- mutable execution ledger
- completion state file
- research / architecture decision page
- reusable context doc

Do not paste long repeated doctrine into the prompt if a linked doc owns it.

### Rule 2.5: Context Grounding

Before writing `tmp/continue.md` or starting a slice, make sure the active plan
or mutable ledger contains a compact grounding block:

- task statement
- desired outcome
- known facts/evidence
- constraints
- unknowns/open questions
- likely codebase touchpoints

If the block is missing, add it from the user request, active plan, completion
state, and read-first docs. Keep it short. Do not invent sidecar context
directories or another workflow system.

If grounding is still thin, continue with the safest evidence-gathering slice
and record the residual risk instead of asking the user for facts that can be
read from the repo.

### Rule 3: Scope Must Be Explicit

State exactly what the agent may touch and what it must avoid.

If shared fixes are allowed only when forced by measured evidence or failing
rows, say that plainly.

### Rule 3.5: TypeScript Examples Prefer Inference

For TypeScript examples, prefer inference. Do not annotate callback parameters,
alias broad node types, or use `as any` / public type casts unless the compiler
cannot infer the public API shape. Prefer type guards, `satisfies`, and fixed
generic surfaces over local assertions.

### Rule 4: Current Next Owner Must Be Named

Do not emit a generic "continue the task" prompt.

Name the next owner:

- package
- feature area
- architectural unit
- benchmark/proof owner
- blocker owner
- documentation owner
- release owner

### Rule 5: Driver Gates Are For Iteration

Driver gates should be fast and high-signal.

Do not stuff the full final gauntlet into `Current driver gates`.

Put broader checks in:

- `Additional gates by touched area`
- `Completion target`

Use the project's actual commands. Do not invent package-manager-specific
commands.

### Rule 6: Completion Check Is A Gate, Not A Suggestion

When the project has a completion state file or completion gate command,
include:

- read the completion state file before choosing the next move
- use the session-scoped completion state file for parallel sessions; the
  checker auto-selects `tmp/completion-checks/<session-id>.md` only when
  `COMPLETION_CHECK_ID`, `CODEX_THREAD_ID`, `CODEX_SESSION_ID`, `--id`, or
  `--file` selects it; otherwise it falls back to `tmp/completion-check.md`
- when `CODEX_THREAD_ID` exists, `ralph` should create or update
  `tmp/completion-checks/<CODEX_THREAD_ID>.md` and use that as the active
  completion state for this session
- set status `pending` before starting execution
- keep status `pending` while work remains
- set status `done` only when complete
- set status `blocked` only when no autonomous progress is possible
- never set status `blocked` just because the current slice is verified, the
  remaining work is large, or the completion gate needs to pass
- if any in-scope owner has a runnable next move, keep status `pending` and
  execute that move instead of stopping
- a completion gate failure while status is `pending` means continue
- the completion gate should pass only when status is honestly `done` or truly
  `blocked`

If the project has no completion gate, use the active plan's completion target
as the stop gate and say so.

### Rule 6.1: Current Pass State Lives In Completion Check

Use the completion state file as the lightweight pass-state store. Do not create
another state system for pass progress.

When a pass starts or changes, update the completion state file with this
shape:

```md
status: pending
plan: docs/plans/current-plan.md
current_pass: deslop-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/deslop-pass/SKILL.md
current_pass_owner: packages/editor
current_pass_scope: changed files
current_pass_trigger: code works but cleanup smell remains
current_pass_started_at: 2026-04-29T00:00:00Z
current_pass_updated_at: 2026-04-29T00:00:00Z
next_pass: verification-sweep-pass
```

Allowed `current_pass_status` values:

- `pending`
- `in_progress`
- `complete`
- `revise`
- `blocked`

Rules:

- The top-level `status` is the lane status, not the pass status.
- Keep top-level `status: pending` while a pass is running or while later passes
  remain.
- Set `current_pass_status: complete` when the pass closes but the lane still has
  more work.
- Set `current_pass_status: revise` when the pass found issues and the next move
  is a revision pass.
- Set top-level `status: done` only when all passes and completion gates are
  closed.
- Set top-level `status: blocked` only when no autonomous progress remains.
- Record pass evidence in the active plan or ledger; keep only concise pointers
  in the completion state file.

### Rule 6.2: Slate V2 Related Issue Sweep

For Slate v2 plans that touch public API, runtime behavior, browser behavior,
examples, issue claims, or PR narrative, run one ClawSweeper related-issue pass
for the touched surface before the lane can be called complete.

This is a one-pass discovery and accounting gate, not a per-edit ritual.

Run it when:

- the active plan has no completed ClawSweeper pass for the touched surface
- implementation changed which issue cluster, user-visible behavior, public API,
  browser behavior, or example surface is in scope
- the plan adds, removes, or changes any fixed, improved, related, or
  not-claimed issue status

Do not rerun it when:

- the current edit is only mechanical cleanup inside an already swept surface
- the active plan already records a completed ClawSweeper pass for the same
  issue cluster and no claim changed
- the slice is docs/tooling-only and explicitly unrelated to issue-facing Slate
  behavior

When it runs, record:

- `current_pass: clawsweeper-related-issues`
- `current_pass_skill: .agents/skills/clawsweeper/SKILL.md`
- touched issue surface: issue numbers, clusters, keywords, or source files
- `docs/slate-v2/ledgers/fork-issue-dossier.md` sections added or refreshed
- open-ledger, coverage-matrix, and PR-description updates or explicit
  no-change reasons

If the sweep finds no issue worth claiming, record that. Do not pad the lane
with fake issue numbers.

### Rule 6.3: Reference Docs Are Completion Artifacts

If a slice changes the maintainer-facing story, update the reference doc before
`done`, before a Stop-hook handoff, and before claiming the lane is ready.

This applies when the current slice changes any of:

- fixed, improved, related, or not-claimed issue rows
- public API shape
- release gates
- proof status
- examples or browser proof surfaces
- PR-review narrative

Use the exact files named by the active plan or governing skill. For Slate v2
lanes, this includes:

- `docs/slate-v2/references/pr-description.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-clusters.md`

If none of those docs need changes, record `reference docs: no change` with the
reason in the active plan, mutable ledger, or completion state file. Silent
skips are not allowed.

### Rule 6.5: Start Execution

After the completion state is `pending` and `tmp/continue.md` is written, start
the first runnable slice or required review pass from the active plan.

Do not stop at prompt generation.

If the plan names a current next owner, execute that owner.

If the plan is missing a current next owner, derive the first safe tracer slice
from the completion target and record that decision in the plan before
executing.

If no autonomous progress is possible, record the exact missing evidence,
tooling, access, or user decision, then set status `blocked`.

### Rule 6.6: Multi-Pass Review Lanes

Some plans are review or architecture-hardening lanes, not direct
implementation lanes. When the active plan declares pressure passes, review
passes, confidence gates, challenge ledgers, or phase gates:

- treat each required pass as a separate runnable owner
- run the earliest unfinished pass first
- complete at most one scheduled pass per activation unless the active plan
  explicitly allows batching passes
- keep status `pending` after a pass if later passes or revisions remain
- do not compress draft, evidence, challenge, revision, and closure into one
  mega-pass unless the active plan explicitly says to do that
- record each pass result in the active plan ledger before moving on
- after a pass finds issues, make the next owner the revision pass or the next
  named review pass, not generic execution
- after recording a pass result, refresh `tmp/continue.md` and let the next
  activation run the next pass while the completion state remains `pending`
- if the active lane is a planning/review gate, do not start implementation
  work just because `ralph` usually starts execution
- set status `done` only when the active plan's confidence gates, pass gates,
  final verification, and user-review readiness criteria all pass

For pass-gated review lanes, infer pass names from the active plan. If the plan
does not name them yet, use this neutral default order:

1. Draft / current-state score.
2. Evidence / context refresh.
3. Primary pressure passes.
4. Challenge ledger, if the plan requires one.
5. Revision pass that answers accepted challenges.
6. Closure score and final gates.

Keep specialized doctrine in the owning review skill, project rule, or active
plan. `ralph` only schedules and resumes the passes.

### Rule 6.6.1: Conditional Pass Skills

Use pass skills when their trigger is present. Do not load them as ceremony.

- `intent-boundary-pass`: planning or review lanes with unclear intent, scope,
  non-goals, or decision boundaries.
- `steelman-pass`: major decisions, paradigm changes, public API changes, or
  "users will think this changed for no reason" risk.
- `high-risk-deliberate-pass`: public API, data model, security, destructive,
  collaboration, runtime, release-gate, migration, or browser-sensitive changes.
- `tdd-pass`: bug fixes, new behavior, public-interface changes, or regression
  classes where a red-green-refactor slice should lock behavior first. Reuse the
  project `tdd` skill for the test discipline.
- `regression-lock-pass`: risky refactors or cleanup where behavior must be
  frozen before edits.
- `build-fix-pass`: failing build, typecheck, lint, package generation, or
  compiler gates where the right move is the smallest mechanical fix.
- `deslop-pass`: code works but changed files are bloated, repetitive, noisy,
  speculative, or over-abstracted.
- `performance-review-pass`: hot paths, React/Next rendering, editor runtime,
  subscriptions, algorithms, memory, network, query, bundle, or scalability
  concerns. Reuse `vercel-react-best-practices` and `performance-oracle` as
  applicable.
- `diff-review-pass`: final changed-files review, broader review-comment pattern
  sweep, or implementation-complete lane where verification passing is not
  enough by itself.
- `verification-sweep-pass`: closeout proof before `done`.
- `stall-debug-pass`: same failure, blocker, or rejected pass recurs three times.
- `visual-proof-pass`: visual parity, UI reference, screenshots, screenshots in
  issues, or browser-rendered surfaces are in scope.
- `security-pass`: auth, permissions, secrets, privacy, destructive actions,
  sandboxing, supply chain, or public security-sensitive surfaces are in scope.

When a pass skill runs, record its name in `current_pass_skill`, add a pass row
to the active plan or ledger, and return to `ralph` scheduling when the
pass closes.

### Rule 6.7: Fresh Evidence Closeout

Completion requires fresh evidence, not confidence prose.

Before setting status `done`, prove:

- run `check` script and it passed
- relevant commands, browser checks, generated proofs, or plan-specific gates ran
  in the current closeout slice or are explicitly cited as still-current evidence
- the output was read and the pass/fail result is recorded
- failures are fixed, accepted, or explicitly deferred by the active plan
- no `pending` or `in_progress` pass, owner, TODO, or review row remains
- no in-scope owner has a runnable next action

If visual/reference evidence is part of the active plan, include its measured
proof before `done`. Do not add visual gates to generic plans that never asked
for visual evidence.

If the final `check` command is red, do not set `status: done`. Make the next
owner the failing gate or `build-fix-pass`, keep the lane `pending`, and record
the exact failing command/output pointer in the active plan.

### Rule 6.8: Stall Detector

If the same failure, blocker, or rejected pass recurs three times, stop retrying
the same move. Record in the active plan:

- recurring symptom
- attempts already made
- evidence gathered
- why the next move is different, or why this is a real blocker

Only set `blocked` if every autonomous next move is exhausted. Otherwise keep
status `pending` and run the different next move.

### Rule 7: Stop Is Rare

The prompt must say:

- pivot is not stop
- replan is not stop
- risky/red/open lane is not stop
- typecheck or unrelated blocker is not stop if another in-scope owner has a
  runnable gate
- `Next move` means execute the next move

Stop only when:

- the active lane is complete
- all remaining work is explicitly accepted/deferred
- a hard blocker prevents all autonomous progress
- the user explicitly asks to pause

### Rule 8: Memory Is Mandatory

The prompt must require updating the mutable plan/ledger after every slice.

Include:

- actions taken
- commands run
- artifacts
- evidence
- hypothesis
- decision
- owner classification
- current pass, pass verdict, and next pass when the active plan is pass-gated
- changed files
- rejected tactics
- recurring failure count or stall signal
- next action

### Rule 9: Commands Must Be Relative

Do not emit command lines that change into another directory before running the
command.

Assume the agent runs commands from the correct repo.

Good:

- use the project's focused test command as written in the plan
- use the project's build/typecheck/lint commands as written in package scripts

Bad:

- commands prefixed with a directory change
- invented package-manager commands
- full filesystem path shell wrappers

### Rule 10: Paths Must Be Repo-Relative

Do not emit absolute filesystem paths in generated prompts or the chat sentence.

Good:

- `.agents/skills/continue/SKILL.md`
- `docs/plans/current-plan.md`
- `tmp/continue.md`

Bad:

- machine-specific user-directory paths
- full filesystem paths to repo files

### Rule 11: Keep It Pasteable

Do not prepend a long explanation.

Do not include numbered essays outside the continuation prompt file.

## Tone

Inside the prompt:

- direct
- concise
- operational

Avoid:

- long background explanations
- motivational language
- generic filler
