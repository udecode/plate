---
date: 2026-06-03
topic: stable-slate-automation-batch
status: complete
goal_status: complete
---

# Stable Slate Automation Batch

## Objective

Validate the `slate-automation` loop on stable/current Slate v2 features while
finding and safely fixing real regressions, oracle gaps, API/DX gaps, and
workflow misses.

## Mode

- invocation: `slate-automation existing Slate v2 feature regression + API/DX validation`
- mode: timed 1h batch-loop
- start: 2026-06-03T16:36:29+02:00
- deadline: 2026-06-03T17:36:29+02:00
- soft checkpoints: queue for final handoff

## Scope

- include: richtext, plaintext, markdown shortcuts, history,
  selection/navigation, editable voids, placeholder/custom-placeholder,
  hidden content, DOM coverage, core package API/DX, tests/oracles, workflow
  repair
- exclude: broad pagination/virtualization architecture or optimization
- huge-document: smoke only when evidence suggests generic regression risk

## Completion Threshold

- behavior-first proof run across stable feature owners
- visual/browser proof for visible or selection/layout-sensitive failures
- safe runtime/test/oracle/workflow patches kept only with proof
- risky or broad architecture findings routed to `slate-plan`
- final handoff includes changed list, workflow slowdowns, needs attention, and
  queued stopping checkpoints

Objective:

Validate stable/current Slate v2 behavior and API/DX with `slate-automation`,
repair safe regressions/oracles/workflow misses, and hand off the timed batch
with review guidance.

Completion threshold:

Stable Chromium behavior proof, focused API/history/package contracts,
`slate-browser` proof, `.tmp/slate-v2` `bun check`, Plate docs audit, changed
list, workflow slowdown ledger, review-attention list, and stopping checkpoint
queue are recorded.

Verification surface:

`.tmp/slate-v2` browser examples, generated stress, `packages/slate`,
`packages/slate-browser`, `packages/slate-history`, public docs, and the
Plate control plan/docs audit.

Constraints:

Do not optimize pagination architecture in this batch. Patch only safe runtime,
oracle, docs, and workflow misses. Do not commit, push, branch, or create PR.

Boundaries:

Huge-document and pagination evidence is smoke/regression signal only. Broad
virtualization architecture/perf routing belongs to `slate-plan` or the
pagination-specific AR lanes.

Blocked condition:

The batch is not blocked. No authority, taste, credential, branch, commit, or
product decision is required before review.

Work Checklist:

- [x] Read `slate-automation`, `vision`, and Slate v2 agent start.
- [x] Run stable behavior proof.
- [x] Repair the generated paste-html image stress oracle.
- [x] Repair thrown-transaction rollback correctness.
- [x] Repair public API/docs contract drift.
- [x] Run package, browser, and docs verification.
- [x] Record changed list, workflow slowdowns, review attention, and stopping
  checkpoints.

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| taste/status | complete | P0, agent-start and north-star read |
| behavior proof | complete | focused Chromium examples 140 passed, 3 skipped |
| oracle repair | complete | paste-html stress family passed |
| API/DX repair | complete | 409-contract and 439-contract packets passed |
| package proof | complete | `bun check`, package typechecks, slate-browser proof |
| handoff | complete | ledgers and review sections updated |

Verification evidence:

Final evidence is recorded in the Evidence section below: focused browser
packet, generated stress packet, API/history contracts, package typechecks,
`slate-browser` proof, `.tmp/slate-v2` `bun check`, docs audit, and
`git diff --check`.

Reboot status:

Resume from this plan by reading Packet Ledger rows P1-P5 and rerunning the
Evidence commands if the checkout changed after this batch.

Open risks:

None known for the patched packets. Firefox/WebKit/mobile were not rerun in
this one-hour validation batch; claim width is Chromium plus package gates.

## Checkpoint State

- [x] Read latest user request.
- [x] Read `slate-automation` generated skill.
- [x] Read `vision` generated skill.
- [x] Read `docs/slate-v2/agent-start.md`.
- [x] Run stable behavior proof packet.
- [x] Patch safe bugs/oracles/workflow misses.
- [x] Run API/DX proof packet.
- [x] Run visual/browser proof for visible failures.
- [x] Update changed list, review attention, and stopping checkpoints.

## Packet Ledger

