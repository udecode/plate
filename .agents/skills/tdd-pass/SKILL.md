---
description: Conditional pass that applies the existing tdd skill as a one-slice red-green-refactor loop for bug fixes, behavior additions, and regression locks.
argument-hint: '[behavior/scope]'
disable-model-invocation: true
name: tdd-pass
metadata:
  skiller:
    source: .agents/rules/tdd-pass.mdc
---

# TDD Pass

Handle $ARGUMENTS.

Use this as a test-first implementation or bug-fix pass. Read and follow
[tdd](.agents/skills/tdd/SKILL.md); this wrapper only defines when and how the
pass participates in the completion-check loop.

## Use When

- A bug needs a reproducing test before the fix.
- A new behavior has a public interface and observable acceptance criteria.
- A risky behavior change needs one vertical red-green-refactor slice.
- The active plan explicitly asks for TDD.

## Do Not Use When

- The task is pure docs, formatting, or generated metadata.
- The behavior cannot be exercised through a public interface yet.
- Existing proof already locks the behavior and the next step is only cleanup.
- The user explicitly asks to skip test-first work; record the risk instead.

## Completion-State Pass Fields

Before editing, update the completion state file:

```md
status: pending
current_pass: tdd-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/tdd-pass/SKILL.md
current_pass_scope: <behavior/scope>
current_pass_trigger: behavior requires red-green-refactor proof
```

When done, keep top-level `status: pending` unless the whole lane is complete,
then set:

```md
current_pass_status: complete
next_pass: <next implementation, deslop, or verification pass>
```

Use `current_pass_status: revise` when the red phase reveals unclear
requirements, a wrong public interface, or missing test infrastructure.

## Procedure

1. Name the public behavior under test.
2. Choose one vertical slice. Do not write a horizontal suite first.
3. Read [tdd](.agents/skills/tdd/SKILL.md).
4. RED: add one behavior test through public API and run it.
5. Confirm the failure is expected, not a typo or harness error.
6. GREEN: implement the minimal code needed for that test.
7. REFACTOR: clean only the touched seam while tests stay green.
8. Record the cycle and next behavior slice or next pass.

## Output

Record in the active plan or ledger:

- public behavior
- red test and expected failure
- actual failing output summary
- minimal implementation
- refactor, if any
- verification run
- next pass
