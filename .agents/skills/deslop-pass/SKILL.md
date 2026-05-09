---
description: Conditional pass for cleaning AI-like slop from scoped changed files after behavior is locked; use for deslop, cleanup, over-abstraction, duplication, dead code, noisy wrappers, and narrow refactors.
argument-hint: '[scope/files]'
disable-model-invocation: true
name: deslop-pass
metadata:
  skiller:
    source: .agents/rules/deslop-pass.mdc
---

# Deslop Pass

Handle $ARGUMENTS.

Use this as a bounded cleanup pass, not a broad rewrite.

## Use When

- Code works but the diff is bloated, repetitive, noisy, or over-abstracted.
- A cleanup/refactor/deslop request names a scope.
- Follow-up implementation left duplicate code, dead code, debug leftovers,
  weak naming, pass-through wrappers, or speculative abstractions.
- The active plan calls for a cleanup pass after behavior is already protected.

## Do Not Use When

- Behavior is not understood yet.
- No regression proof exists and a sane proof can be added first.
- The requested change is an architecture redesign, not cleanup.
- The scope is unbounded and no changed-file list or feature area is named.

## Completion-State Pass Fields

Before editing, update the completion state file:

```md
status: pending
current_pass: deslop-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/deslop-pass/SKILL.md
current_pass_scope: <files or feature area>
current_pass_trigger: <cleanup smell>
```

When done, keep top-level `status: pending` unless the whole lane is complete,
then set:

```md
current_pass_status: complete
next_pass: verification-sweep-pass
```

Use `current_pass_status: revise` when cleanup exposed behavior or design issues.

## Procedure

1. Scope the pass to the requested files, changed files, or named feature area.
2. Identify the behavior lock: existing test, new targeted test, browser proof,
   or explicit manual proof.
3. List smells before editing:
   - duplication
   - dead code
   - needless abstraction
   - boundary violation
   - noisy naming or error handling
   - missing focused tests
4. Fix one smell class at a time.
5. Re-run targeted verification after each risky cleanup.
6. Do not add dependencies or abstractions unless the active plan explicitly
   requires them.
7. Stop when the scoped smell is gone; do not widen into unrelated files.

## Output

Record in the active plan or ledger:

- scope
- behavior lock
- smells removed
- files changed
- verification run
- remaining risks
- next pass
