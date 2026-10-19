# Code block docs scrolling

Status: local scrolling repair verified. Adjacent typing improved with a measured 125 ms first-key outlier. Attempt 1's route-wide completion remains invalidated; the original evidence is preserved in `artifacts/2026-09-05-code-block-docs-scrolling/pre-closeout-plan-history.md`.

Objective:
Repair scrolling on `http://localhost:3000/docs/code-block`, identify the owning work across its four demos, preserve the complete native 10,000-line DOM, and address slow typing in the paragraphs next to that block. Leave the native full-page example open. The user authorized autonomous local repair and rearchitecture and explicitly rejected assuming virtualization was the only answer.

Completion threshold:
For the matched 30-wheel CodeMirror interaction, reduce main-thread work by at least 50% outside baseline spread. Verify first and settled outer/native/CodeMirror scrolling without frames above 100 ms in the reporter's Chrome profile. Preserve all four demos, native text and DOM, bounded CodeMirror DOM, editing/history, IME, remote updates, language changes, and adjacent typing. Record actual first-key latency rather than claiming every key is below 100 ms.

Verification surface:
- Exact docs route and `/blocks/code-block-huge-demo` through supported CUA controls, real Chrome 152 profile, 2005×1169, DPR 2.
- Existing www Chromium runner: code-block demos, CodeMirror, shared views, native pointer/adjacent typing, installed React capture, Tailwind variants and table selection. The docs test includes a 390 px layout check.
- Plite DOM and React source-first types; 102 React coordinate/root-interaction/input-router tests and 9 DOM geometry tests; scoped lint, registry generation and changelog checks.
- Evidence directory: `docs/plans/artifacts/2026-09-05-code-block-docs-scrolling/`. All artifact names below are relative to it.

Constraints:
Keep every native line and every demo mounted. No virtualization, hidden preview, renderer substitution or fixture reduction. Preserve the user's original full-page tab and any edits in it. No commit, push, PR, native goal, scheduler or other checkout was authorized.

Boundaries:
Owning website/registry CSS, native code text-host layout, Next's bundled React selection capture, Tailwind's group/peer generation, and Plite event/coordinate ownership implicated by the exact interaction. Public API call shapes and serialized data are unchanged. Broad website lifecycle repairs, the separate home-page drag-selection failure and the previously documented table pixel-control harness debt are outside this repair.

Blocked condition:
A wrong route or input target, missing reporter-profile proof, altered document/DOM, or failed in-scope editor guard prevents the associated conclusion. Those scrolling gates pass. The extra home-page drag-selection check, table positive-control harness and broad www typecheck remain red as recorded below; this is not whole-repository green or release proof.

## Benchmark Source

- request: autonomous exact-route scrolling diagnosis and local repair, extended to native full-page and adjacent typing
- scope: code-block docs with all four demos, native full page and adjacent paragraphs
- invocation: $benchmark perf localhost:3000/docs/code-block
- candidate-identity: fingerprint: attempt2-source-final.json
- plate-main-identity: N/A: no historical main regression or cross-editor ranking was requested
- plite-identity: fingerprint: attempt2-source-final.json includes DOM geometry, React input router and root interaction controller
- slate-identity: N/A: no raw substrate comparison
- named-symptom: multi-second scrolling stalls and slow adjacent typing with full native 10k DOM
- final-artifacts: artifact: docs/plans/artifacts/2026-09-05-code-block-docs-scrolling/

## Interaction Coverage

- first-interaction: pass: clean-source docs outer scroll max 50 ms, native inner 9.4 ms, CodeMirror inner 17.6 ms; attempt2-final-docs-first-down.json, attempt2-final-docs-native-first.json, attempt2-final-docs-cm-first.json. Adjacent first keys 124.5 ms above and 89.9 ms below are explicitly retained in typing receipts.
- settled-interaction: pass: docs reverse outer max 49.8 ms, native 9.3 ms, CodeMirror 9.3 ms; attempt2-final-docs-settled-up.json, attempt2-final-docs-native-settled.json, attempt2-final-docs-cm-settled.json. Repeated adjacent keys and Backspace preserve text; no universal sub-100-ms typing claim.
- route-scope: pass: all four docs demos remain mounted; native editor retains 30042 descendants and 448889 code characters. Standalone native, default, CodeMirror and shared-view tests pass, including mobile docs layout. attempt2-browser-final-v2.log and attempt2-final-route.log.
- reporter-profile: pass: actual Chrome profile Ziad, browser 2, Chrome 152, 2005x1169 DPR2. 1Password remains enabled. The user removed Awesome Screenshot; its injected hover-span CSS is absent in the subsequent trace. Final measurements apply to that explicitly changed profile; attempt2-final-native-state.json and attempt2-after-removal-hover-trace.json.gz.

