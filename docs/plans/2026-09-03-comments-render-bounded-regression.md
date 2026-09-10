# Comments render containment and decoration parity regressions

Current execution status: blocked on separate shared Plite integration.
The recorded 80/80 Chromium and 50/50 DOM passes are historical after shared
Editable sources changed. They must be refreshed before current-tree closure.

Objective:

Restore the established zero-text-render contract when an app-owned comment
reply changes, without hiding profiler events or weakening the browser oracle.
Preserve every overlapping decoration's identity through updates in both
Plite text renderers.

Completion threshold:

- The exact existing Chromium case changes from two retained text-flow renders
  to zero on the same complete Discussion fixture.
- The final shared-owner bytes pass focused package proof, the complete Comments
  browser corpus, and five retry-free warm Chromium runs.
- A generated proof receipt binds every measured render emitter, router,
  filter, aggregator, renderer, route owner, and assertion owner.
- The imperative and React text renderers preserve independent overlapping
  attributes, live text, source refresh/removal, and ten undo/redo cycles.

Verification surface:

- The complete Plite render-profiler emitter/router/filter/aggregator path.
- Static message-body rendering in
  `apps/www/src/registry/components/editor/comment.tsx`.
- Plite render-profiler emitters and both in-process and Playwright counters.
- Plite's existing `editable-text-flow.tsx` and `editable-text.tsx` renderers
  and `decoration-rendering-contract.test.tsx` DOM contract.
- `apps/www/tests/browser/comment.spec.ts` on
  `http://localhost:3000/blocks/discussion-demo`.
- Regression workflow tests, source/generated parity, focused Plite React
  tests, full Comments Chromium replay, and final root check.

Constraints:

- Keep the `text` profiler event honest. Do not delete it, filter it, or change
  the expected count from zero.
- App-owned discussion state must not enter the editor text render lifetime.
- Stored rich-text comment bodies must keep mark rendering without mounting a
  nested editable runtime for every displayed message.
- Do not change public API, Comments behavior, visual design, or release state.

Boundaries:

- Allowed product owners: copied registry `comment.tsx`, its static marks
  dependency declaration, current-state docs/changelog source, and the two
  existing Plite text renderers for decoration parity discovered by final QA.
- Allowed proof owners: existing Plite React tests, existing Comments browser
  corpus, render profiler bridge, and this plan.
- Agent-workflow owners changed by the mandatory failed-fix interrupt are
  `.agents/rules/regression*`, the Regression plan template, and generated
  mirrors produced by `pnpm install`.
- No parallel writer, new E2E case, public API, Git commit, push, PR, or release.

Blocked condition:

Block only if the exact route cannot run on frozen source, static body rendering
loses rich-text behavior, or five retry-free Chromium runs expose another
shared-owner failure.

Repository-wide closure also stops when an independently changed owner leaves
required checks failing. This packet does not authorize adopting that owner's
API across unrelated fixtures and examples.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Exact reproduction | yes | Fresh complete Comments run and isolated rerun both observed `text=2`, expected `0`. |
| Current source | yes | Dirty tree based on `a6afd55c30e97c74fe895d1ad005ca75413110f3`; exact product bytes frozen for the isolated rerun. |
| Regression repair | yes | 134 workflow tests pass and generated resources are exact after adding measurement-owner closure. |
| Patch boundary | yes | One case, one copied registry body-rendering owner, existing E2E oracle. |

Work Checklist:

- [x] Capture every explicit invariant, non-goal, proof gate, and stop rule.
- [x] Load Regression methodology and Patch workflow.
- [x] Reproduce the existing exact-route case on a fresh server and in isolation.
- [x] Trace the two profiler events to displayed `CommentBody` instances, not
      the primary or reviewer editor.
- [x] Invalidate the earlier final-proof claim and repair Regression first.
- [x] Inventory all measured runtime and proof owners.
- [x] Replace nested read-only message editors with Plate's existing static view.
- [x] Pass focused Plite/Plate/Discussion proof and the isolated browser oracle.
- [x] Harden setup-only AI selection without adding a fake pointer claim.
- [x] Reproduce lost overlapping attributes on frozen source before editing.
- [x] Replace lossy attribute merging with ordered, independent DOM wrappers.
- [x] Prove both renderers with the same DOM-level edit/history/source tests.
- [x] Reuse React commit ownership and the canonical live-text reader to fix
      fallback decoration refresh and decorated-to-plain transitions.
- [ ] Refresh the full Comments browser corpus on a quiescent host and five
      retry-free warm runs after the shared integration stabilizes.
