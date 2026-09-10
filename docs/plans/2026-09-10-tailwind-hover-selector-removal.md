# Tailwind hover selector removal

Objective:
Remove the Tailwind compiler patch while preserving component hover/focus behavior and bounded hover cost on the full native 30,000-span code block.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-10-tailwind-hover-selector-removal.md

Primary template:
docs/plans/templates/benchmark.md

Applied packs:
None. Task, Benchmark, Hard Cut, Plate UI, Verify Plate, Testing, Poteto Mode, Autogoal and Show Me Your Work supplied the applicable methods.

## Benchmark Source

- request: User accepted component-owned selector replacement with “go” on 2026-09-10 after requesting Tailwind patch removal.
- scope: Local app/editor control CSS, test-source scanning, compiler patch registration, generated registry and affected proof. No publication requested.
- invocation: $benchmark tailwind-hover-selector-removal; performance proof inside the accepted implementation task.
- candidate-identity: fingerprint: final-source-manifest.json; current HEAD d785ce1022ad7d322e28a0caa706da003fe420ce; the task's 31 source/test/manifest path states identify local work independently of concurrent commits.
- plate-main-identity: N/A: accepted comparator is patched versus unpatched CSS on the same product, not origin/main.
- plite-identity: N/A: no Plite source/runtime changes.
- slate-identity: N/A: component CSS has no substrate comparator.
- named-symptom: Hovering the full native code-block surface must not restyle the 30,000-token subtree.
- final-artifacts: artifact: docs/plans/artifacts/2026-09-10-tailwind-hover-selector-removal/

Completion threshold:
Patch and pnpm registration absent; both installed compiler bundles match the official 4.1.8 tarball; no universal group/peer hover/focus rules in fresh app CSS. Preserve native DOM, text, adjacent typing and undo. Keep the existing maximum RecalcStyleDuration below 100 ms. Reject a material matched regression only when both above 5 ms and above 25% beyond baseline and packet spread. First entry is separate from settled samples; small samples do not support p95/p99 or speedup claims. Complete applicable lanes and plan validators.

Verification surface:
Existing www Playwright runner, native Chrome 152 Ziad through CUA, source-first www TypeScript, scoped Ultracite, registry build/check, official compiler hashes, captured CSS and source fingerprints. Full native fixture is `/blocks/code-block-huge-demo`; `/docs/code-block#native-plate-dom` is its documented 1,000-line embedded example. Artifacts retain all failed attempts.

Constraints:
Correctness and native behavior outrank metric movement. No virtualization, reduced DOM, debounce, JS hover state, compiler fork or global CSS rewriting. No package API change. No commit/push/PR authority. Autoreview is N/A on next. Other tasks' shared write windows were honored; only this task's servers/tabs are cleaned up.

Boundaries:
App component CSS, editor registry component CSS, globals scanning, patch/manifest/lockfile cleanup, affected browser tests and generated registry. Package algorithms, release lanes, unrelated style catalogs, raw-device claims and publication are outside scope. The source-only checks for currently unmounted controls are explicit in native-ui-observations.json.

Blocked condition:
A reproducible CSS regression, changed native DOM/text or material hover regression keeps the task open. Unmounted pre-existing controls and extension-injected DOM are recorded at their actual evidence boundary; they do not authorize unrelated product rewrites.

## Interaction Coverage