## Failed fix history

- attempt: 1
- failure-kind: reporter-contradiction
- base-acceptance: required: responsive exact docs route, all four demos, full native 10k DOM
- latest-reporter-delta: required: "still fucking slow", then native full-page and adjacent typing
- invalidated-authority: attempt 1 route-wide completion; settled matched CodeMirror CSS evidence remains diagnostic support only
- repair-now: Benchmark's completion validator and template require first input, settled input, complete route scope and reporter profile; executable contract tests reject the old warmed-only packet. Regression records the failed-fix transition. 20 Benchmark and 138 Regression contract tests pass; source mirrors regenerated and inspected.
- exact-route: http://localhost:3000/docs/code-block
- exact-route-reproduction: red before attempt 2 repair
- reporter-profile: original Chrome browser 2, viewport 1623x1105 DPR2, 1Password and Awesome Screenshot present
- reproduction: outer wheel produced a 14882.8 ms frame; CPU profile attributes 14701 ms to 1Password findLabelText descendant geometry
- proof: attempt2-page-up-rest.cpuprofile
- resume: attempt 2 source repair followed workflow regeneration and proof

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | next, attempt2-source-final.json | initial source-before.json; original CSS/consumer intervention and individual owner probes | artifact: source-before.json, source-after.json, attempt2-source-final.json |
| lockfile / package manager | pnpm; maintained Next 16.3.2 and Tailwind 4.1.8 patches | initial source-before.json lockfile; owner interventions isolate CSS, React traversal and geometry | artifact: patch files, source hashes and installed-code browser tests |
| build mode / host / port | Next development, source-first plate-2/apps/www, port 3000, PID 3549 at receipt | same Mac and source checkout; server restarts recorded in historical measurement notes | artifact: attempt2-source-final.json |
| browser / machine / viewport / DPR | reporter Chrome 152, 2005x1169 DPR2; 1Password enabled, Awesome Screenshot removed by user | initial matched CSS comparison uses IAB 1422x800 DPR1.8; reporter cold diagnosis uses Chrome 1623x1105 DPR2 | artifact: each packet records its actual viewport; no cross-profile speedup percentage |
| route / fixture / document / plugins | exact docs route plus native full page; unchanged 10k native/CM fixtures and EditorKit | same fixtures and full native DOM | artifact: attempt2-final-native-state.json and wheel packets |
| setup / action / DOM strategy | inner 30 real wheel events at 240px; outer 25 events at 240px; 2 rAF between inputs; native 30042 descendants | matched initial CSS packet uses 30 events at 240px; reporter CPU and hover probes are attribution lanes | artifact: wheel packets and profiles; no conflation of inner and outer scrollers |
| warmups / samples / interleave order | fresh route, first downward packet then settled reverse for each scroll owner; real adjacent keys above/below | original/restored CSS packets 16.65/18.05/16.35s; separate first-focus and hover traces | artifact: historical packet ledger and attempt2-final-docs-*.json; first rAF initialization interval is not used as a latency sample |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Actual reporter profile, source-first server, exact routes, full native text/DOM and final hashes | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - no main regression claim; current baseline is captured directly | Same-source owner interventions | none |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - no engine ranking; CSS, dependency and coordinate owners are directly attributed | CPU/rendering traces and bounded geometry regression | none |
| 4 | owner-microbench-and-trace | yes | complete | Ancestor CSS, extension geometry, group/peer invalidation, React capture and paragraph hit-test attribution | none |
| 5 | product-mount-matrix | yes | complete | Fresh docs and standalone default/native/CM/shared views pass; mount latency is not certified | none |
| 6 | trusted-editing-matrix | yes | complete | 21 scoped code-block/patch browser checks; native/CM editing, history, IME, remote updates, languages, adjacent paragraphs; 111 package tests | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - no Slate or cross-editor comparison | Exact product interaction scope | none |
| 8 | example-breadth | yes | complete | All four docs demos, mobile overflow and four table behavior checks; extra home-page drag test remains separately red and is not attributed to the geometry cut | none |
| 9 | large-and-stress | yes | complete | Native 10000 lines, 448889 characters, 30042 editor descendants; first/settled wheel packets; bounded CM viewport | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: retained scoped repairs are recorded in Cause History
- lane: N/A: applicable scrolling lanes concluded
- comparable-baseline: N/A: see Cause History and Comparison Signature
- material-delta: N/A: see measured outcomes below
- isolated-owner: N/A: see Cause History
- causal-intervention: N/A: see Cause History
- correctness-guard-result: N/A: no active cause
- fix-class: N/A: no active cause
- long-term-target: N/A: no active cause
- decision-owner: N/A: no active cause
- layer-plan: N/A: no active cause
- compatibility-verdict: N/A: no active cause
- fix-owner: N/A: no active cause
- benchmark-command: N/A: completed packets below
- benchmark-rerun: N/A: completed packets below
- benchmark-rerun-result: N/A: completed packets below
- correctness-command: N/A: completed checks below
- correctness-rerun: N/A: completed checks below
- correctness-rerun-result: N/A: completed checks below
- resume-lane: N/A: local handoff with explicit limits

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ancestor-css-invalidation | owner-microbench-and-trace | kept | internal-implementation | Route-owned footer and bounded component selection styling | benchmark | N/A: private CSS | N/A: preserve current presentation and DOM | site-footer.tsx, sidebar.tsx, globals.css, table.tsx, input-group.tsx, settings-dialog.tsx | Restored original selector consumers cost 16.35s; clean source 0.14-0.15s; 64k-element style passes reduced to at most 381 | pass: full document and DOM retained | CUA 30-wheel packets and docs browser row | pass: matched CSS intervention reduced main-thread work 99.1%; final reporter CM packets 229-281ms total | Existing code-block and table browser cases | pass: scoped code-block tests and four table behavior rows; separate pixel-control gap retained | historical traces, attempt2-browser-final-v2.log, attempt2-table-final.log |
| native-inline-extension-geometry | owner-microbench-and-trace | kept | internal-implementation | Native text host without one giant inline box | benchmark | N/A: private renderer CSS | N/A: full native DOM and native selection retained | code-block.tsx | 1Password findLabelText spends 14.7s reading inline geometry; display contents removes the host box with all text/token descendants retained | pass: unchanged 10000 lines | CUA clean-source first/settled reporter route packets | pass: outer max 50ms; native inner max 9.4ms with 1Password enabled | Native edits/history/IME and adjacent paragraph browser cases | pass: exact full native value and 30042 descendants | attempt2-page-up-rest.cpuprofile, attempt2-final-docs-*.json |
| relational-hover-invalidation | owner-microbench-and-trace | kept | internal-implementation | Equivalent group/peer ancestor and sibling selectors with bounded hover invalidation | benchmark | N/A: compiler output only | N/A: same selector meaning and specificity | patches/tailwindcss@4.1.8.patch; globals.css source exclusions | Universal descendant in generated is selector and extension span rules restyle token subtree; compiled variant rewrite and test-source exclusions eliminate application contribution; user removes extension contribution | pass: variant semantic oracle | CUA four pointer transitions | pass: final reporter tasks 2.17-4.29ms, style 0-2.04ms; profile change disclosed | Tailwind installed-compiler browser test and native interaction test | pass: ordinary/named/focus/data/arbitrary/negated/combined/pseudo-element variants and full native DOM | attempt2-hover-invalidation.json, attempt2-clean-reporter-hover.json |
| react-selection-capture | owner-microbench-and-trace | kept | internal-implementation | Native Range prefix lengths for existing selection offsets | benchmark | N/A: host dependency implementation; Best API and Plite Plan consulted without public shape change | N/A: preserve UTF16 offsets, orientation and native selection | patches/next@16.3.2.patch | Adjacent key profile spends 40.9ms in React capture; direct original/native offset probes agree while avoiding full descendant JavaScript traversal | pass: matching forward/backward/element/foreign-node offsets | CUA first/settled real adjacent keys | pass: final docs keys 42.8-124.5ms above and 62.6-89.9ms below; no universal100ms budget | Installed capture code tested across all ten Next React bundles plus editor browser cases | pass: ten capture cases and native/CM editing/history | attempt2-adjacent-typing.cpuprofile, attempt2-final-docs-typing-*.json |
| paragraph-coordinate-scope | owner-microbench-and-trace | kept | internal-implementation | Existing mounted block owns whitespace hit-test candidates | benchmark | N/A: internal geometry adoption; Best API and Plite Plan consulted | N/A: retain native focus, root-padding fallback and nested-editor ownership | dom-geometry.ts, root-interaction-controller.ts | Caller discarded ordinary target; geometry scanned all editor strings; cold profile showed rect reads/sort/GC; regression is red when sibling geometry is measured | pass: existing coordinate laws before new performance assertion | CUA cold focus profile and adjacent typing packets | pass: scoped focus 114.6ms under profiling; final first keys 77.8ms standalone and124.5ms docs; no multi-second adjacent stalls in replays | 102 React and9 DOM geometry tests; adjacent native browser case | pass: correct paragraph end, zero sibling measurements and unchanged code | attempt2-geometry-red.log, attempt2-geometry-green.log, attempt2-dom-geometry.log |

