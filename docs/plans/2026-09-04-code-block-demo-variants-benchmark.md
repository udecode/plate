# code block demo variants benchmark

Objective:
Ship three code-block demos and benchmark huge native Plate versus CodeMirror;
done when distinct demos and matched benchmark, correctness, and browser gates
pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-04-code-block-demo-variants-benchmark.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: keep the default code-block value from main, add one huge native
  code-block demo without the CodeMirror void adapter, add one huge CodeMirror
  demo, then benchmark the two huge demos
- scope: `apps/www` registry examples, the shared 10,000-line fixture, focused
  browser correctness, and one matched product benchmark; `editor-ai` and
  editor runtime changes are excluded
- invocation: `$benchmark code-block demo variants`
- candidate-identity: commit:a6afd55c30e97c74fe895d1ad005ca75413110f3 plus final SHA-256 fingerprints
  for every demo, shared fixture, component, test, runner, registry, and host
  input
- plate-main-identity: `origin/main` at
  `12a034f7cfe698cc020fade0d4849373d6faa065`; authority only for the default
  demo's content, not a huge-code performance baseline
- plite-identity: same current checkout and lockfile as both compared product
  routes; final source fingerprints required
- slate-identity: N/A: both requested variants use the same current Plite
  substrate, and the requested delta is native Plate rendering versus the
  CodeMirror inner adapter
- named-symptom: quantify the cost of fully DOM-present highlighted 10,000-line
  code against the bounded CodeMirror projection without changing model text
  or user action
- final-artifacts: artifact:docs/plans/artifacts/2026-09-04-code-block-demo-variants-benchmark/ receipt
  and runner, plus focused browser tests

First checkpoint:
- Copy every explicit requirement into checkable rows before measurement or
  code changes.
- Resolve source identities, host/build freshness, fixture/action comparability,
  correctness guards, and every default lane's applicability.
- All applicable lanes are selected by default. Only an explicit `only`
  invocation may mark otherwise relevant lanes
  `N/A: only - <reason>`. Use `N/A: inapplicable - <reason>` only for a lane
  that genuinely cannot apply.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: one-shot execution to complete evidence
- start / deadline: N/A
- final loop closure: finish only after all three demos, matched results,
  correctness, Browser, registry, package, plan-validator, and goal gates close

Completion threshold:
- Three distinct registry demos exist: default main-style content, one shared
  10,000-line fixture through native Plate rendering, and the identical fixture
  through CodeMirror.
- The two huge routes share exact model text and plugin composition except for
  the code-block element renderer. A source hash and model hash prove parity.
- A matched browser runner records three warmups and at least 15 samples per
  strategy for navigation-to-queryable, trusted input-to-paint, and highlight
  settle; it reports p50/p75/p95/max, deterministic DOM/rendered-line/text-host
  work, absolute/relative deltas, correctness, environment, and source identity.
- Frozen shared budgets are navigation-to-queryable p95 <= 5000 ms, trusted
  input-to-paint p95 <= 200 ms, and highlight-settle p95 <= 600 ms. A timeout is
  reported as censored failure, never converted into a fake duration.