- first-interaction: pass: matched native first entry 1.573 ms baseline versus 2.092 ms final; native-comparison.json.
- settled-interaction: pass: native settled median 1.488 ms baseline versus 1.765 ms final; Chrome's separate 11-transition final packet ranges 1.654-3.380 ms.
- route-scope: pass: full 10,000-line block, embedded 1,000-line docs preview, editor-ai, column-demo, code-drawing-demo, discussion demo, docs sidebar and table routes; affected-ui.log and native-ui-observations.json distinguish interaction and source-only proof.
- reporter-profile: pass: real Chrome 152 Ziad, 1690x1233 DPR1, full DOM and native pointer/wheel events. DarkReader injects a recoverable hydration mismatch on editor-ai; extension state was preserved. No clean-profile/no-extension claim.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | fingerprint: final-source-manifest.json on d785ce1022ad7d322e28a0caa706da003fe420ce | fingerprint: source-before-manifest.json on initial f03d2b8 | artifact: source-before copies and exact freeze/restoration manifests |
| lockfile / package manager | pnpm 9.15.0; pristine Tailwind 4.1.8; final lock hash in source manifest | pnpm 9.15.0; patched Tailwind 4.1.8; lock e8f39bfde02f1e8bb5b886ea0576bf2299e97099901e8dd3398a95f81c1c0d4f | artifact: installed-compiler-verification.json and final-css-audit.json |
| build mode / host / port | Source-first Next dev, current checkout, 3299 .next-tailwind-final | Same checkout/source-first Next dev on 3297 | artifact: final-server.log, baseline-native-loaded.css and final-native-loaded.css |
| browser / machine / viewport / DPR | Repository Chromium at 2005x1169; native Chrome 152 Ziad at 1690x1233 DPR1 | Same browser/machine/viewport in each respective comparison | artifact: baseline-browser, final-pruned-browser and native-chrome-*.json |
| route / fixture / document / plugins | Full 10,000 lines, 30002 pre descendants, 448889 characters; EditorKit | Same route, native DOM, text and EditorKit | artifact: native-interactions tests and native-ui-observations.json |
| setup / action / DOM strategy | Pointer x1500/1000 y400, two animation frames, original full native DOM, adjacent typing/undo | Same action and correctness guard | artifact: native-comparison.json and existing test source |
| warmups / samples / interleave order | Route ready before packet; 4 headless transitions; separate 12 native Chrome transitions including initial outside position | Same protocol and counts; chronological baseline then candidate | artifact: raw packets; diagnostic-matched.json separately interleaves tag/class/tag/class with 8 transitions per packet |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Requirements, authority and timing | yes | Accepted go, local-only scope, no duration requested; standing Autogoal reused this plan. |
| Benchmark/Task method and hard-cut target | yes | Sources read before implementation; component presentation replaces compiler patch, no public abstraction added. |
| Host, fixture and oracle | yes | Patched baseline test passed; both CSS snapshots and source copies saved; full DOM/text and adjacent editing are the oracle. |
| Lane applicability and browser choice | yes | All nine lanes inventoried below; Verify Plate selects existing automated runner plus real Chrome. |
| Output and concurrency boundaries | yes | Large trace kept as bounded diagnostic summary plus reproducible CSS/DOM; frozen sources restored and verified on all 24 path states. |