- [ ] Refresh and validate the final proof receipt on unchanged inputs.
- [ ] Rerun every failed/started gate, root check, semantic validator, and plan checker.
- [x] Record final fingerprints, architecture verdict, risks, and local-only status.

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Exact browser oracle | yes | Observe zero text renders after the app-only reply. | Pass: the unchanged oracle passes in all five complete corpus runs. |
| Measurement-owner closure | yes | Include every named owner in one generated receipt. | Source replay required: the recorded receipts bind 46 inputs, but shared Editable owners changed afterward. |
| Affected corpus | yes | Replay all 16 existing Comments cases after the last owner edit. | Pass: 80/80 Chromium cases; source is unchanged before and after. |
| Stability | yes | Pass five warm Chromium runs with retry zero. | Pass: 5/5 complete runs, retry zero; both-mode DOM proof also passes 50/50 across five runs. |
| Package and root proof | yes | Pass focused Plite/Plate tests and `pnpm check`. | Comments/renderer proof passes. Full root check passed before the shared DOM migration; latest strict Plite stops in two focus fixtures and root lint stops on concurrent DOM/schema files. |
| Workflow parity | yes | Keep workflow tests and source/generated parity green. | Current workflow source suites pass 102/102; source/generated resources match. |
| Reviews | yes | Record Patch architecture pressure; P1 autoreview is forbidden on `next`. | Best API and Plite/Plate plan pressure reaffirm existing owners; no public API or doctrine change is required for renderer parity. |
| Semantic completion | yes | Pass Regression validator and Autogoal checker. | Executed: structure passes; completion remains open on strict/root integration gates, candidate-local case claims, and the unchecked closure phase. |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Reproduction and failed-fix interrupt | complete | Exact isolated Chromium red plus measurement-owner closure repair. | None. |
| Durable owner patch | complete | Static `CommentBody` removes nested editable runtimes; no Plite memo change. | None. |
| Decoration parity | complete | Frozen browser corpus exposed attribute flattening; shared DOM tests exposed unclaimed React updates and stale plain text; all ten focused renderer tests pass. | Replay broad affected proof. |
| Browser corpus and stability | in_progress | Recorded 80/80 Chromium and 50/50 DOM cases passed; shared Editable owners changed afterward. | Refresh proof on stable shared source. |
| Receipt and closure | in_progress | Final browser and DOM receipts are generated and source-bound. | Finish repository-wide gates and semantic completion checks. |

Selected executable cases:

| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | Existing Comments performance contract on the Discussion demo | Open the exact route, open the overlap thread, fill a reply, reset the profiler, and submit | App-owned reply publication records zero text renders, keeps total editor work bounded, and preserves every primary text DOM node | existing-contract: `comment.spec.ts` asserts zero text renders and stable text node identity | e2e-required: only the complete registry Discussion composition crosses the app-owned comment store, Plate providers, and retained Plite DOM path without a fake host | exact-route: http://localhost:3000/blocks/discussion-demo; Chromium; fresh www process; runtime-modes: Plate editable plus app-owned Comments; fixture-scope: complete discussion demo | Playwright: `pnpm --filter www test:www-browser:chromium tests/browser/comment.spec.ts --grep "comment paint, static projection"` | green-awaiting-repository-gates | dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3 | Regression closure |
| PLITE-DECORATION-RENDER-PARITY | Frozen Comments corpus and existing Plite decoration renderer contract | Render two overlapping sources with the same attribute name in both existing renderer modes; refresh attributes; insert/delete text; repeat undo/redo ten times; delete the entire range; undo; remove and restore one source | Both IDs retain their exact text and ordered wrappers; DOM matches the live model; collapsed ranges paint nothing and undo restores both; source updates preserve independent attributes | existing-contract: React decoration wrappers and Comments overlap assertions preserve each source independently | unit-red: existing DOM test owner reproduces fallback refresh loss and stale text; existing browser corpus reproduces imperative attribute loss; no new E2E case | jsdom: actual Plite and Editable; runtime-modes: imperative text flow and React fallback; fixture-scope: minimal two overlapping anchored ranges; reduction-proof: real source refresh, DOM integrity, editor updates, and history are retained without copied UI | Vitest: `pnpm --filter plitejs test:react test/react/decoration-rendering-contract.test.tsx test/react/editable-text-flow.test.ts` | green-awaiting-repository-gates | dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3 | Regression closure |

Reporter evidence inventory:

| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | base-acceptance | Existing test `comment paint, static projection, source recovery, and app-only updates stay bounded` | after-action | A comment reply is application state: it must not change the editor model, remount text DOM, or rerender retained text | required | model@after-action, dom-native@after-action, runtime-errors@after-action | test: apps/www/tests/browser/comment.spec.ts#comment paint, static projection, source recovery, and app-only updates stay bounded | pass: five exact oracle runs within 80/80 Chromium cases; the two-render red state is preserved in the failure ledger |
| PLITE-DECORATION-RENDER-PARITY | base-acceptance | Existing Comments overlap and edit/history cases plus the Plite DOM contract | after-action | Each source retains its own attributes and tracks the same live text before and after edits or refreshes | required | model@after-action, dom-native@after-action, runtime-errors@after-action | test: packages/plitejs/test/react/decoration-rendering-contract.test.tsx#preserves overlapping identities through edits, history, and source removal | pass: 50/50 DOM cases and 80/80 Chromium cases; independent attributes and live text survive the recorded red transitions |

