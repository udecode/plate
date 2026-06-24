---
date: 2026-04-09
topic: plite-broader-proof-depth-judgment
status: completed
---

# Plite Broader Proof-Depth Judgment

## Goal

Broaden proof depth enough to make the `True Plite RC` judgment honestly,
without reopening any closed contract-recovery lanes.

## Result

- fresh same-turn evidence now exists across:
  - core/history package proof
  - repo aggregate package-proof gate
  - `plite-react` package runtime proof
  - `plite-browser` package proof
  - broad current-example browser proof
  - IME local proof
  - persistent-annotation-anchors local proof
  - cross-repo replacement compatibility proof
- the remaining `runtime/browser` partial rows in
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/true-slate-rc-proof-ledger.md)
  are now closed
- the verdict stack is updated to:
  - `Target A`: `Go`
  - `Target B`: `Go`
  - earned `True Plite RC`
- perf wording stays lane-by-lane only and does not become a blanket “faster
  everywhere” claim

## Notes

- one stale compatibility expectation was fixed in
  [replacement-compatibility.test.ts](/Users/zbeyens/git/plite/playwright/integration/examples/replacement-compatibility.test.ts):
  the replacement mentions row now expects the already-proved tail-text
  selection at `[0,2]:1`
- one architect review pass returned `NEED ONE MORE THING` and named
  `yarn test` as the missing aggregate package-proof command; that command now
  passes in this same turn
- the root `yarn test:plite-browser:anchors` command was not the right same-turn
  local proof shape in this environment; the local wrapper run is the evidence
  used for judgment
- multiple architect-agent attempts were made during this Ralph run, but the
  agent tool did not return a usable verdict before shutdown; that is a tool
  failure, not treated as approval

## Verification

- `yarn test:custom`
- `yarn test`
- `yarn workspace slate-react run test`
- `yarn workspace plite-browser test`
- `yarn test:replacement:compat:local`
- `yarn test:plite-browser:e2e:local`
- `yarn test:plite-browser:ime:local`
- `bash ./scripts/run-plite-browser-local.sh 3100 /examples/persistent-annotation-anchors "yarn build:plite-browser:playwright && yarn exec playwright test playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium --workers=1"`
- `yarn lint:typescript`