## Accepted design

The strongest cut is the document-wide work. Keep the native renderer and every token; remove broad style dependencies, the giant inline text-host box, React's JavaScript descendant walk, and the root hit-test's loss of its actual target. The existing route/component, native selection and mounted geometry owners remain sufficient. No public plugin, cache, index, flag or parallel editor is added.

Rejected alternatives: hiding/unmounting the native demo, virtualizing it, replacing it with CodeMirror, iframe isolation, fake selectionStart fields, plaintext-only selection bypasses, per-example geometry caches, and removing native coordinate repair. They either violate the requested full-native behavior or preserve the owning redundant work. Temporary font-input/control-order and Dnd-wrapper probes were reverted.

The earlier portal guard remains: focus and mouse events from React portals outside an Editable must not resolve against that Editable's DOM. The shared-view language-menu test and input-router package tests cover both paths. Mobile inline API names use overflow-wrap:anywhere while code blocks retain horizontal scrolling.

The Next patch applies to this website's ten bundled React distributions. It does not patch downstream Plate applications using their own React. Both dependency patches are installed through pnpm and documented in `patches/README.md`; upgrades must replay their behavioral tests.

## Measured outcomes

These are development-mode observations on the stated profile, not engine rankings, percentile claims or release budgets. Outer packets contain 25 wheel events; inner packets contain 30. Task duration is total main-thread work, distinct from the largest rAF interval.

