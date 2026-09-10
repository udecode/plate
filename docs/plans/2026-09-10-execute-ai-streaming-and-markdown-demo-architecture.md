# Execute AI streaming and Markdown demo architecture

Objective:
Execute the accepted [architecture plan](2026-09-10-ai-streaming-and-markdown-demo-architecture.md), preserving rich text, Markdown/MDX, ordinary editor behavior, and the stated correctness and performance gates.

Execution authorization:
The user requested implementation of the exact plan, then pulling latest next. The earlier planning-only limit is superseded. No commit, push, PR, release, or tool goal was requested.

Status: **Optimization paused at the user’s request; current implementation handoff is complete.** P0–P5 runtime and adoption changes are present. The original architecture plan is not fully accepted: performance budgets, the complete baseline/matrix and final native clipboard replay remain open. The user narrowed this turn to verification and handoff of existing changes. No further optimization or public notification API is included.

Source boundary: `next` fast-forwarded from `1a52e4b5bc` to `f03d2b8c23`. Work remains uncommitted.

First checkpoint / Work Checklist:
- [x] Pull origin/next first; clean next fast-forwarded to f03d2b8c23.
- [x] P0: absent-property deletion is a no-op; preserve existing deletion, other updates, compare/merge, split, named roots; investigate general empty publication only on separate proof.
- [x] P0: bottom-layer regression and List + Markdown + AIChat paragraph/column exact replay.
- [x] P0: Plate/PlateStatic × Columns, Links, Lists, List With Image, Nested Structure Block, Table; forward/back, play/pause/replay/reset/scenario/mode switches and unmount cancellation; reproduce control failures before fixes; accessible controls and honest mode labels.
- [ ] P1: freeze full parse, intermediate prefixes, insertion/edit/dialog and Undo baseline on identical recorded chunks.
- [x] P2: raw model source is the only parser input; no serialization feedback; zero/duplicate/stale events, replacement snapshots, multi text parts, final tail; preserve streaming Markdown/MDX rich text and current codec.
- [ ] P2: arbitrary chunk partition final semantic equivalence, excluding only proven nonsemantic runtime identities; nested/self-closing MDX, every tag/attribute/expression truncation, quotes/comments/fences; links/footnotes/setext/list continuation and whitespace.
- [ ] P3: shared operation identity/target/state for insert/edit/dialog, independent draft after view prototype proof; Stop partial preview differs from final parse; no placeholder persistence; visible errors, no automatic production mock.
- [x] P3: accept one new history batch including suggestion cleanup/selection; one Undo/Redo, double Accept idempotence; discard preserves redo, retry uses same target; user edits/collaboration/target deletion/anchors, named roots/discrete selections/table/comments separately proved.
- [ ] P4: prototype before target lock; no speculative parser/framework/cache/worker; retain full correct fallback for backward syntax dependencies; preserve live original-position suggestions, scrolling intent and background completion flush.
- [ ] P4: 1/10/100 KB plus 1 MB stress; 1/16/128-character and recorded chunks; vary background and target size separately; long paragraph/table/code/math/MDX and backward dependencies; 3 warmups/10 measurements, cold/warm p95/noise plus bytes/diff/node/render/history counters.
- [x] Freeze budgets before candidate results: 100 KB preview p95 ≤16 ms, final preview/Accept/Undo/Redo ≤100 ms, ordinary regression ≤10% and ≤2 ms beyond measured noise; stress/MDX explicit limits, no after-result relaxation.
- [ ] P5: remove proven redundant owners/fields only after callers/exports/types/docs/tests adoption; best-api repair for changed reusable API; changesets, registry changelog, generated registry on next, barrels when needed.
- [ ] Verification: focused Plate tests, actual Plite test runner and counts, check:plite:dev then strict check:plite, owning Plate typecheck/lint and Browser; no autoreview on next.
- [ ] Preserve current Markdown/MDX import/export/custom nodes, live rich text, in-place review, insert/replace/below, comments/tables, normal input/selection/non-AI history/collaboration; Copilot excluded.
- [ ] No parser replacement, plain-text downgrade, alternate HTML/JSON protocol, swallowed errors, relaxed correction-cycle detection or weakened semantic assertions.
- [ ] No commit, push, release or PR. Final handoff: changed owners, actual tests/browser/performance evidence, open gates/risks and uncommitted status. No timing requirement.

## Current implementation

