---
description: Conditional closeout pass for fresh verification evidence before marking a lane done; use for test, lint, typecheck, build, browser, visual, security, and plan-specific proof sweeps.
argument-hint: '[scope/plan]'
disable-model-invocation: true
name: verification-sweep-pass
metadata:
  skiller:
    source: .agents/rules/verification-sweep-pass.mdc
---

# Verification Sweep Pass

Handle $ARGUMENTS.

Use this before setting completion to `done`.

## Use When

- A lane is near completion.
- A pass changed code, tests, build config, docs that require generated output, or
  browser-visible behavior.
- The active plan names final gates.
- A previous proof is stale after cleanup or revision.

## Do Not Use When

- The current pass is still mid-edit.
- A blocker prevents all verification and must be recorded first.
- The user explicitly asked to skip checks; still record the skip and risk.

## Completion-State Pass Fields

```md
status: pending
current_pass: verification-sweep-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/verification-sweep-pass/SKILL.md
current_pass_scope: <changed surface>
current_pass_trigger: closeout proof
```

Set top-level `status: done` only when the whole lane is complete.

## Procedure

1. Read the active plan's final gates.
2. List every relevant proof:
   - tests
   - lint
   - typecheck
   - build or package generation
   - browser proof
   - visual proof
   - security/static scan
   - completion command
3. Run the smallest honest set that proves the changed surface.
4. Read outputs. Do not infer success from command launch.
5. If a proof fails, record the failure and next owner.
6. If all proofs pass and no pass remains, set the lane to `done`.
7. If proofs pass but later passes remain, keep lane `pending` and set the next
   pass.

## Output

- proof list
- commands/artifacts
- pass/fail results
- skipped proofs with reason
- remaining pass owners
- lane status recommendation: `pending`, `done`, or `blocked`
