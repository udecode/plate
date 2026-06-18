---
description: Finalization shortcut for Slate v2 Autoresearch. Runs preview-only finalization by default, explains review-branch/current-tree options, and requires explicit review-branch approval before branch creation.
argument-hint: '[preview | current-tree preview | review branches]'
disable-model-invocation: true
name: slate-ar-finalize
metadata:
  skiller:
    source: .agents/rules/slate-ar-finalize.mdc
---

# Slate AR Finalize

Handle $ARGUMENTS by loading `slate-ar` and running its finalization mode.

Use this when the user wants to turn kept Slate AR work into reviewable output.

Default contract:

- Run Codex Autoresearch `finalize-preview --cwd .` first.
- Treat preview as read-only evidence.
- Report kept evidence, excluded session artifacts, dirty-tree warnings,
  semantic-safety warnings, overlap warnings, unkept commits, and final-tree
  coverage.
- Use `finalize-current-tree` as a read-only readiness preview when the current
  tree is the intended review unit.
- Do not execute `finalize-autoresearch.mjs <plan>` or create
  `autoresearch-review/*` branches in default, `preview`, `current-tree`, `ship`,
  `perfect`, or `next` flows.
- Review branches are opt-in only. The user must explicitly say `review
  branches`, `create review branches`, or equivalent branch-creation wording in
  the current turn.
- Do not create branches, clean files, commit, push, or open PRs without exact
  approval for that mutation.

Plain `go`, `ok`, `continue`, `next`, `ship`, `finalize`, or `current-tree`
means keep working on `v2` and report readiness. It does not approve branch
creation.

This skill is the memorable entrypoint for finalization. The detailed safety
rules live in `slate-ar`.