- Markdown owns cumulative source and incremental parsing. Settled prefixes retain identity. Unknown transforms and backward syntax dependencies use the same full parser. AI never reparses serialized preview content.
- AI owns one request identity, captured targets, source, detached preview, errors and staged tools. Retry retains targets. Stale frames cannot change a newer operation.
- Partial edits, table replacements and comment ranges use canonical nonpublishing transactions. Preview does not change the document, anchors, selection or history. Accept writes one batch; discard writes none.
- The canonical fragment fitter accepts compatible cross-leaf and cross-container text ranges. Schema and isolation barriers remain enforced. Named-root history restores selection through the matching active view.
- Static rendering reads an explicit immutable document and existing presentation descriptors. It creates no second editor. Query-aware memoization retains independent blocks while invalidating cross-block reads.
- Plugin state preserves snapshots created by its canonical snapshot owner. External mutable or shallow-frozen values are still copied defensively.
- Copied AI UI renders the detached draft at captured targets. Real transport failures stay visible. Demo data requires explicit configuration. Comments enter the external discussion store only after document acceptance.
- Obsolete chunk helpers, temporary AI document anchors, serialization feedback, private history batching and the old stream hook are removed. Current API docs, static docs, TOC docs, changesets and registry changelog are adopted.
- Best API and Plate UI doctrine describe the ownership laws. Plate Next doctrine version 136 validates, and installation regenerated skill mirrors.

## Evidence on current implementation

| Gate | Latest result | Receipt |
| --- | --- | --- |
| Plite core including fitter, schema candidates and correction lifetime | 1,553 passed | `artifacts/ai-streaming/handoff/core-tests.log` |
| AI integration plus static adoption and demo lifetime | 161 passed; 4,699 assertions | `artifacts/ai-streaming/handoff/integration.log` |
| Partial projection exact replay | 7 passed; 79 assertions | `/tmp/ai-projection-final-exact.log` |
| Markdown source + operation | 66 passed; 1,052 assertions before final projection | `/tmp/ai-source-operation-current.log` |
| Trusted snapshot locality | 7 passed; 18 assertions | `/tmp/ai-store-locality-green.log` |
| Static locality and independent values | 16 passed; 48 assertions | `/tmp/ai-static-locality-green.log` |
| Six demo scenarios in both modes, controls, AI UI | 9 browser tests passed; 30.8 seconds | `artifacts/ai-streaming/handoff/ui-final.log` |
| Demo unmount cancellation in both modes | 2 passed; 6 assertions | `/tmp/ai-demo-unmount.log` |
| AI target-only wrapper | 5 browser tests passed; 8.5 seconds | `/tmp/ai-target-wrapper-browser.log` |
| Named-root table API adoption | 5 passed; 20 assertions | `/tmp/ai-markdown-adoption.log` |
| Whole www and integration types | Passed | `artifacts/ai-streaming/handoff/www-types.log`, `integration-types.log` |
| Static and AI React source types | Passed before final UI edits | `/tmp/ai-static-types-current.log`, child projection types |
| Production proof host | Phase-instrumented build passed | `/tmp/ai-phase-probe-build.log` |
| Affected Plite | Types, tests, contracts and 3 Chromium smoke tests passed | `/tmp/ai-continued-dev-check.log` |
| Strict Plite | Types, tests and contracts passed; Chromium 710 passed / 8 skipped in 79 batches | `artifacts/ai-streaming/handoff/strict-plite.log` |
| Doctrine validation | Version 136 valid; 2 active / 44 retired | `/tmp/ai-doctrine-check.log` |

Historical receipts retain their stated scope. The final handoff below records the latest checks and source fingerprints; it does not close deferred performance or native-proof gates. Historical P0 evidence and the failed visual proxy are preserved in [p0-handoff-history.md](artifacts/ai-streaming/p0-handoff-history.md).

## Performance

Budgets remain preview p95 ≤16 ms for normal 100 KB; final preview, Accept, Undo and Redo ≤100 ms. Ordinary editor regression must remain ≤10% and ≤2 ms beyond measured noise. The stress and backward-dependency rows retain full semantics.

The parser-only prototype reduced the 100 KB settled paragraph tail from 428.38 ms to 1.12 ms, and a single paragraph from 153.80 ms to 0.27 ms. It is not whole-UI acceptance evidence. Full parsing remains expensive for backward dependencies.

The production copied EditorKit proof host measures an identical final chunk in fourteen independent trials: one cold, three warmups, ten measured. It separately records preview, finish, Accept, Undo and Redo, canonical publication count, changed preview nodes and exact history replay. It rounds fixtures to complete syntax units and records actual bytes. Diagnostic JSON lives under `artifacts/ai-streaming/browser-timing`.