| Final reporter action | First / settled main-thread work | Largest frame interval | Evidence |
|---|---|---|---|
| Outer docs scroll, 0→6000→0 | 510 / 469 ms | 50.0 / 49.8 ms | attempt2-final-docs-first-down.json, attempt2-final-docs-settled-up.json |
| Native inner scroll, 0→7200→0 | 153 / 123 ms | 9.4 / 9.3 ms | attempt2-final-docs-native-first.json, attempt2-final-docs-native-settled.json |
| CodeMirror inner scroll, 0→7200→0 | 281 / 229 ms | 17.6 / 9.3 ms | attempt2-final-docs-cm-first.json, attempt2-final-docs-cm-settled.json |
| Pointer entry/exit, full native page | 2.17-4.29ms per transition | Separate task measurement | attempt2-clean-reporter-hover.json |
| Typing above native code in docs | First Z 124.5ms; next Z 48.6ms; Backspace 51.6/42.8ms | Keydown to second rAF | attempt2-final-docs-typing-above.json |
| Typing below native code in docs | First Z 89.9ms; next Z 71.6ms; Backspace 64.1/62.6ms | Keydown to second rAF | attempt2-final-docs-typing-below.json |

Native code remains 448889 characters and 10000 lines. The native editor has 30042 descendants; its pre alone has 30002. CM remains viewport bounded. Typed probe characters were removed and both adjacent paragraphs restored. The final full-page screenshot and state are `attempt2-final-native.png` and `attempt2-final-native-state.json`.

## Verification and residuals