Reporter oracle matrix:

| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | model | after-action | yes | Editor document content and anchor projection remain unchanged after reply publication | Any editor document mutation caused by the app-owned reply | Chromium browser model and DOM assertions | test: apps/www/tests/browser/comment.spec.ts#comment paint, static projection, source recovery, and app-only updates stay bounded | pass: model and all anchor projections remain unchanged |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | dom-native | after-action | yes | Zero `text` renders, bounded `editable`, `root-plan`, and total events, and identical text DOM nodes; measurement-owner-inputs: packages/plitejs/src/react/components/editable-text-blocks.tsx, packages/plitejs/src/react/components/editable-text-flow.tsx, packages/plitejs/src/react/components/editable.tsx, packages/plitejs/src/react/components/plite-element.tsx, packages/plitejs/src/react/components/plite-leaf.tsx, packages/plitejs/src/react/components/plite-spacer.tsx, packages/plitejs/src/react/components/plite-text.tsx, packages/plitejs/src/react/components/plite-void-shell.tsx, packages/plitejs/src/react/editable/root-selector-sources.ts, packages/plitejs/src/react/render-profiler.ts, packages/test/src/playwright/render-profiler.ts, apps/www/src/registry/components/editor/comment.tsx, apps/www/src/registry/components/editor/discussion.tsx, apps/www/src/registry/examples/discussion-demo.tsx, apps/www/tests/browser/comment.spec.ts | Any retained text render, text DOM replacement, or work above the established bounds | Chromium browser render profiler plus DOM identity assertion | test: apps/www/tests/browser/comment.spec.ts#comment paint, static projection, source recovery, and app-only updates stay bounded | pass: text=0, bounded editor work, stable DOM identity, and complete measurement-owner fingerprints across five runs; measurement-owner-closure: pass |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | pointer-feedback | after-action | no | N/A: render containment does not claim pointer feedback | N/A: no pointer behavior is under test | N/A: no pointer behavior is under test | N/A: no pointer behavior is under test | N/A: no pointer behavior is under test |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | focus | after-action | no | N/A: render containment does not claim focus transfer | N/A: no focus behavior is under test | N/A: no focus behavior is under test | N/A: no focus behavior is under test | N/A: no focus behavior is under test |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | popup | after-action | no | N/A: popup visibility is setup, not the containment claim | N/A: popup lifecycle is outside this case | N/A: popup lifecycle is outside this case | N/A: popup lifecycle is outside this case | N/A: popup lifecycle is outside this case |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | geometry-paint | after-action | no | N/A: no geometry or pixel claim | N/A: no geometry or pixel claim | N/A: no geometry or pixel claim | N/A: no geometry or pixel claim | N/A: no geometry or pixel claim |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | subscription-lifecycle | after-action | no | N/A: this case measures render containment, not source membership lifecycle | N/A: subscription membership is outside this case | N/A: subscription membership is outside this case | N/A: subscription membership is outside this case | N/A: subscription membership is outside this case |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | runtime-errors | after-action | yes | No page error, console error, or unhandled rejection during reply publication | Any browser runtime error | Chromium browser runtime-error collector | test: apps/www/tests/browser/comment.spec.ts#comment paint, static projection, source recovery, and app-only updates stay bounded | pass: the final five-run Chromium corpus records no runtime error; the concurrent-writer run remains revoked |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | follow-up-input | follow-up | no | N/A: the existing case ends after app-state publication and identity proof | N/A: no follow-up interaction is claimed | N/A: no follow-up interaction is claimed | N/A: no follow-up interaction is claimed | N/A: no follow-up interaction is claimed |
| PLITE-DECORATION-RENDER-PARITY | model | after-action | yes | Live anchor ranges and document text map through insert, delete, and history without drift | Losing an anchor or restoring stale document text | unit DOM contract with real editor history | test: packages/plitejs/test/react/decoration-rendering-contract.test.tsx#preserves overlapping identities through edits, history, and source removal | pass: both renderer modes complete ten cycles and full-delete/undo |
| PLITE-DECORATION-RENDER-PARITY | dom-native | after-action | yes | Each overlapping source owns an ordered wrapper and its exact text; attribute-only updates preserve wrapper and text-node identity | Flattened IDs, removed wrappers, duplicated or stale text | unit DOM contract and existing Chromium browser overlap corpus | test: packages/plitejs/test/react/decoration-rendering-contract.test.tsx#shares source observation and keeps ordered attributes independent | pass: both modes retain independent attributes and identity |
| PLITE-DECORATION-RENDER-PARITY | pointer-feedback | after-action | no | N/A: this case claims renderer parity, not pointer feedback | N/A: pointer input belongs to the unchanged browser corpus | N/A: not claimed here | N/A: not claimed here | N/A: not claimed here |
| PLITE-DECORATION-RENDER-PARITY | focus | after-action | no | N/A: no focus transfer is claimed | N/A: focus is covered by existing Comments browser cases | N/A: not claimed here | N/A: not claimed here | N/A: not claimed here |
| PLITE-DECORATION-RENDER-PARITY | popup | after-action | no | N/A: renderer parity does not claim popup lifecycle | N/A: popups are covered by existing Comments browser cases | N/A: not claimed here | N/A: not claimed here | N/A: not claimed here |
| PLITE-DECORATION-RENDER-PARITY | geometry-paint | after-action | no | N/A: DOM structure and text are asserted without pixel or geometry claims | N/A: no pixel claim | N/A: not claimed here | N/A: not claimed here | N/A: not claimed here |
| PLITE-DECORATION-RENDER-PARITY | subscription-lifecycle | after-action | yes | One observation serves two Editables and releases once; removing and restoring a source updates only its decoration contribution | Duplicate observation, missing cleanup, or stale source wrappers | package DOM contract in Vitest/jsdom | test: packages/plitejs/test/react/decoration-rendering-contract.test.tsx#shares source observation and keeps ordered attributes independent | pass: observation and cleanup counts remain one |
| PLITE-DECORATION-RENDER-PARITY | runtime-errors | after-action | yes | No renderer, source, or history exception | Any runtime error or missing decoration-source cleanup | unit Vitest and unchanged Chromium browser runtime-error collector | test: packages/plitejs/test/react/decoration-rendering-contract.test.tsx#preserves overlapping identities through edits, history, and source removal | pass: five DOM runs and the complete five-run Chromium corpus record no runtime error |
| PLITE-DECORATION-RENDER-PARITY | follow-up-input | follow-up | yes | Subsequent deletion, undo, redo, and source refresh remain correct after the first edit | A first edit that leaves either renderer unusable | package DOM contract with real transactions/history | test: packages/plitejs/test/react/decoration-rendering-contract.test.tsx#preserves overlapping identities through edits, history, and source removal | pass: ten cycles, full deletion/undo, and source removal/reappearance |