Work Checklist:
- [x] Replace application group/peer hover/focus utilities with component-owned specific targets; preserve hover media queries, focus, touch visibility, menu-open/active states and nested owners.
- [x] Remove Tailwind patch and registration; official tarball matches both installed bundles. Other Bun patches remain unchanged.
- [x] Exclude source test fixtures from Tailwind scanning; fresh CSS contains zero retired hover/focus variants.
- [x] Preserve full 30002-descendant native DOM and compare patched versus unpatched hover cost, first and settled separately.
- [x] Remove unused StarOnGithub after a source-wide caller search; remove its obsolete CSS. Keep mounted Plus card and verify underline behavior.
- [x] Preserve media caption hover region; add actual editor regression coverage. Retain toolbar/touch/focus behavior and validate 19 distinct affected cases.
- [x] Regenerate registry: 371 canonical payloads and 15 sparse overlays; source checker passes. No manual generated edits or template edits.
- [x] Scoped lint and source-first www TypeScript pass. No package exports/code changed, so package build, brl and full Plite lanes are N/A.
- [x] Registry changelog N/A: implementation/performance maintenance preserves presented feature and copied install API; no new user-facing feature or dependency.
- [x] Best API doctrine repair N/A: no reusable public API or new canonical consumer setup contract; existing component presentation ownership is retained.
- [x] Keep all red packets, isolate cause, rerun exact lane before breadth, and retain keep/invalidate decisions below.
- [x] Record source/host/fixture/action provenance, small-sample limits, explicit unmounted-control limits and native screenshot observation.
- [x] Honor both shared-checkout freezes; no commit/push/PR and no Autoreview on next. Clean only task-owned sessions.
- [x] Reconcile all applicable methods and pass Benchmark/Autogoal completion validators.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Official compiler hash match; source/lock/CSS fingerprints; fresh route ready. | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - accepted comparator is patched versus unpatched CSS | No main-product comparison claim. | none |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - CSS-only component presentation | No editor engine changes. | none |
| 4 | owner-microbench-and-trace | yes | complete | Global tag invalidation isolated; class diagnostic and exact native rerun passed. | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - no mount architecture or mount performance claim | Route readiness handled in lane 1. | none |
| 6 | trusted-editing-matrix | yes | complete | Native continuous input/replacement/history/caret and block movement at desktop/mobile widths; adjacent typing and undo. | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - no substrate implementation or engine claim | Component CSS only. | none |
| 8 | example-breadth | yes | complete | 19 distinct cases pass across affected-ui.log and locator rerun; actual labels/emoji/Plus verified; unmounted sidebar-action/column-control limits explicit. | none |
| 9 | large-and-stress | yes | complete | Full 10000-line DOM; native Chrome pointer/wheel; embedded and outer docs scrolling preserved. | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: closed; kept cause and exact reruns are archived in Cause History
- lane: N/A: closed; kept cause and exact reruns are archived in Cause History
- comparable-baseline: N/A: closed; kept cause and exact reruns are archived in Cause History
- material-delta: N/A: closed; kept cause and exact reruns are archived in Cause History
- isolated-owner: N/A: closed; kept cause and exact reruns are archived in Cause History
- causal-intervention: N/A: closed; kept cause and exact reruns are archived in Cause History
- correctness-guard-result: N/A: closed; kept cause and exact reruns are archived in Cause History
- fix-class: N/A: closed; kept cause and exact reruns are archived in Cause History
- long-term-target: N/A: closed; kept cause and exact reruns are archived in Cause History
- decision-owner: N/A: closed; kept cause and exact reruns are archived in Cause History
- layer-plan: N/A: closed; kept cause and exact reruns are archived in Cause History
- compatibility-verdict: N/A: closed; kept cause and exact reruns are archived in Cause History
- fix-owner: N/A: closed; kept cause and exact reruns are archived in Cause History
- benchmark-command: N/A: closed; kept cause and exact reruns are archived in Cause History
- benchmark-rerun: N/A: closed; kept cause and exact reruns are archived in Cause History
- benchmark-rerun-result: N/A: closed; kept cause and exact reruns are archived in Cause History
- correctness-command: N/A: closed; kept cause and exact reruns are archived in Cause History
- correctness-rerun: N/A: closed; kept cause and exact reruns are archived in Cause History
- correctness-rerun-result: N/A: closed; kept cause and exact reruns are archived in Cause History
- resume-lane: N/A: closed; kept cause and exact reruns are archived in Cause History

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| hover-target-invalidation | owner-microbench-and-trace | kept | internal-implementation | Component-owned selectors ending in specific class or data-slot targets; pristine Tailwind compiler | benchmark | N/A: internal CSS implementation, no package architecture change | N/A: preserve current controls and native DOM without a public API change | apps/www component and registry owners | diagnostic-checkpoint.json and diagnostic-matched.json | pass: baseline native test preserves 30002 descendants and adjacent typing/undo | PLAYWRIGHT_BASE_URL=http://localhost:3299 pnpm --filter www test:www-browser:chromium tests/browser/code-block-native-interactions.spec.ts -g 'native huge code keeps' | pass: final-pruned.log; native style max 2.092 ms below 100 ms and below the material-regression floor | Same native code-block test: adjacent typing and undo before/after the full code block | pass: final-pruned.log; all 30002 descendants and code text retained; adjacent typing and undo passed | final-pruned.log and native-comparison.json |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| Patched baseline | 1/4 | Existing patch bounds hover invalidation | max 1.573 ms | native DOM/editing pass | keep as comparator | source intervention |
| Initial direct tag targets | 4 | Direct selector syntax alone may suffice | max 185.578 ms | budget failed before adjacent editing | invalidate implementation; preserve receipt | isolate invalidation targets |
| Matched owner diagnostic | 4 | Bare span/div/svg targets widen global invalidation | tag 294-915 ms; class 1-3 ms | 40000 spans; correct control opacity | keep causal evidence; synthetic proxy only | exact native rerun |
| Final source | 4/6/8/9 | Specific targets and dead-source removal | native max 2.092 ms; Chrome max 3.380 ms | 19 distinct cases pass; current source type/lint/registry pass | keep local implementation | complete |

Metric table:
| Action | Samples | Baseline | Final | Delta / interpretation | Artifact |
|---|---|---|---|---|---|
| Headless first native entry | 1 each | 1.573 ms | 2.092 ms | +0.519 ms; no material regression | native-comparison.json |
| Headless settled native hover | 2 each | median 1.488 ms | median 1.765 ms | +0.277 ms; too small for a speed claim | native-comparison.json |
| Native Chrome transitions | 11 each after initial outside sample | range 1.524-2.080 ms | range 1.654-3.380 ms | Max delta 1.300 ms; below 5 ms floor | native-chrome-baseline.json / native-chrome-final.json |
| Synthetic owner intervention | 16 each, interleaved | tag range 294.223-915.070 ms | class range 0.965-3.031 ms | Causal proxy only, not product speedup | diagnostic-matched.json |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Threshold and exact rerun | yes | Original full native guard | final-pruned.log; max 2.092 ms; DOM/text/editing unchanged |
| Applicable lanes and breadth | yes | Close five applicable lanes | 19 distinct affected browser cases plus native CUA observations |
| Source/host/compiler/metric honesty | yes | Fingerprint and compare final inputs | final-source-manifest.json, final-css-audit.json, installed-compiler-verification.json, native-comparison.json |
| Durable target | yes | Keep presentation in existing owners | No compiler fork, new abstraction, package API or reduced DOM |
| Type/build/lint | yes | Source-first types and affected generators/checks | final-typecheck.log, lint.log, final-test-lint.log, registry-build.log, registry-check.log |
| Changeset/changelog | N/A | No package API or presented feature change | Internal CSS maintenance; copied install shape unchanged |
| Agent rule/skill sync | N/A | No workflow files edited | Skill/vision doctrine unchanged |
| Timing and publication review | N/A | No timed/publication request; never Autoreview on next | No task commit/push/PR |
| Benchmark complete validation | yes | Run validator --complete | benchmark-plan-validation.log |
| Goal complete validation | yes | Run check-complete.mjs | goal-plan-validation.log |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and source readiness | complete | Baseline and native goal recorded | none |
| Ordered diagnosis and cause | complete | Preserved red candidate and matched causal intervention | none |
| Fix and exact rerun | complete | final-pruned.log | none |
| Remaining breadth | complete | 19 distinct cases and native-ui-observations.json | none |
| Closeout | complete | Source/compiler/CSS hashes and plan validators | none |

