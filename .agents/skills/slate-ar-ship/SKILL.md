---
description: Slate v2 one-command ship/readiness mini-skill. Runs finalization preview, picks the review shape, runs pre-commit gates/autoreview, pauses for commit approval, then commits/finalizes after confirmation.
argument-hint: '[optional override: preview | pr]'
disable-model-invocation: true
name: slate-ar-ship
metadata:
  skiller:
    source: .agents/rules/slate-ar-ship.mdc
---

# Slate AR Ship

Handle $ARGUMENTS.

Use this when the user wants Slate v2 AR work made reviewable or shippable.
This is not a synonym for "commit everything" unless the user explicitly asks
for a commit.

## Contract

Load `slate-ar` and `slate-ar-finalize`.

Plain `slate-ar-ship` is the primary command. Do not make the user remember
`current-tree`, `review`, or `commit current-tree` parameters for the normal
flow.

Default no-arg path:

1. run `slate-ar-finalize` preview behavior first;
2. decide whether kept AR evidence or current-tree review is the honest unit;
3. if current-tree is the honest unit and dirty state blocks finalization, run
   the pre-commit review path instead of stopping at "dirty";
4. report the recommended review unit;
5. run proof gates when the user asked to ship, review, commit, or when dirty
   current-tree code needs pre-commit confidence;
6. run `autoreview` on the uncommitted current tree before any commit/PR when
   meaningful code changed;
7. pause with `READY TO COMMIT` only when proof/review is clean enough or
   explicitly blocked with accepted residual risk;
8. ask for commit approval in plain language. Do not ask the user to rerun the
   skill with parameters.

Plain `slate-ar-ship` is allowed to run non-mutating readiness work
(`finalize-preview`, `finalize-current-tree` preview, focused gates,
`autoreview`) because that is the point of ship readiness. It is not allowed to
commit, branch, clean, push, or open a PR unless the user explicitly asks for
that mutation.

Plain `slate-ar-ship` must keep the operator on the source branch, normally
`v2`. It must not create `autoresearch-review/*` branches. Review branches are
an opt-in expert action, not part of the default ship flow.

After a `READY TO COMMIT` pause, a short confirmation like "yes", "go",
"commit", or "ok" is explicit approval to continue the same `slate-ar-ship`
flow. Do not require parameters. That approval covers committing the reviewed
current-tree work and rerunning current-tree readiness previews. It does not
approve review-branch creation, push, PR, branch cleanup, or destructive
cleanup.

## Current Tree

Use current-tree finalization when:

- useful work was bundled, corrected, or reverted outside kept AR packets;
- the branch has many unkept commits that are intentionally part of the review;
- kept-packet finalization would hide the real review unit.

Do not pretend current-tree finalization is a commit. It is review-shape and
evidence preparation.

For the default flow, "current-tree finalization" means
`finalize-current-tree --exclude-session-artifacts` preview/readiness only. Do
not run `finalize-autoresearch.mjs <plan>` unless the user explicitly asks to
create review branches.

## Pre-Commit Current-Tree Review

When current-tree finalization is the honest review unit but blocks on a dirty
tree, do not tell the user to commit first and review later. That is backwards.

Run this pre-commit path:

1. keep the review unit as current-tree;
2. run the narrowest relevant `slate-ar-gate` proof when editor behavior,
   browser behavior, perf, or public package behavior changed;
3. run `autoreview` against the uncommitted `.tmp/slate-v2` diff when
   non-trivial code changed;
4. fix accepted P0/P1 findings that are in scope, then rerun the focused proof;
5. only after review/proof is clean or blocked with accepted residual risk,
   print `READY TO COMMIT` and pause;
6. after confirmation, use normal repo `git` commands directly;
7. after commit, rerun `slate-ar-finalize current-tree` as a preview only so
   readiness sees a clean, exact `HEAD`.

`slate-ar-ship commit current-tree` is still valid, but it is not the preferred
DX. Treat it the same as a post-pause commit confirmation.

## Review And Commit

- Use `autoreview` as closeout for non-trivial code changes before committing,
  not after.
- Use focused gates from `slate-ar-gate` when editor behavior changed.
- Before committing, classify dirty files into review-unit files and AR session
  artifacts (`autoresearch.*`, `autoresearch.research/**`, dashboard exports,
  generated finalization scratch). Finalization excludes session artifacts by
  default.
- Use normal repo `git` commands directly after the user confirms.
- Commit the reviewed current-tree work. Do not include AR session artifacts
  unless the user explicitly asks to include session artifacts.
- If uncommitted session artifacts would keep the source branch dirty after the
  review-unit commit, stash them before rerunning current-tree finalization and
  report that stash. Do not delete them.
- Do not create `autoresearch-review/*` review branches after commit unless the
  user explicitly asks for review branches. A clean current-tree preview is
  enough for the default handoff.
- Push and PR still require explicit user approval after finalization.

## Handoff

Report:

- recommended review unit;
- finalization warnings;
- gates and autoreview status;
- `READY TO COMMIT` when the next step is commit approval;
- after commit/readiness preview, whether push/PR approval is still needed;
- blockers or residual risks.