| id | owner | hypothesis/failure | evidence | decision | reason | next |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | taste | automation scope is stable-feature validation, not pagination optimization | user request, `slate-automation`, `vision`, `agent-start` | keep | scope and stop policy are clear | behavior proof |
| P1 | behavior | stable Chromium editor behavior may have regressions | accidental broad run: 408 passed, 1 stress failure; final focused run: 140 passed, 3 skipped | keep | stable behavior is green on final tree; stress failure became oracle packet | API/DX |
| P2 | oracle | `paste-html-image-void` stress expected one image after pasting two image tags | narrow repro failed; artifact expected two images/two void shells; patched stress counts and contract wording; rerun passed | keep | oracle contradicted pasted HTML and generated artifact | package proof |
| P3 | runtime | failed `editor.update` left inserted nodes after rollback | API packet failed `state-tx-public-api-contract`; patched rollback-only inverse operation rewind before snapshot restore; focused contract passed | keep | fixes correctness without normal-path cloning | fast gate |
| P4 | API/DX docs | public surface/docs guards were stale | added `subscribeCommit` to public-method contract; removed docs examples that teach app-owned `contentEditable={false}` void chrome; public/docs contract passed | keep | aligns docs/tests with accepted public API and runtime-owned void shell | gate |
| P5 | validation | edited runtime, contracts, docs, and stress need final proof | `bun check`; package typechecks; slate-browser proof; focused browser packet; docs audit; `git diff --check` | keep | final tree proof is green enough for this batch | handoff |

## Workflow Slowdown Ledger

| step | owner | elapsed/expected | reason | evidence | repair |
| --- | --- | --- | --- | --- | --- |
| accidental full Chromium run | automation command | ~3.8m / expected focused subset | used `bun playwright test ...`, which expanded to `playwright test test ...` and broadened to integration/stress | 408 passed, 1 stress failure, 17 did not run | use `bun run playwright ...`; no skill patch needed because the mistake is command discipline, not routing |
| Bun explicit file paths | API proof command | <1m / expected instant | `bun test packages/...` treats non-`.test` filenames as filters; explicit files need `./` | first API packet did not match files | use `bun test ./packages/...`; queue no user question |
| Playwright web server rebuild | browser proof | ~9-30s setup per packet | `playwright` webServer rebuilds static site for each packet | repeated build output in stress and focused browser runs | acceptable for honest browser proof; future optimization would cache/reuse server in longer runs |
| custom plan shape | autogoal | <5m / expected one pass | initial plan used Markdown headings but `check-complete.mjs` expects colon-label sections | first completion check failed on missing machine-readable sections | add closure block; future automation should use the autogoal template when possible |

## Changed List

- code/runtime/API: `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
  rewinds live transaction operations on rollback before restoring snapshot
  state.
- tests/oracles/browser proof:
  `.tmp/slate-v2/playwright/stress/generated-editing.test.ts` expects two
  pasted images/two void shells for the two-image paste case.
- benchmarks/metrics/targets: none.
- examples/docs: added this run plan; updated `.tmp/slate-v2` roots/editable/DOM
  coverage docs to avoid teaching app-owned `contentEditable={false}` void
  shell markup.
- skills/workflow: none.
- reverted/quarantined packets: none.

## Needs Your Attention

- Inspect rollback helper in
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts`; recommendation:
  accept, because it only runs on thrown transactions and avoids normal-path
  document cloning.
- Inspect docs wording in `.tmp/slate-v2/docs/concepts/13-roots.md` and
  `.tmp/slate-v2/docs/libraries/slate-react/editable.md`; recommendation:
  accept if header chrome is the preferred teaching shape.
- Decide whether long automation should promote a cached Playwright server mode;
  recommendation: defer unless repeated overnight runs waste more time here.

## Stopping Checkpoints To Unblock

- none. No product/taste/authority decision blocked this batch.

## Evidence

- memory quick pass: `MEMORY.md` Slate v2 notes confirm live implementation is
  `.tmp/slate-v2` and browser selection regressions need real interaction proof.
- command: `ps -p 16937 -o pid,stat,etime,command`
  - result: no aborted autoreview process remained.
- command: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright test ... --project=chromium`
  - result: accidental broad run, 408 passed, 1 failed
    (`paste-html paste-html-image-void`), 4 skipped, 17 did not run.
- command: `STRESS_ROUTES=paste-html STRESS_FAMILIES=paste-html-image-void PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium`
  - result: failed before oracle patch, passed after patch.
- command: `bun test ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/range-ref-contract.ts`
  - result: 409 passed, 0 failed.
- command: `bun test ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/read-update-contract.ts ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/headless-contract.ts ./packages/slate-history/test/history-contract.ts`
  - result: 439 passed, 0 failed.
- command: `bun --filter slate typecheck`
  - result: passed.
- command: `bun --filter slate-browser typecheck`
  - result: passed.
- command: `bun --filter slate-browser test:proof`
  - result: 26 passed, 0 failed.
- command: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/select.test.ts --project=chromium`
  - result: 140 passed, 3 skipped.
- command: `bun check`
  - result: passed; existing pagination hook dependency warning only.
- command: `pnpm docs:slate-v2:audit`
  - result: passed.
- command: `git diff --check`
  - result: passed.
