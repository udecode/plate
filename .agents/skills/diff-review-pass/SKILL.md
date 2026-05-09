---
description: Conditional final changed-files review pass for correctness, architecture, cleanup, tests, and broader review-pattern sweeps before done.
argument-hint: '[scope/files]'
disable-model-invocation: true
name: diff-review-pass
metadata:
  skiller:
    source: .agents/rules/diff-review-pass.mdc
---

# Diff Review Pass

Handle $ARGUMENTS.

Use this as a focused changed-files review before closeout or after review
comments. It is not a broad architecture review unless the diff itself changed
architecture.

## Use When

- A lane is implementation-complete and needs final changed-files review.
- Review comments suggest a broader pattern may exist in the diff.
- The active plan requires a final human-style diff sweep.
- A change is large enough that verification passing is not sufficient.

## Do Not Use When

- No files changed.
- The current pass is still implementing.
- The user asked for a full architecture plan instead of diff review.
- The only remaining work is a deterministic build/typecheck failure; use
  `build-fix-pass` first.

## Completion-State Pass Fields

Before reviewing, update the completion state file:

```md
status: pending
current_pass: diff-review-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/diff-review-pass/SKILL.md
current_pass_scope: changed files
current_pass_trigger: final changed-files review
```

When done, keep top-level `status: pending` unless the whole lane is complete,
then set:

```md
current_pass_status: complete
next_pass: verification-sweep-pass
```

Use `current_pass_status: revise` when the review finds in-scope issues.

## Procedure

1. Identify changed files and scope.
2. Review for bugs first, then architecture, tests, performance, security,
   maintainability, and cleanup.
3. If a review comment exists, use [review-sweep](.agents/rules/review-sweep.mdc)
   to infer and apply objective diff-wide patterns.
4. Do not widen beyond the current diff unless the active plan explicitly allows
   it.
5. Record findings as:
   - P0/P1 must-fix
   - P2 should-fix
   - accepted risk
   - no issue
6. If issues are found, make the next pass a revision pass, `deslop-pass`,
   `performance-review-pass`, `security-pass`, or `build-fix-pass` as
   appropriate.

## Output

Record in the active plan or ledger:

- changed-files scope
- findings by severity
- broader patterns swept
- fixes made or next owner
- verification required
- lane status recommendation