Findings:
Direct selectors must end in specific target classes/attributes. Bare `span` hover targets trigger global tag invalidation even when the styled component is not mounted. The unused GitHub-star component was deleted. Media hover belongs on the figure so the caption remains in its hover region.

Decisions and tradeoffs:
Keep stable visual behavior in component CSS. Preserve theme/data-state variants because those states legitimately affect descendants; do not ban all universal selectors. Existing sidebar actions have no mounted caller, and the current column demo mounts no column handle; their preserved source ownership is not a runtime drag/action claim.

Harness/methodology repairs:
Wait for fresh-route readiness before performance measurements. Replace two browser locators that depended on deleted generic group markers; their behavior assertions are unchanged. Report synthetic forced-style probes separately from native frame-based timing. Native dev CSS caches unused classes, so fresh final-source.css proves the deleted component's utilities are absent from a clean compile; native measured CSS hashes remain identical after its deletion.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Bare tag target implementation | 1 | Specific classes, then dead-source removal | Original native guard passes |
| Cold route navigation timeout | 1 | Await HTTP 200; unchanged test | Ready rerun passes |
| Obsolete .group test locators | 2 | Locate existing layout/parent without retired marker | All three focused rerun cases pass |
| CUA readiness/unsupported focus/ambiguous emoji locator | bounded | Use documented click/press and freshly resolved target | Native controls verified; no source change |

Verification evidence:
Both installed Tailwind files match the official tarball. Fresh CSS is 401463 bytes with zero group/peer hover/focus variants and zero deleted GitHub-star targets. Registry generation/check, source-first www typecheck and scoped lint pass. Nineteen distinct browser cases pass; the exact native test was rerun after the final source deletion. Native Chrome retains 30002 descendants and 448889 characters through wheel scrolling, and the docs preview retains 3002 descendants through inner/outer scroll.

Final handoff contract:
- goal plan / scope: This local Tailwind removal plan.
- candidate / baseline identities: final-source-manifest.json and source-before-manifest.json; final CSS/compiler fingerprints retained.
- completed / N/A / pending lanes: 5 complete, 4 N/A with applicability reasons, 0 pending.
- first conclusive cause: Global hover invalidation keyed to bare span targets.
- baseline / latest / best metrics: Native max 1.573 / 2.092 ms; no speedup claimed.
- fix owner / changed files: Component CSS, dead GitHub-star source, Tailwind patch/registration, source scanning, tests and generated registry.
- exact benchmark and correctness reruns: final-pruned.log, affected-ui.log, control-locator-rerun.log.
- resumed breadth: All applicable local lanes closed, with unmounted-control limitations explicit.
- packet decisions: Baseline kept, initial candidate invalidated, class-target evidence and final implementation kept.
- harness/methodology repairs: Fresh route readiness, obsolete test locators and source/runtime CSS cache distinction recorded.
- residual claim limits / next owner: Local development/browser proof; no publication, raw-device or full cross-engine certification.

Timeline:
- 2026-09-10: Captured patched baseline and created native goal before implementation.
- 2026-09-10: Initial unpatched implementation failed the existing hover budget; native invalidation trace and interleaved diagnostic isolated bare tag targets.
- 2026-09-10: Honored publication freeze; all 24 interim file states and pristine dependency graph were restored and independently checked.
- 2026-09-10: Corrected selectors, preserved caption hover, generated registry, passed native/UI/source checks, removed unused GitHub-star source, and reran exact final proof.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Local implementation and verification complete |
| What is next? | User review; publication requires its own authority |
| What is the goal? | Remove compiler patch while retaining controls and full native DOM performance |
| What did I learn? | Global invalidation depends on selector targets, not just descendant syntax |
| What did I do? | See receipts and final handoff contract |

Open risks:
No unresolved in-scope regression. Native Chrome's DarkReader-injected hydration warning and currently unmounted sidebar/column controls are explicit proof limits, not clean-state or interaction claims. Small packets establish the frozen guard and exclude a material regression; they do not establish percentile distributions or a speed improvement.