Proof receipts:

| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PLITE-DECORATION-RENDER-PARITY | 1 | candidate-local | "node" "-e" "const {spawnSync}=require(\"node:child_process\"); for(let i=0;i<5;i++){const r=spawnSync(\"pnpm\",[\"--filter\",\"plitejs\",\"test:react\",\"test/react/decoration-rendering-contract.test.tsx\",\"test/react/editable-text-flow.test.ts\"],{stdio:\"inherit\",env:process.env}); if(r.status!==0)process.exit(r.status??1);}" | pass: exit 0 in 15197ms | dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3 | sha256:2f8450f63ab1e2e8550684c448640be37c779c8fa392737c88637f232980a6f4 | 46 | apps/www/playwright.config.ts,apps/www/src/components/site-registry/floating-popover.tsx,apps/www/src/components/site-registry/provider.tsx,apps/www/src/registry/bases/base/floating-popover.tsx,apps/www/src/registry/bases/radix/floating-popover.tsx,apps/www/src/registry/components/editor/basic-marks-static.tsx,apps/www/src/registry/components/editor/comment-toolbar-button.tsx,apps/www/src/registry/components/editor/comment.tsx,apps/www/src/registry/components/editor/discussion.tsx,apps/www/src/registry/components/editor/editor.tsx,apps/www/src/registry/components/editor/plugins-static.ts,apps/www/src/registry/components/editor/plugins.ts,apps/www/src/registry/components/editor/suggestion.tsx,apps/www/src/registry/examples/discussion-demo.tsx,apps/www/src/registry/examples/values/suggestion-value.tsx,apps/www/tests/browser/comment.spec.ts,apps/www/tsconfig.json,config/plite-source-test-setup.ts,packages/platejs/src/react/features/comments/CommentsPlugin.ts,packages/plitejs/src/core/anchor-state.ts,packages/plitejs/src/core/anchor.ts,packages/plitejs/src/core/editor-schema.ts,packages/plitejs/src/dom/plugin/dom-editor.ts,packages/plitejs/src/dom/plugin/dom-integrity-observer.ts,packages/plitejs/src/dom/plugin/dom-root-runtime.ts,packages/plitejs/src/history/history-extension.ts,packages/plitejs/src/history/history-state.ts,packages/plitejs/src/react/components/editable-text-blocks.tsx,packages/plitejs/src/react/components/editable-text-flow.tsx,packages/plitejs/src/react/components/editable-text.tsx,packages/plitejs/src/react/components/editable.tsx,packages/plitejs/src/react/components/plite-element.tsx,packages/plitejs/src/react/components/plite-leaf.tsx,packages/plitejs/src/react/components/plite-spacer.tsx,packages/plitejs/src/react/components/plite-text.tsx,packages/plitejs/src/react/components/plite-void-shell.tsx,packages/plitejs/src/react/decoration-context.tsx,packages/plitejs/src/react/decoration-source.ts,packages/plitejs/src/react/editable/root-selector-sources.ts,packages/plitejs/src/react/editable/runtime-live-state.ts,packages/plitejs/src/react/hooks/use-claim-editable-dom-commit.ts,packages/plitejs/src/react/render-profiler.ts,packages/plitejs/test/react/decoration-rendering-contract.test.tsx,packages/plitejs/test/react/editable-text-flow.test.ts,packages/plitejs/vitest.config.mjs,packages/test/src/playwright/render-profiler.ts | host:none - source-first Vitest/jsdom | 2026-09-03T13:09:03.719Z | 2026-09-03T13:12:01.734Z | 2026-09-03T13:12:16.932Z | 0 | sha256:bb9ab952e96b5e701e0926288d9bbdc57fbc34e6ed2b3d1c9823bdb4f2d0a11a |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | 2 | candidate-local | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://localhost:3000/blocks/discussion-demo" "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/comment.spec.ts" "--repeat-each=5" | pass: exit 0 in 247628ms | dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3 | sha256:2f8450f63ab1e2e8550684c448640be37c779c8fa392737c88637f232980a6f4 | 46 | apps/www/playwright.config.ts,apps/www/src/components/site-registry/floating-popover.tsx,apps/www/src/components/site-registry/provider.tsx,apps/www/src/registry/bases/base/floating-popover.tsx,apps/www/src/registry/bases/radix/floating-popover.tsx,apps/www/src/registry/components/editor/basic-marks-static.tsx,apps/www/src/registry/components/editor/comment-toolbar-button.tsx,apps/www/src/registry/components/editor/comment.tsx,apps/www/src/registry/components/editor/discussion.tsx,apps/www/src/registry/components/editor/editor.tsx,apps/www/src/registry/components/editor/plugins-static.ts,apps/www/src/registry/components/editor/plugins.ts,apps/www/src/registry/components/editor/suggestion.tsx,apps/www/src/registry/examples/discussion-demo.tsx,apps/www/src/registry/examples/values/suggestion-value.tsx,apps/www/tests/browser/comment.spec.ts,apps/www/tsconfig.json,config/plite-source-test-setup.ts,packages/platejs/src/react/features/comments/CommentsPlugin.ts,packages/plitejs/src/core/anchor-state.ts,packages/plitejs/src/core/anchor.ts,packages/plitejs/src/core/editor-schema.ts,packages/plitejs/src/dom/plugin/dom-editor.ts,packages/plitejs/src/dom/plugin/dom-integrity-observer.ts,packages/plitejs/src/dom/plugin/dom-root-runtime.ts,packages/plitejs/src/history/history-extension.ts,packages/plitejs/src/history/history-state.ts,packages/plitejs/src/react/components/editable-text-blocks.tsx,packages/plitejs/src/react/components/editable-text-flow.tsx,packages/plitejs/src/react/components/editable-text.tsx,packages/plitejs/src/react/components/editable.tsx,packages/plitejs/src/react/components/plite-element.tsx,packages/plitejs/src/react/components/plite-leaf.tsx,packages/plitejs/src/react/components/plite-spacer.tsx,packages/plitejs/src/react/components/plite-text.tsx,packages/plitejs/src/react/components/plite-void-shell.tsx,packages/plitejs/src/react/decoration-context.tsx,packages/plitejs/src/react/decoration-source.ts,packages/plitejs/src/react/editable/root-selector-sources.ts,packages/plitejs/src/react/editable/runtime-live-state.ts,packages/plitejs/src/react/hooks/use-claim-editable-dom-commit.ts,packages/plitejs/src/react/render-profiler.ts,packages/plitejs/test/react/decoration-rendering-contract.test.tsx,packages/plitejs/test/react/editable-text-flow.test.ts,packages/plitejs/vitest.config.mjs,packages/test/src/playwright/render-profiler.ts | pid:60186;started:2026-09-03T13:11:15.000Z;base-url:http://localhost:3000/blocks/discussion-demo;browser:Chromium | 2026-09-03T13:09:03.719Z | 2026-09-03T13:12:00.486Z | 2026-09-03T13:16:08.116Z | 0 | sha256:1f92a611b5db0dc059b4c636fc8e6f9293e4ba7447964763626d87629311c414 |

