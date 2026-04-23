---
date: 2026-04-08
topic: slate-v2-target-b-steps-1-6
status: in_progress
source: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-target-b-steps-1-6-20260407T222026Z.md
---

# Slate v2 Target B Steps 1-6 Execution Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Execute the first six remaining hardening steps for `slate-v2`:

1. make the shipping release gate real
2. deepen the core `slate` oracle harvest
3. deepen proof for widened current families
4. finish the public/package deletion audit
5. resolve the performance story
6. re-run the real final gate from clean state

## Phases

1. Baseline and gap audit
2. Shipping gate + docs alignment
3. Oracle/proof/deletion audit implementation
4. Performance lane decision or fix
5. Final verification gate
6. Architect review, deslop, regression re-check

## Progress

- created fresh Ralph context snapshot
- created focused execution plan for steps 1-6
- restored the root replacement command graph in
  `/Users/zbeyens/git/slate-v2/package.json`
- restored root `slate-browser` commands and made them executable under Yarn PnP
- fixed root TS project references to deleted `*-v2` package paths
- fixed Rollup React 19 JSX-runtime interop for release builds
- hardened the replacement compatibility matrix for iframe/plaintext/slow legacy
  route rows
- reran:
  - `yarn test:slate-browser`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime:local`
  - `yarn test:slate-browser:anchors`
  - `yarn test:replacement:compat:local`
  - `yarn build:rollup`
  - `yarn lint:typescript`
- refreshed the live replacement docs around shipping-gate parity and the latest
  lane-by-lane perf story
- refreshed the consensus plan and full regression-audit plan
- wrote the maintainer diff register:
  `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`

## Open Risks

- final same-turn `yarn prerelease` exit still needs one clean confirmation
- widened family proof is still thinner than a blanket `Target B` claim
- richtext and editable-void benchmark lanes remain volatile / mixed and still
  block broad perf language