- Material comparison requires a p95 delta greater than both 10% and the larger
  of 50 ms for navigation, 4 ms for input, or 20 ms for highlighting, with
  structural work moving in the predicted direction.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`; P1 autoreview runs unless
  the checkout is `next`, where repo law forbids it; the Autogoal checker passes.

Verification surface:
- benchmark commands / artifacts: one current-source runner under the final
  artifact directory, executed against a freshly started matched host
- correctness commands: focused Chromium tests for exact 10k model ownership,
  native and CodeMirror typing/undo/redo/IME/read-only behavior, plus registry
  generation and affected app type/lint checks
- Browser / Chrome / device proof: Browser opens all three standalone
  `/blocks/*-demo` routes; ordinary UI only, so Chrome/Computer is N/A
- source/ref/fingerprint proof: HEAD, `origin/main`, lockfile, shared fixture,
  both renderers, demos, registry inputs, test, runner, and host configuration

Constraints:
- Correctness and native editor behavior outrank metric movement.
- Do not hide latency with debounce, delayed work, changed fixtures, degraded
  DOM, or a narrower action.
- Do not create another benchmark target registry or permanent run ledger.
- A conclusive cause pauses later lanes; it does not complete the goal.
- A proven cause selects the best long-term durable target, not the cheapest
  compatible patch. Before stability, hard-cut API or architecture when that
  buys materially better lasting value; preserve only a named hard correctness,
  security, serialized-data, native-behavior, or runtime law.
- After a fix, rerun the exact red lane and correctness guard before breadth.
- Do not commit, push, open a PR, comment, publish, or release unless separately
  authorized.

Boundaries:
- allowed runtime/packages/apps: `apps/www` registry examples, descriptors,
  generated registry output required on `next`, and focused browser tests
- allowed benchmark/tests/fixtures: the existing code-block CodeMirror browser
  proof and product runner may be split/repaired; one shared huge fixture and
  one artifact folder are allowed
- allowed baseline checkouts/hosts: current checkout only for performance;
  read-only `origin/main` content lookup for the default value
- non-goals: no `packages/**` runtime change, no editor-ai change, no CodeMirror
  core redesign, no external-editor comparison, no release or Git publication

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Stop if both strategies cannot use one exact model fixture/action, if a fresh
  matched host cannot run, or if native rendering fails three retry-free
  attempts. In the last case, preserve the failure/timeout artifact and report
  a censored result rather than weakening the fixture.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | current CodeMirror route, HEAD plus final measured fingerprints | current native route, same HEAD plus final measured fingerprints | artifact: `comparison-signature.receipt.json`; runner rejects source hash drift |
| lockfile / package manager | pnpm, lock SHA `13b3c61f982c231b47d9055c86da88c5a6092ce3d273d5ffc3ee09e599555ba9` | same | artifact: `comparison-signature.receipt.json` exact lock hash |
| build mode / host / port | fresh Turbopack development host at port 3100 | same process and port | artifact: `comparison-signature.receipt.json`; production compile passed but unrelated `/dev/editor-perf` prerender failed |
| browser / machine / viewport / DPR | bundled Playwright Chromium on Darwin arm64, 1280x720 at DPR 1 | same | artifact: `comparison-signature.receipt.json` environment identity |
| route / fixture / document / plugins | `/blocks/code-block-codemirror-demo`, shared 10k text, EditorKit with CodeMirror code element | `/blocks/code-block-huge-demo`, same shared 10k text, normal EditorKit | artifact: `comparison-signature.receipt.json` source and exact model hashes |
| setup / action / DOM strategy | navigate, select end, trusted type, wait model/paint/highlight; bounded CodeMirror DOM | identical; native full text DOM | artifact: `comparison-signature.receipt.json` paired correctness and structure rows |
| warmups / samples / interleave order | 3 warmups, 15 samples, AB/BA interleaved | same | artifact: runner configuration; raw samples will be retained and p99 omitted |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Three demos, default content authority, two huge strategies, shared fixture, and benchmark deliverable are explicit above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `benchmark` source and methodology read | yes | Skill and all 302 methodology lines read before goal creation or measurement. |
| Active goal checked or created | yes | No prior goal was active; current Benchmark goal created with this plan. |
| Candidate and baseline identities recorded | yes | HEAD, main ref, lock hash, routes, fixture, action, and final fingerprint contract recorded above. |
| Target/runner discovery completed from current source | yes | Existing CodeMirror route test and product runner found; no native huge target exists, so this packet will create the paired route and one shared runner. |
| Host/build/fixture freshness proved | yes | `comparison-signature.receipt.json` passes on the fresh 2026-09-04T13:46:54Z host; both routes expose model SHA `2c4ba3ddc3f5ef0e46e46649bee509d3a4ac071ebfb0c41db871601067298766`. |
| Correctness oracle identified | yes | Existing CodeMirror browser suite plus paired native model/editing assertions and all-route Browser smoke. |
| All default lanes inventoried | yes | Applicability resolved in the lane table below. |
| `only` narrowing explicitly authorized or N/A | no | N/A: normal scoped run; genuinely unrelated lanes are marked inapplicable, not `only`. |
| Browser/native proof strategy selected | yes | Browser for routes; Playwright Chromium for trusted input/IME. Chrome and Computer are not required. |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |
| Browser pack selected | yes | Browser pack materialized in this plan. |
| Browser route / app surface identified | yes | Three standalone `/blocks/*-demo` routes named above. |
| Browser tool decision recorded | yes | Browser for visual route proof; Playwright Chromium for repeatable trusted input. |
| Console/network caveat policy recorded | yes | Final fresh pages must have no runtime console/page errors; build-time host output is reported separately. |
| Observable browser case captured | no | N/A: this is a new benchmark comparison, not a reporter-backed bug claim. |

Work Checklist:
- [x] Every explicit scope, comparison, timing, stop condition, deliverable,
      verification surface, and success criterion is recorded.
- [x] Short objective, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason.
- [x] Candidate/baseline signatures prove comparable source, fixture, action,
      build, browser, machine, and sampling.
- [x] Primary metrics match navigation and trusted end typing; event-to-paint
      remains labeled as a lab proxy.
- [x] Samples expose p50/p75/p95 only, because 15 samples cannot support p99,
      plus max, absolute/relative delta, and noise evidence.
- [x] No red product lane or causal repair is claimed from this strategy
      comparison.
- [x] No proven product cause exists; pause/fix routing is N/A.
- [x] No proven product cause exists; fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [x] No public API or runtime architecture fix was selected, so `best-api`,
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution, and adoption planning are N/A.
- [x] No product owner was fixed; final source fingerprints triggered an exact
      benchmark rerun after test repair.
- [x] Harness failures were repaired and replayed on the same comparison.
- [x] The final source-stable rerun resumed every remaining applicable lane.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [x] Harness/metric/host defects were repaired before interpreting results.
- [x] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.
- [x] Browser pack: route, interaction path, and expected visible outcome were recorded before proof.
- [x] Browser pack: Browser proved normal app surfaces; Chrome and Computer are
      N/A because no native browser/OS dialog, permission, profile, or exact
      Chrome rendering claim exists.
      Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: Browser and runner recorded zero console, page, and network errors.
- [x] Browser pack: screenshot is N/A because Browser directly inspected every
      claimed model/DOM/rendered-line state; no pixel claim exists.
- [x] Browser pack: classified pixel controls are N/A because there is no
      reporter-visible paint claim.
      A reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed failure proof is N/A; this is a new local
      comparison, not a fixed issue claim.
- [x] Browser pack: final proof uses fresh contexts on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: exact pushed-ref/clean-checkout proof is N/A because nothing
      was committed or pushed and no public fixed/completed claim is made.
      Fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: focus, editing, and IME passed 5/5 retry-free runs for both
      huge modes in bundled Chromium.
      Native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

### Performance

- applicability: applied
- Vercel rules used: none; this packet compares renderer strategies and does
  not propose React or Next micro-tactics
- extra rules used: cohort-segmentation, repeated-unit-budget,
  interaction-inp-matrix, memory-dom-tagging, degradation-contract,
  staged-readiness, editor-native-behavior-proof, browser-trace-cwv-proof
- repeated unit: syntax token and physical code line inside one text block
- cohorts: normal is the three small default examples; stress is one
  highlighted 10,000-line TypeScript block; medium, large, and pathological
  claims are excluded
- budgets: native must expose all 10,000 lines; CodeMirror must stay below 500
  block descendants, 100 mounted line elements, and 64,000 mounted text units;
  shared latency budgets are frozen above
- React/runtime primitives: unchanged; only the selected code-block element
  renderer differs
- interaction metrics: navigation-to-queryable, trusted end-type-to-paint, and
  highlight settle at p50/p75/p95/max; 15 samples cannot justify p99
- trace/CWV proof: browser event-to-paint proxy and DOM/heap tags; a full page
  CWV trace is out of scope because this is a warmed local editor comparison
- memory tags: heap, block descendants, whole-document elements, mounted lines,
  native text hosts, highlighted nodes, and external-text counters
- degradation contract: native keeps browser DOM behavior; CodeMirror is an
  explicit stress-mode adapter with model-backed selection/input, bounded
  viewport DOM, CodeMirror search, canonical copy/print, IME, undo, and remote
  update proof; browser page Find cannot inspect unmounted lines
- dashboard/RUM gap: no production claim or release in scope; local results must
  not be presented as field data
- plan delta: paired source/model hashes, structural caps, behavior tests, and
  an explicit development-host caveat are mandatory

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Registry generated; paired preflight passes on fresh host with stable source hashes and exact shared model SHA in `comparison-signature.receipt.json` | lane 4 |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - main has no matched huge strategy pair | Main supplies the requested default content only; it cannot answer the current native-versus-CodeMirror comparison. | lane 3 |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - both routes use the same Plite and Plate stack | Only the code-block element projection changes, so a raw layer comparison would not isolate another owner. | lane 4 |
| 4 | owner-microbench-and-trace | yes | complete | Final receipt records native 30,011 block descendants and 10,000 lines versus CodeMirror 153 descendants and 37 mounted lines | lane 5 |
| 5 | product-mount-matrix | yes | complete | 15 interleaved samples: native navigation p95 1682.07 ms; CodeMirror 1232.04 ms | lane 6 |
| 6 | trusted-editing-matrix | yes | complete | 15 samples: native input/highlight p95 510.2/520 ms; CodeMirror 31/48 ms; focused behavior suite and 5/5 stability pass | lane 7 |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate is not a requested strategy | Both requested variants share current Plite; Slate cannot attribute their renderer delta. | lane 8 |
| 8 | example-breadth | yes | complete | Browser proves default 3-block content, native 10k DOM, and bounded CodeMirror routes with zero console errors | lane 9 |
| 9 | large-and-stress | yes | complete | Both strategies pass exact model SHA `2c4ba3ddc3f5ef0e46e46649bee509d3a4ac071ebfb0c41db871601067298766`; receipt retains all 15 samples | closeout |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: N/A: comparison only; no product fix cycle
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: N/A: comparison only; final source-stable run recorded
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: comparison only; final behavior suite recorded
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| none | N/A: strategy comparison did not diagnose a product defect | N/A: no fix decision | N/A: no fix class | N/A: no long-term fix target | N/A: benchmark comparison only | N/A: no architecture fix | N/A: no compatibility change | N/A: no fix owner | N/A: matched strategy result, not a causal repair | N/A: no pre-fix state | N/A: no fix benchmark | N/A: no fix result | N/A: no fix correctness command | N/A: no post-fix state | Final source-stable receipt and behavior proof complete the requested comparison. |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| demo-split | source-and-host-readiness | Separate default, native-huge, and CodeMirror-huge routes around one fixture | model SHA equal on both huge routes | registry, route, and default-content guards pass | keep | paired measurement |
| paired-final | owner, mount, editing, breadth, stress | Bounded CodeMirror projection should reduce repeated DOM/token work | CodeMirror wins all p95 timings; 153 vs 30,011 descendants | 4/4 focused tests and 5/5 retry-free editing/IME per huge mode pass | keep | closeout |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| navigation-to-queryable | 15 per mode | native 1378.81/1512.24/1682.07/N/A/1682.07 ms | CodeMirror 940.49/964.01/1232.04/N/A/1232.04 ms | p95 -450.03 ms / -26.75% | material by frozen threshold; AB/BA interleaved | `code-block-variants-product.receipt.json` |
| trusted end-type-to-paint | 15 per mode | native 414.9/464/510.2/N/A/510.2 ms | CodeMirror 23.3/25.3/31/N/A/31 ms | p95 -479.2 ms / -93.92% | material; native fails 200 ms budget | `code-block-variants-product.receipt.json` |
| highlight settle | 15 per mode | native 442.2/485.8/520/N/A/520 ms | CodeMirror 39.9/42.4/48/N/A/48 ms | p95 -472 ms / -90.77% | material; both pass 600 ms budget | `code-block-variants-product.receipt.json` |
| block descendants | 15 per mode | native 30011/30011/30011/N/A/30011 | CodeMirror 153/153/153/N/A/153 | -29,858 / -99.49% | deterministic structural work | `code-block-variants-product.receipt.json` |
| mounted physical lines | 15 per mode | native 10000/10000/10000/N/A/10000 | CodeMirror 37/37/37/N/A/37 | -9,963 / -99.63% | deterministic viewport projection | `code-block-variants-product.receipt.json` |
| JS heap | 15 per mode | native 152.34/152.69/183.52/N/A/183.52 MB | CodeMirror 157.16/157.45/159.98/N/A/159.98 MB | p50 +4.82 MB / +3.16%; p95 -23.54 MB / -12.83% | GC-sensitive; structural and latency rows carry more confidence | `code-block-variants-product.receipt.json` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | Validity passes with 15 samples per mode; native input alone fails its frozen budget. |
| Benchmark plan structural validation | yes | Run the plan validator at cause/resume checkpoints | Non-complete validation passed before measurement; complete validation is the final gate below. |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | All six applicable lanes are complete; three comparison lanes are inapplicable with reasons. |
| Exact post-fix benchmark reruns | no | Rerun every kept product fix against its original lane/baseline | N/A: no product fix was made; the exact benchmark reran after final test changes. |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | 4/4 focused Chromium tests and 10/10 retry-free stability runs pass. |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | Receipt records commit, per-file hashes, aggregate SHA `933a5e35e34c2d5797e9696c1b4b58458d840416e72268a5ebe7a9a30ed08447`, host start, browser, and machine. |
| Benchmark target/metric honesty | yes | Verify source identity, fixture parity, sample math, aggregation, and artifact provenance | Source-stable exact model SHA, 3 warmups, 15 samples, AB/BA order, raw samples, p50/p75/p95/max, and no p99. |
| Durable fix decision | no | Validate every proven cause and fix target | N/A: this packet compares shipped strategies and makes no runtime repair. |
| Package/type/build proof | yes | Run affected source, registry, TypeScript, and build checks | Registry build, docs/source parity, registry/source parity, both direct TypeScript projects, and production compilation pass; unrelated `/dev/editor-perf` prerender blocks full build completion. |
| Browser surface proof | yes | Run Browser for all three routes | Browser proves all three routes and zero console errors; Chrome/Computer are inapplicable. |
| Changeset/release artifact | no | Add only for published package behavior/API changes | N/A: examples, docs, tests, and benchmark artifacts only. |
| Agent rule/skill sync | no | Run sync only when agent sources changed | N/A: no agent source changed. |
| Benchmark plan complete validation | yes | Run validator with `--complete` | Pass: `Benchmark plan: complete.` |
| Final lint | yes | Run scoped formatter/linter | Ultracite and runner syntax check pass on every task-owned code file. |
| Timed checkpoint | no | Satisfy requested duration | N/A: no duration requested. |
| P1 autoreview | no | Run dirty local P1 review unless forbidden | N/A: current branch is `next`; repo law forbids autoreview. |
| Goal plan complete | yes | Run the Autogoal completion checker | Pass: `[autogoal] complete`. |
| Browser interaction proof | yes | Exercise all three routes and both huge interaction paths | Browser route proof plus trusted Playwright typing, undo/redo, paste/cut, IME, remote update, search, print, and read-only checks pass. |
| Browser console/network check | yes | Record console/network state | Browser logs and every benchmark sample report zero console, page, and network errors. |
| Browser final proof artifact | yes | Record route/model/DOM proof | Comparison and product receipts retain model, DOM, line, heap, timing, source, and environment evidence. |
| Exact case replay | no | Prove report-backed behavior when applicable | N/A: new benchmark comparison, not a reporter-backed fix. |
| Final ref and fingerprints | yes | Record final ref and task-owned fingerprints | Commit and per-file SHA-256 map are embedded in the final source-stable receipt. |
| Clean final runtime | no | Require immutable pushed-ref proof for a public fixed claim | N/A: local uncommitted candidate; no push or public fixed/completed claim. |
| Retry-free stability | yes | Record 5/5 warm runs for native focus/IME behavior | Both huge editing/IME cases pass 5/5 with retries disabled. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | paired readiness receipt passes | ordered measurement |
| Ordered diagnosis | complete | full paired run is valid and source-stable | correctness breadth |
| Fix and exact rerun | complete | no product fix; exact measurement reran after harness/test repairs | remaining breadth |
| Remaining breadth | complete | registry, type, Browser, and retry-free behavior proof pass | closeout |
| Review and closeout | complete | benchmark validator and Autogoal checker pass; branch is `next`, so autoreview is forbidden | final response |

Findings:
- `origin/main` default content has three small JavaScript/Python/CSS examples
  represented as code-line nodes. Current schema stores multiline code in one
  text child, so the default demo will preserve the content while using the
  current canonical model.
- Current `code-block-demo` incorrectly combines the default examples, the
  10,000-line fixture, and the CodeMirror renderer. That prevents a fair native
  versus CodeMirror route comparison and makes the default demo pathological.
- The existing huge fixture is 10,000 deterministic TypeScript lines. It can be
  moved unchanged into one shared value imported by both huge demos.
- Existing CodeMirror browser and product runners target the combined route and
  hard-code block index 8. They must target the dedicated CodeMirror route and
  gain an equivalent native lane rather than being copied into two unrelated
  harnesses.
- The final matched run is not close: CodeMirror cuts navigation p95 by 26.75%,
  trusted input-to-paint p95 by 93.92%, and highlight-settle p95 by 90.77%.
- Native mounts 30,011 block descendants and all 10,000 physical lines;
  CodeMirror mounts 153 descendants and 37 lines. That repeated DOM/token work
  explains the direction and size of the interaction gap without claiming a
  newly discovered product defect.
- Native misses the 200 ms input budget at 510.2 ms p95. CodeMirror passes all
  three budgets. Heap is not a clean win: CodeMirror's p50 is 4.82 MB higher,
  while native has higher GC-sensitive p95 spikes.

Decisions and tradeoffs:
- Keep three explicit example files, not a mode switch in one route. Separate
  URLs make navigation timing and visual intent honest.
- Share the huge value source. Duplication would allow fixture drift and void
  the comparison.
- Preserve the main demo's human content, not its obsolete code-line model.
- Keep production runtime untouched unless the matched benchmark uncovers a
  correctness defect; this task measures the two intended strategies.
- Keep native Plate as the normal/default renderer. Use CodeMirror explicitly
  for the stress cohort; it trades browser page Find and native DOM traversal
  for bounded DOM while preserving the tested model, input, history, IME,
  remote-update, search, copy, print, and read-only behavior.
- Do not add automatic size switching or combine this block adapter with the
  editor's whole-document virtualized mode.

Harness/methodology repairs:
- The first paired runner treated CodeMirror's line-element `textContent` as
  newline-preserving. CodeMirror stores newlines between `.cm-line` elements,
  so the oracle verifies the exact final line plus its final highlighted
  `const` token. The model hash and line count remain unchanged.
- Native read-only intentionally retains `contenteditable=true` for browser
  selection and declares `aria-readonly` plus `data-readonly`; the test now
  verifies that contract instead of imposing CodeMirror's inner-input shape.
- The native read-only proof focuses the editor directly because the sticky
  toolbar correctly intercepted a click after scrolling the 10,000-line block.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| WWW typecheck stopped on a stale API-reference manifest before task-owned TypeScript | 1 | run focused generated-source and TypeScript checks after the demo work | unrelated manifest left untouched; both direct TypeScript projects and source-parity checks pass |
| Production build exhausted the default 4 GB Node heap | 1 | retry the same build once with an 8 GB heap | compilation passed on retry |
| Production build failed while prerendering unrelated `/dev/editor-perf` | 1 | use a fresh warmed development host and label the receipt | benchmark host is explicitly `development-turbopack` |
| `dev:plite` received a stray argument separator | 1 | pass `--port 3100` directly through pnpm | fresh host started successfully |
| CodeMirror readiness timed out on a newline-preserving DOM oracle | 2 | inspect the final rendered line and repair the oracle | paired readiness passes with unchanged model/hash guards |
| Native read-only test expected `contenteditable=false` | 1 | assert the native read-only owner attributes and immutable model | corrected test passes |
| Sticky toolbar intercepted a far native code click | 1 | focus the read-only editor directly before trusted input | corrected test and 5/5 stability pass |
| Full WWW compiler exhausted 4 GB while another compiler ran | 1 | rerun the compiler alone with an 8 GB heap | direct WWW TypeScript project passes |

Verification evidence:
- `pnpm --filter www build:registry`: pass; four relevant generated registry
  payloads updated.
- Direct WWW and package-integration TypeScript projects: pass with the WWW
  compiler given an 8 GB heap.
- Docs/source parity and registry/source parity: pass.
- Task-owned Ultracite formatting/lint plus benchmark runner syntax: pass.
- Focused Chromium suite: 4/4 pass. Editing/IME stability: 10/10 total,
  comprising 5/5 per huge strategy with retries disabled.
- Browser: all three routes match their intended renderer/content and expose no
  console errors.
- Benchmark: 3 warmups plus 15 measured samples per mode; validity pass, source
  stable, no censored attempt, native input budget fail reported honestly.
- Final fingerprint replay: all 23 recorded runner/source inputs match aggregate
  SHA `933a5e35e34c2d5797e9696c1b4b58458d840416e72268a5ebe7a9a30ed08447`.
- Production build: compilation passes with an 8 GB heap; full build remains
  blocked by the unrelated `/dev/editor-perf` unknown `heading` element during
  static prerender.

Final handoff contract:
- goal plan / scope: three code-block demos plus matched native/CodeMirror 10k
  product comparison; no editor runtime or `editor-ai` changes
- candidate / baseline identities: CodeMirror candidate and native baseline on
  commit `a6afd55c30e97c74fe895d1ad005ca75413110f3`, aggregate measured source SHA
  `933a5e35e34c2d5797e9696c1b4b58458d840416e72268a5ebe7a9a30ed08447`
- completed / N/A / remaining lanes: six applicable lanes complete; current-vs-main,
  Plate-vs-Plite, and Slate comparison lanes are inapplicable; none remain
- first conclusive cause: N/A; this was a matched renderer-strategy comparison,
  not a product-defect diagnosis
- baseline / latest / best metrics: native baseline 1682.07/510.2/520 ms p95;
  CodeMirror best 1232.04/31/48 ms for navigation/input/highlight
- fix owner / changed files: no runtime fix; registry demos, shared value, docs,
  tests, generated registry, runner, receipts, and this plan only
- exact benchmark and correctness reruns: final source-stable 15-sample run,
  4/4 focused suite, and 5/5 editing/IME stability per huge mode
- resumed breadth: default/native/CodeMirror Browser routes, generated registry,
  direct TypeScript, parity, formatting, and syntax proof complete
- packet decisions: keep the three-demo split and paired runner; retain
  CodeMirror as the explicit stress renderer
- harness/methodology repairs: CodeMirror line DOM, native read-only attributes,
  far-block focus, and host/build labeling corrected before final evidence
- residual claim limits / next owner: results are warmed development-host lab
  data, not production or RUM; `/dev/editor-perf` owns the unrelated production
  prerender failure

Timeline:
- 2026-09-04T13:27:25.360Z Benchmark goal plan created.
- 2026-09-04T13:46:54Z Fresh Turbopack comparison host started.
- 2026-09-04T13:50Z Paired source/model/host readiness passed.
- 2026-09-04T14:00Z Focused behavior and 5/5-per-mode stability passed.
- 2026-09-04T14:05Z Final source-stable paired benchmark and repository checks completed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Final validation and handoff |
| Where am I going? | Benchmark validator, Autogoal checker, final response |
| What is the goal? | Ship three honest demos and a matched native-versus-CodeMirror 10k benchmark |
| What have I learned? | CodeMirror's bounded DOM is decisively faster for one highlighted 10k-line block; native remains the honest normal-path default. |
| What have I done? | Split three demos, shared one fixture, generated registry output, repaired tests/runner, benchmarked 15 paired samples, and closed behavior/browser/type proof. |

Open risks:
- The benchmark is warmed development-mode because an unrelated route blocks
  production prerender. Treat absolute navigation timings as local lab data;
  the large structural and interaction deltas are still matched and material.
- CodeMirror's p50 JS heap is 4.82 MB higher and browser page Find cannot inspect
  unmounted lines. Those are real costs, which is why it stays explicit.