Affected corpus replay:

| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Copied Comments body renderer and complete Comments corpus | COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | red: isolated exact-route case recorded `text=2` on frozen product bytes | 2026-09-03T13:09:03.719Z | `PLAYWRIGHT_BASE_URL=http://localhost:3000/blocks/discussion-demo pnpm --filter www test:www-browser:chromium tests/browser/comment.spec.ts --repeat-each=5` | sha256:2f8450f63ab1e2e8550684c448640be37c779c8fa392737c88637f232980a6f4 | pass: 80/80, retry zero |
| Both Plite text renderers | PLITE-DECORATION-RENDER-PARITY | red: frozen Chromium 11/16; React DOM tests separately lost refreshed attributes and displayed stale full-delete text | 2026-09-03T13:09:03.719Z | Both generated commands above: complete Chromium corpus and both-mode DOM contracts | sha256:2f8450f63ab1e2e8550684c448640be37c779c8fa392737c88637f232980a6f4 | pass: 80/80 browser and 50/50 DOM cases, retry zero |

Gate failure closure:

| Gate | Failure signal | Classification | Resolution | Final rerun |
| --- | --- | --- | --- | --- |
| Final Comments Chromium verification | Existing case expected zero text renders and received two | deterministic product regression in displayed message-body ownership | Render immutable message bodies through Plate's static view instead of nested read-only `Plate`/`Editor` instances | pass: final 80/80 Chromium cases include five exact zero-text-render oracle runs |
| AI layout stability | Setup selection intermittently collapsed before Ask AI mounted; second draft competed with an open Discussion popover | invalid setup-only pointer/multi-event oracle | Deterministic native keyboard selection, direct AI hotkey for the non-pointer case, seeded client-state readiness, and explicit popover closure | pass: AI pair passed 20/20; both cases also pass in all five final corpus runs with retry zero |
| Final host replay | Six cases failed during source mutation; Next showed a module-not-found Runtime Error mid-suite | proof-host failure; the run is revoked and is not a product attempt | Restarted on frozen source and reproduced a separate renderer defect without HMR errors | pass: final 80/80 cases on a fresh host; all 46 source fingerprints match before and after |
| Frozen overlap corpus | Five existing cases failed with one lost overlapping ID, including the initial fixture before any edit | deterministic renderer regression, not anchor mapping or a proof-host failure | Preserve each decoration's attributes in its own ordered DOM wrapper | pass: every existing overlap case passes in all five final corpus runs |
| Fallback DOM contract | Source refresh lost a wrapper; full deletion removed paint but restored stale text | unit-red: independent React renderer lifetime gaps exposed before a final claim | Reuse `useClaimEditableDOMCommit` for React-owned mutations and `readTextByKey` when decorations appear or disappear | pass: both renderer modes pass the same attribute, edit, history, and removal contract in 50/50 checks |
| Root generated entrypoint contract | Generated Turbo state did not match the current `details` entrypoint | stale generated proof input, not a Comments defect | Run the canonical `entrypoint:turbo:generate` command | pass: 17/17 generator contracts passed at the regeneration checkpoint; the current root lint failure is separate |
| Strict Plite final browser gate | Runner detected `editor-schema.ts` changing after unit 58 | proof-host source mutation; no failing behavior assertion | Invalidate this browser run and restart strict proof on stable source | Open: latest strict replay passes 85 typecheck tasks, then stops in two focus fixtures; full strict browser proof cannot start |
| Final www typecheck | Editor schema and API-reference artifacts were stale | generated inputs lagged the current schema owner | Run canonical `www editor:generate` and `www api-reference` commands | pass: current five-task www typecheck, generation, and parity checks pass with a 12 GB heap |
| Shared Plite integration | Earlier runtime-field, clipboard, example, and JSDoc mismatches were adopted in shared source; strict replay then fails in two focus fixtures, and root lint fails in concurrent DOM/schema files | independent runtime/API migration is still in progress; neither failure is a Comments assertion | Refresh generated API references, but leave unrelated product/test adoption to that migration unless the user expands this patch's scope | Open: latest strict React result is 1,122 pass / 2 fail; root lint reports 19 formatting files and 15 diagnostics |