- Final browser batch: 21 scoped code-block/patch tests pass. The extra Dnd test fails. The two exact docs/native interaction rows pass again after the geometry diagnostic is restored, with output isolated from concurrent test runs. See `attempt2-browser-final-v2.log` and `attempt2-final-route.log`.
- Table breadth: four behavior rows pass, including native-highlight suppression, drag contraction, hidden block handles and resize-hover behavior. The separate paint-only row fails its positive control before its actual product-pixel assertion. The same control failure is documented in `docs/plans/2026-08-26-selected-node-render-performance.md`. Its screenshot shows selected-cell color, but an unclassified screenshot cannot certify layer count. Regression's control rule keeps product edits frozen for that case; no table paint fix or retry is claimed. See `attempt2-table-final.log`.
- Package behavior: 102 React tests and 9 DOM tests pass. DOM and React source-first entrypoint types pass. Changed package/website files pass scoped Ultracite.
- Registry build passes: 366 canonical payloads and 15 sparse overlays. Changelog generation/check passes for 117 events, including concurrent source entries. Generated files come from the generators.
- Early native IME polling failed once; the isolated replay and final native full batch pass. The failure is preserved in `attempt2-final-browser-early.log`; no retries are counted as independent successes.
- The home-page Dnd check had a stale third-wrapper locator. Its locator now finds the actual direct block and it waits for the canonical editor harness. Its drag still yields empty native selection. That same failure reproduces with both new geometry changes temporarily reverted; source was restored immediately. This is an unresolved breadth check, not proof of a geometry regression or a fixed Dnd feature. See `attempt2-dnd-ready.log` and `attempt2-dnd-baseline.log`.
- Broad www typecheck remains red in other AI/DnD lifecycle-test owners; `www-typecheck-final.log` preserves the diagnostics. No full check or release claim.
- Adjacent first input is not consistently below 100 ms: 125 ms docs first key and 129 ms standalone Backspace were observed. Editing inside the entire native 10k code block and cold mount still have separate costs; neither is certified fast by this scrolling repair.
- Awesome Screenshot removal is a user action and a changed environmental input. The agent did not change extension settings. Final results must not be presented as code-only improvements with that extension still enabled.
- Synthetic IME and mobile viewport rows are not physical-device proof. No Firefox/WebKit/native-device matrix was run for this local Chrome report.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Scope and authority | yes | Exact docs/native page and adjacent typing; autonomous local repair; full native constraint |
| Technical owners | yes | Task, Benchmark, Regression failed-fix repair, Best API/Plite Plan internal decisions, Plate UI, Verify Plate, Testing and Poteto methods |
| Browser identity and action | yes | Real Chrome profile, exact target and first/settled packets; wrong-target and partial/mislabeled old packets excluded |
| Comparison | yes | Owner interventions and original matched CSS packet; profile/viewport changes explicitly separated |

Work Checklist:
- [x] Attribute scrolling without assuming a native virtualization ceiling.
- [x] Repair the failed completion method before attempt 2 product work.
- [x] Remove the measured owning work while retaining full native DOM.
- [x] Verify first and settled outer/native/CM scroll in the reporter profile.
- [x] Verify adjacent typing, native/CM editing/history and dependency semantics.
- [x] Generate registry/changelog output, preserve failures and record final source identity.
- [x] Leave a fresh native full-page deliverable open and preserve the user's original tab.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Scroll threshold | yes | Matched CSS improvement plus complete reporter route proof | Matched 99.1% CSS reduction; final first/settled scroll frames below 100 ms |
| Correctness | yes | Scoped browser and package guards |21 code-block/patch browser checks; 111 package tests; exact route reruns |
| Package types | yes | Source-first DOM/React | Both entrypoint checks pass |
| Website types | yes | Record diagnostic boundary | Broad www remains red in other lifecycle owners; no root-green claim |
| Extra breadth failures | yes | Preserve and classify failures | Dnd empty selection also occurs without new geometry; table pixel positive control is existing harness debt; no green claims for either |
| Registry | yes | Generate source-owned output | build:registry plus changelog --write/--check pass |
| Source identity | yes | Record actual owner/dependency/test hashes | attempt2-source-final.json |
| Lint | yes | Scoped Ultracite | Changed source/test files pass |
| Public API doctrine | no | N/A: no public call shape or durable doctrine changed | Internal code/CSS/dependency repair |
| Autoreview/publication | no | N/A: next forbids Autoreview; no publication authority | No commit, push or PR |
| Browser cleanup | yes | Remove diagnostics and preserve deliverable | Fresh native page, default reporter viewport, original user tab untouched |
| Plan structure | yes | Benchmark --complete and file completion checker | attempt2-plan-validation.log |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Ground and design | complete | Reporter profiles, causal traces and maximum-value cuts | none |
| Implementation | complete | Bounded owners and maintained dependency patches | none |
| Proof | complete | Exact scoped route/package guards with residuals disclosed | none |
| Local handoff | complete | Source hashes, artifacts, open native page and limits | No publication authorized |

Final handoff contract:
Local scrolling repair and adjacent-typing improvement are verified on the exact current routes and changed reporter profile. Full native DOM remains. The first-key, internal native-code editing, mount, Dnd, table pixel-control and broad-typecheck limits remain explicit. No commit, push, PR or release was performed.

Verification evidence:
- Fresh exact docs/native browser rows pass after source restoration; 21 code-block/patch checks and four table behavior rows pass. DOM/React types, 111 package tests, scoped lint and generated registry checks pass. Saved logs and final source fingerprints identify their scope.

Open risks:
- First adjacent input can exceed 100 ms. Internal native-code editing and mount speed are not certified. Dnd selection, the table positive-control harness and broad www lifecycle types retain the explicitly recorded failures. Dependency upgrades must replay both patches.
