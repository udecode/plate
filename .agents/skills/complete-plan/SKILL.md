---
description: Generate tmp/continue.md from the active plan, set the completion state to pending, then start the next runnable slice or review pass.
name: complete-plan
metadata:
  skiller:
    source: .agents/rules/complete-plan.mdc
---

# Complete Plan

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
- respects the project's completion state file when one exists
- encodes a real stop rule, not a cooldown crutch
- writes the result to `tmp/continue.md`
- sets the completion state to `pending`
- starts the active plan's next runnable slice or required review pass in the
  current turn

## Discovery

Resolve project conventions before writing:

1. Completion state file:
   - prefer the file named by the user or active plan
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
5. current next owner
6. current strongest safety gate
7. current strongest progress gate
8. pass schedule / pressure passes / review gates, if the active plan has them
9. final completion checks
10. scope exclusions already made explicit

Do not dump repo trivia into the prompt.

## Workflow

1. Discover the completion state file, active plan, continue skill reference,
   and completion gate command.
2. Read the completion state file and active plan.
3. Set the completion state to `pending` immediately, before prompt emission
   or execution work.
4. Generate the continuation prompt from the active plan.
5. Write the prompt to `tmp/continue.md`.
6. Update the active plan ledger, if it exists, to record that execution started
   or resumed.
7. If the active plan declares a pass schedule, start the first unfinished
   required pass and keep completion `pending` unless that pass closes the
   whole lane.
8. Otherwise start the first runnable execution slice from the active plan.
9. Do not print the full prompt in chat.
10. Return the one-sentence Stop-hook prompt only when you need to hand back a
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

Current driver gates:
- ...

Pass schedule, when pass-gated:
- ...

Additional gates by touched area:
- ...

Execution rules:
- ...

Required checkpoint fields:
- ...

Hard rules:
- ...

Completion target:
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

### Rule 3: Scope Must Be Explicit

State exactly what the agent may touch and what it must avoid.

If shared fixes are allowed only when forced by measured evidence or failing
rows, say that plainly.

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
  work just because `complete-plan` usually starts execution
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
plan. `complete-plan` only schedules and resumes the passes.

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