Earlier single-action diagnostics found tiny-paragraph mount cost above 100 ms and cannot satisfy the action gate. Earlier MDX rows lacked canonical width properties; full-parser/schema validation rejected those fixtures. Corrected fixtures retain explicit widths and block syntax. No product schema relaxation or budget exception follows from these diagnostics.

Deferred work: the full baseline and repeated whole-UI matrix, matched ordinary editor controls, independent background/target sizes, recorded chunks, 1 MB stress and final native clipboard replay. The scoped scrolling-intent browser test passes. Current implementation checks are recorded in the final handoff below.

## Verification commands

Use `npx --yes pnpm@10.11.0` for this host's package manager. Explicit Bun `.slow.tsx` paths require a leading `./`. Diagnostic top-level probes report zero tests and do not contribute to test counts.

- `node tooling/scripts/run-entrypoint-task.mjs test plitejs core`
- `bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamProjection.slow.tsx`
- `pnpm check:plite:dev`, then `pnpm check:plite`
- `pnpm --filter www build:registry`, `pnpm brl`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`

No autoreview runs on `next`. No commit, push, PR or release is authorized.

## Failed-fit repair checkpoint

`regression repair ai-partial-range-projection: complete-range paste loses incoming paragraph alignment`. Final Chromium replay invalidated the partial-fit candidate at paste-html.test.ts:1106. Earlier core and partial-projection green receipts do not close this boundary. First divergence: canonical fit candidate admission, pending owner RED. Attempt 2 retains all partial-selection, named-root, history, isolation and schema assertions and adds complete-range property precedence.

Methodology decision: repair-now. Regression source, methodology and validator require a property-precedence model oracle when widening slice/fragment fitting. The executable workflow test rejects text-only proof. Product edits resume only after workflow proof and generated parity. No public completion claim was made.

Fit repair proof: owner RED lost `align: right` on the first fully replaced paragraph. Attempt 2 admits local fitting only when a boundary block retains unselected content. Incoming properties win for fully covered replacement; partial boundaries preserve original properties. Owner tests: 56 passed; full core: 1,552 passed; original Chromium paste-html alignment row: 1 passed. Exact source logs: `/tmp/ai-fit-precedence-{red,green}.log`, `/tmp/ai-fit-core-rerun.log`, `/tmp/ai-fit-browser-exact.log`. The subsequent strict Plite run passes the full Chromium corpus: 710 passed / 8 skipped. This receipt covers the final fitter and schema owner, before the later copied AI wrapper edit.

Workflow proof: 65 validator tests passed. Installation regenerated source mirrors; validator and methodology byte parity passed. Agent-native audit: Regression remains the discoverable owner, the rule has an executable rejection test, and no second workflow owner or wrapper was added. Plate Next v136 still validates.

## Continued closure checkpoint

Native clipboard: 13 owner tests / 39 assertions and five trusted native Chrome copy/paste repetitions passed. Draft text and bold/italic marks paste into an ordinary editor; canonical source and history remain unchanged. The separately discovered PlateView adoption gap had an exact failing mounted test. Removing its duplicate copy handler leaves one static clipboard owner; 16 combined tests / 49 assertions pass. See `artifacts/ai-streaming/clipboard-proof.md` and `plate-view-adoption-proof.md` for scoped fingerprints.

The render-context prototype reduced repeated proxy enumeration in the measured injection owner. Its focused tests preserve live store capabilities and descriptor-family isolation. A memoized AI static child preserves content identity across status-only changes. These do not close the 100 KB action budget: the production 100 KB / 128-character / 5,120-paragraph insertion row still measures preview 31 ms, finish 344.9 ms, Accept 1,493.2 ms, Undo 470.3 ms, and Redo 1,197.6 ms p95. The corresponding 1 KB row measures 3.3 / 9.4 / 86.5 / 17.7 / 75.8 ms. These are diagnostic candidate results, with all semantic/history guards passing; no budget relaxation follows.

A separate headless, same-EditorKit profile isolates canonical acceptance cost. The schema owner visits every allowed property twice on each node to find defaults and required fields. The bounded prototype derives only those candidate lists per immutable compiled schema and node type; present-property validation and dynamic root/ancestor target matching remain unchanged. Five diagnostic 100 KB acceptance runs decrease from 2,488–3,038 ms to 1,849–2,068 ms in production Bun/HappyDOM. This is an owner-cost experiment, not browser acceptance evidence. Full core remains 1,552 tests passing. The same production browser cohort must be rerun before retaining or closing this candidate.

Target-only AI mounting removes the full draft hook tree from non-target blocks. The copied UI replay passes all five cases, and whole-www types and scoped lint pass. The repeated production 100 KB row measures preview 32.3 ms, finish 337 ms, Accept 1,370.8 ms, Undo 466.1 ms and Redo 986.4 ms p95. Model/history guards pass; the performance gate remains open. The measured fixture has 4,877 paragraphs (102,417 actual characters); the separate headless diagnostic has 5,120. Those cohorts must not be conflated.

Final native clipboard replay on the latest integrated UI is blocked by the locked Mac. Five earlier trusted repetitions remain scoped to their recorded fingerprints. No later native pass is claimed. The user paused further optimization; final native replay remains open.


### Correction interface locality probe

The List query filter prototype showed no material improvement: five same-EditorKit headless Accept trials stayed around 1.8 seconds. The filter was reverted.

The next prototype reuses the correction interface in the existing transaction-token-owned update view. This removes repeated method-table construction within one transaction. It adds no public owner, persistent editor cache, or alternate write path. Node matching, correction transitions, mutation limits, schema validation, and expiry checks stay in their current owners. Captured writes still fail after the transaction; reads inside a correction observe the latest draft. A new lifetime test and the existing correction corpus pass: 38 tests. Core types pass. Earlier strict Plite evidence predates this prototype; the user-requested handoff below records the complete rerun.

Five identical headless Accept trials decrease from 1,773–1,865 ms to 1,453–1,614 ms. This isolates a useful repeated cost but does not satisfy the browser action budget. Logs: `/tmp/ai-list-query-baseline.log`, `/tmp/ai-list-query-candidate.log`, `/tmp/ai-correction-view-candidate.log`, `/tmp/ai-correction-view-owner.log`. The production-path diagnostic completed with source fingerprints and the existing core/React profiling hooks. Correction work fell from about 474 ms to 201 ms. The profiling build measured p95 preview 33.5 ms, finish 616.6 ms, Accept 961.8 ms, Undo 469.7 ms and Redo 702.2 ms. Profiling changes overhead, so these numbers diagnose owners and do not attest normal-production budgets. The budgets remain unmet.


## User-requested handoff

The user requested: “先暂停优化 本次这个收个尾就行”. Runtime edits stop at correction-interface reuse. Detailed node-change notification generation and finish-time commit/focus cost are recorded observations only; no new commit query API or notification bridge change was implemented.

The retained correction interface belongs to the existing transaction token. Captured writes expire, correction reads see the live draft, and matching, cycle limits and schema validation remain unchanged. The new lifetime test and all 1,553 core tests pass. Final strict verification is recorded below.

Final verification initially overlapped barrel regeneration, so one package runner observed a temporarily absent generated static barrel. The generator completed successfully; verification was restarted after generation. This was a verification scheduling error, not a product regression. The first UI invocation also selected test filenames as project names; the corrected invocation runs the intended tests.

No commit, push, PR or release was performed. The remaining original-plan checkboxes are deferred, not waived or marked complete.


Latest scoped handoff checks pass: 1,553 core tests; 161 integration/static/demo tests with 4,699 assertions; nine AI/Markdown Chromium tests; application and integration types; lint over 92 changed code files; formatting over 99 files with one corrected page; 65 workflow-validator tests; doctrine v136 and mirror parity; 366 canonical registry payloads and 15 overlays; barrels and registry changelog checks. Logs are retained under `artifacts/ai-streaming/handoff/`. `handoff-source.json` fingerprints the current changed source, tests, generated outputs and teaching files, including deleted paths. These checks do not imply performance or final native clipboard acceptance.


Final strict Plite check passed on the retained implementation: 86 typecheck tasks; all package test tasks; runner and public-type contracts; Chromium 710 passed / 8 skipped across 79 bounded batches (387.1 seconds). Total strict check: 447.4 seconds. The current core receipt includes the correction lifetime test (1,553 passed). Generated barrels and registry outputs were settled before this final run. The only later code edit formatted the development-only www proof route; its imports and behavior did not change.

Current-scope handoff is complete. Further optimization remains paused, and the original plan’s full performance/baseline and final native clipboard gates remain open. Source fingerprint: `6dfb2716a9c484563478b141ec90459cbf2477a5445a881a790954b9535e6f88`. No runtime edits followed these checks. No commit or push was performed.