Failed fix history:

| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | 1 | Fresh final Comments Chromium run expected zero text renders after a reply and observed two; isolated rerun matched | final-verification | yes: earlier candidate-local final browser proof is revoked | repair-now: `.agents/rules/regression.mdc` and its methodology/template require complete measurement-owner closure | pass: current workflow source suites 102/102 and source/generated parity | no: first failed fix had one copied registry rendering owner | N/A: no public API changed and the existing Plate UI/static owners are sufficient | reproduced: exact isolated route returned `text=2`; diagnostic: two displayed nested comment-body editors emitted the events while primary/reviewer DOM identity stayed stable |

Architecture pressure:

| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
| --- | --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | 1 | none: one copied registry rendering owner; AI setup and concurrent HMR were proof-host failures, not product attempts | patch | N/A: no public call shape changes | N/A: existing Plite renderer, Plate Comments Decoration, and copied Plate UI static view own the complete behavior | accepted: Exact profiler diagnosis rejected a Plite memo change; cold `www` comparison showed the static call adds 275 types, 7,008 instantiations, and under 1 MB to an 8.56 GB graph |
| PLITE-DECORATION-RENDER-PARITY | 0 | none: existing corpus and unit tests caught defects before a kept/final parity claim | patch | N/A: public keyed Decoration attributes are unchanged; lossy merging is deleted without a callback or public renderer option | N/A: the accepted parent Plite/Plate plan already assigns DOM structure, commit ownership, and live text to Plite; Plate supplies attributes | accepted: Reuses ordered React wrapper semantics, `useClaimEditableDOMCommit`, and `readTextByKey`; no new store, mapper, subscription, or exported API |

