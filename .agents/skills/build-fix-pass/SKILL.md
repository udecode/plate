---
description: Conditional pass for fixing failing build, typecheck, lint, or compilation gates with the smallest behavior-preserving diff.
argument-hint: '[failing command/scope]'
disable-model-invocation: true
name: build-fix-pass
metadata:
  skiller:
    source: .agents/rules/build-fix-pass.mdc
---

# Build Fix Pass

Handle $ARGUMENTS.

Use this as a narrow repair pass, not a refactor.

## Use When

- Build, typecheck, lint, package generation, or compilation fails.
- A completion gate is blocked by deterministic compiler or tool output.
- A previous implementation pass left mechanical errors.
- The user asks to fix the build or type errors.

## Do Not Use When

- The failure is a behavior regression that needs a new test first.
- The fix requires architecture redesign.
- The command output is stale and can be rerun cheaply.
- The failing surface is unknown and no command can reproduce it.

## Completion-State Pass Fields

Before editing, update the completion state file:

```md
status: pending
current_pass: build-fix-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/build-fix-pass/SKILL.md
current_pass_scope: <failing command or package>
current_pass_trigger: build/typecheck/lint failure
```

When done, keep top-level `status: pending` unless the whole lane is complete,
then set:

```md
current_pass_status: complete
next_pass: verification-sweep-pass
```

Use `current_pass_status: revise` when the build failure exposes a missing
test, design gap, or behavior decision.

## Procedure

1. Run or read the exact failing command.
2. Categorize errors by root cause, not by raw line count.
3. Fix the smallest error cluster first.
4. Do not refactor, rename public APIs, add abstractions, or optimize while the
   build is red.
5. Rerun the focused command after each risky cluster.
6. If a failure indicates missing behavior coverage, hand off to `tdd-pass` or
   `regression-lock-pass` before changing behavior.
7. Stop when the failing gate is green and record any remaining broader issues.

## Output

Record in the active plan or ledger:

- failing command
- root-cause clusters
- files changed
- fixes applied
- verification run
- remaining risks
- next pass
