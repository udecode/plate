---
description: Conditional pass for recurring failures, repeated blockers, or repeated rejected passes; forces a new hypothesis and different next move instead of retry loops.
argument-hint: '[failure/blocker/pass]'
disable-model-invocation: true
name: stall-debug-pass
metadata:
  skiller:
    source: .agents/rules/stall-debug-pass.mdc
---

# Stall Debug Pass

Handle $ARGUMENTS.

Use this when the same thing failed enough times that another retry is probably
fake progress.

## Use When

- The same command, test, browser action, or review pass fails three times.
- A pass keeps returning `revise` for the same reason.
- The agent keeps reopening the same hypothesis with no new evidence.
- Completion is stuck but another autonomous route may exist.

## Do Not Use When

- The first failure has not been investigated.
- The next move is already materially different.
- A real hard blocker already prevents all autonomous work.

## Completion-State Pass Fields

```md
status: pending
current_pass: stall-debug-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/stall-debug-pass/SKILL.md
current_pass_scope: <recurring failure>
current_pass_trigger: repeated failure
```

## Procedure

1. Name the recurring symptom.
2. List attempts already made.
3. Extract the invariant: what did not change across attempts?
4. Form a new hypothesis that explains all attempts.
5. Choose a different next move:
   - smaller repro
   - different proof
   - dependency/env check
   - scope cut
   - plan revision
   - explicit blocker
6. Record why the next move is not the same retry.
7. Set top-level `blocked` only if every autonomous next move is exhausted.

## Output

- recurring symptom
- failed attempts
- invariant
- new hypothesis
- different next move
- lane status recommendation