Proof-host readiness:

| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
| --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | Copied Comments renderer plus complete measured Plite path | Playwright Chromium on http://localhost:3000/blocks/discussion-demo | PID 60186 started at 2026-09-03T13:11:15Z after the latest bound input; source fingerprints match before/after all 80 cases | Registry source is canonical; generated registry is rebuilt only from source | pass: static fixture, five highlight identities, full corpus, runtime-error collector, and immutable receipt |
| PLITE-DECORATION-RENDER-PARITY | Existing imperative and React text renderers | Source-first Vitest/jsdom and unchanged Comments Chromium corpus | Exact module aliases target current source; all 46 input hashes agree with the browser receipt | No barrel or public export changed | pass: 50/50 DOM cases across five fresh runs; 80/80 browser cases |

Patch delegation:

| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
| --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | Existing exact browser case: expected `text=0`, received `2` | `apps/www/src/registry/components/editor/comment.tsx`; registry dependency/docs/tests only | Focused package proof, isolated browser green, full 16-case corpus, five retry-free runs | Root cause, red/green, fingerprints, architecture verdict, root check, and local-only boundary | implemented: static body renderer; no Plite product file changed for this case |
| PLITE-DECORATION-RENDER-PARITY | Existing Chromium corpus and shared DOM tests | `editable-text-flow.tsx`, `editable-text.tsx`, and existing `decoration-rendering-contract.test.tsx` | Focused and full React tests, Plite package/browser gates, unchanged Comments corpus, five retry-free runs | Independent wrappers; React commit claim; live text on decoration transitions; no public API change | implemented locally in the main task; focused 10/10 pass |

Stability:

| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
| --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | Existing focused case inside the complete corpus on restarted localhost www Chromium | 5 | 5/5 exact oracle runs within 80/80 total cases; generated receipt `sha256:1f92a611b5db0dc059b4c636fc8e6f9293e4ba7447964763626d87629311c414` | 0 | pass |
| PLITE-DECORATION-RENDER-PARITY | Existing full Comments corpus plus both-mode DOM contract | 5 | 80/80 browser cases and 50/50 DOM cases; browser receipt `sha256:1f92a611b5db0dc059b4c636fc8e6f9293e4ba7447964763626d87629311c414` and DOM receipt `sha256:bb9ab952e96b5e701e0926288d9bbdc57fbc34e6ed2b3d1c9823bdb4f2d0a11a` | 0 | pass |

Packet decisions:

| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
| --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | Final 80/80 source-bound Chromium cases and honest zero-text-render oracle | candidate-local pending repository gates | Local, uncommitted, and unpushed current checkout only | Shared Plite focus fixtures and lint remain outside Comments | Repository integration closure |
| PLITE-DECORATION-RENDER-PARITY | Frozen browser red, shared DOM red/green, final 80/80 browser and 50/50 DOM receipts | candidate-local pending repository gates | Local renderer parity and Comments regression candidate only | Broad source-final checks remain | Repository integration closure |

Methodology deltas:

| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
| --- | --- | --- | --- | --- | --- |
| COMMENTS-RENDER-BOUNDED-FINAL-VERIFY | Earlier proof omitted measurement owners; later AI setup added an unclaimed pointer path; the final replay shared a mutable HMR host | repair-now | `.agents/rules/regression.mdc`, its methodology/template, validator, and generated mirrors require measurement-owner closure and deterministic setup-only selection; the existing no-concurrent-writer law revokes the HMR run | pass: current workflow source suites 102/102 and exact source/generated parity | Product attempt 1 diagnosed; AI and HMR interruptions repair proof owners without incrementing the product count |
| PLITE-DECORATION-RENDER-PARITY | Existing full-corpus replay detected a shared renderer defect; the old unit test had encoded flattened attributes | no-change | Existing Regression law already requires reporter-complete expected-outcome authority, source parity, and affected-corpus replay; correct the product test instead of adding workflow machinery | shared DOM assertions cover both existing renderers and real edit/history/source transitions | Existing methodology caught the browser defect; stronger class-level proof caught two fallback lifetime gaps before final claim |

Workflow slowdowns:

| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
| --- | --- | --- | --- | --- | --- |
| Format changed `.agents` JavaScript | Agent workflow | Three rejected formatter invocations | Repo formatter intentionally excludes `.agents/**` | None | Used source tests and source/generated parity; no product delay remains |
| `www` cold typecheck exceeded 8 GB | Whole docs/application type graph | Two 4 GB and two 8 GB OOM controls | Existing graph needs about 8.56 GB; the initial blame on `useStaticEditor` was unproved | High: rejected a fake local cast/API workaround | Cold static/plain controls differ by only 275 types, 7,008 instantiations, and under 1 MB; `www` typecheck passes with a 12 GB ceiling |
| Final browser corpus ran during code-block writes | Shared checkout and Next dev host | One revoked 16-case run | Shared source changed a barrel and deleted its targets while Next served the route | None: the route was not a stable proof host | Invalidated the run; restarted against frozen source and replayed the full corpus |

Verification evidence:

- Red: full Comments Chromium run passed 15 cases and failed this case with
  expected `0`, received `2`.
- Red stability: isolated rerun on unchanged product bytes failed identically.
- Root cause: two displayed nested comment-body editors each emitted one
  retained `text` event; the primary and reviewer editors did not.
- Green diagnostic: Plate static message bodies restore `text=0`, preserve
  rich marks, and passed the complete 16-case corpus before later host churn.
- AI setup stability: the two affected cases pass 20/20 with retry zero.
- Focused package proof: 70 core/history, 12 annotation, 11 Plate Comments,
  1 Discussion, and 3 soak tests pass. Final source-bound DOM proof passes
  50/50 tests across five fresh runs.
- Final source-bound browser proof passes all 16 Comments cases five times:
  80/80, zero retries, and no source drift across 46 bound inputs.
- The earlier www typecheck passed with a 12 GB heap; static versus plain cold
  controls show under 1 MB incremental type memory. The separate DOM-coverage
  example has been adopted in shared source; generated API references were
  refreshed before the current replay.
- Current www typecheck passes all five tasks in 3 minutes 4 seconds with a
  12 GB heap. Editor/API reference, docs, registry, and generated route checks
  pass. The final Chromium and DOM receipt refreshes both bind the same
  46-input digest after shared DOM adoption; the browser command names the
  exact Discussion route and starts on a fresh host.
- Workflow repair: the current workflow source suites pass 102 tests; required
  generated resources are exact.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Comments browser and DOM receipts pass on source-bound inputs; shared Plite focus fixtures and lint block repository closure. |
| Where am I going? | The separate migration must finish its remaining integration, then repository gates and completion validators can rerun. |
| What is the goal? | Keep app-owned replies out of text rendering and preserve all comment decorations through updates. |
| What have I learned? | Static message bodies fix render containment; a separate text-flow attribute merge lost overlap IDs, while the fallback failed to claim React mutations and could use stale plain text. |
| What have I done? | Reused the static view and existing Plite DOM owners; added one shared DOM contract across both renderers; preserved all browser assertions. |

Open risks:

- The latest strict Plite run passes 85 typecheck tasks and 1,122 React tests,
  but two fixtures in
  `packages/plitejs/test/react/focus-plite-editable-contract.test.ts:104`
  and `:127` fail during DOM coverage initialization with
  `Editor runtime has not been initialized`. Root lint reports 19 formatting
  files and 15 diagnostics in concurrent DOM/schema owners. Those failures
  are outside the Comments patch. The prior clipboard/example/JSDoc blockers
  have been adopted in shared source.
- Browser and DOM receipts are final for the recorded local source digest,
  but the mandatory whole-repository gates prevent plan completion.
- No integration, push, or release claim is authorized.

Final handoff:

- Implemented and verified locally: static comment bodies, independent
  overlapping wrappers, React commit ownership, and live text on decoration
  transitions. No public API or design change.
- Final proof: 80/80 Chromium cases, 50/50 both-mode DOM tests, zero retries,
  and one matching 46-input source digest across both receipts.
- Repository closure remains open on shared Plite focus fixtures and lint.
  Do not claim this whole tree is clean or this plan is complete.
- Automatic continuation 1 revalidated the same two focus failures and root
  lint: 24 formatting files and 38 diagnostics, including additional shared
  external-text work. The final browser/DOM digest and both benchmark input
  maps remain unchanged. The parent plan records blocking occurrence 2;
  unrelated integration takeover still requires direction.
- Automatic continuation 2 revalidated the same two focus failures; root lint
  returns 26 formatting files and 41 diagnostics. Shared `editable.tsx` and
  `editable-text-blocks.tsx` changed after the passing receipt, so current-tree
  browser/DOM closure is unproven. The parent records blocking occurrence 3
  and the blocked goal decision. Preserve the original gates and replay after
  stable shared integration; do not manufacture completion from old receipts.
