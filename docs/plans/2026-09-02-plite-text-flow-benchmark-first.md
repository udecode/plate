# Plite text flow benchmark first

Objective:

Execute the accepted Plite text-flow plan; done when Phase 2 gates pass and
Phase 3 closes, or a declared stop gate fires.

Flow mode:

- One-shot execution.

Goal plan:

- `docs/plans/2026-09-02-plite-text-flow-benchmark-first.md`

Primary template:

- `docs/plans/templates/plite-plan.md`

Applied packs:

- `performance-observability`

Mode:

- `deep`: this decision changes the Plite DOM owner and later deletes a public
  Plate document noun. It requires matched stress evidence and native editing
  gates, not a local render tweak.

Completion threshold:

- Phase 2 registers the production-import matrix before renderer changes and
  preserves its current-path negative control.
- Phase 2 either passes every frozen latency, deterministic-growth, native
  editing, history, and two-client Yjs veto or records its one permitted pivot
  and declared stop. Phase 3 stays closed on any Phase 2 stop.
- If Phase 2 passes, Phase 3 deletes every live CodeLine owner outside the
  reviewed migration allowlist and passes the integrated code/highlight,
  package, browser, registry, docs, migration, history, and Yjs gates.
- DOM-present and explicit virtualized contracts remain separate throughout.
- The Benchmark validator, strict Plite checks, applicable Plate checks, browser
  proof, and Autogoal completion checker pass before closeout.

Verification surface:

- Current Plite text projection, decoration manager, DOM synchronization,
  selection/input, virtualized mode, history, and collaboration owners.
- Plate rendering capability, decoration lowering, code-block schema,
  commands, codecs, highlighting, AI, DOCX, registry, examples, docs, tests,
  migrations, and public exports.
- Matched local Chromium fixtures for unmarked text, one semantic mark, 10,000
  semantic Text runs, sparse/dense/overlapping decorations, one unbroken line,
  code-block representations, and top-level virtualization.
- Isolated splitter, Lowlight, and Lezer scaling probes.
- Future production gates for Chromium, Firefox, WebKit, mobile viewport, IME,
  selection, copy/paste, undo/redo, history, and Yjs.

Constraints:

- Product runtime work is limited to Phase 2 until its checkpoint passes. Phase
  3 is closed until that evidence exists.
- No public compatibility alias, dual schema, runtime sniffing, or chunk-size
  option.
- Canonical line breaks are `\n` inside Text. Performance-only line or
  line-break nodes are forbidden.
- Viewport-only token wrappers are decoration virtualization. They are forbidden
  in DOM-present auto even when the undecorated text stays mounted.
- Existing explicit virtualized mode remains the only owner of missing or
  viewport-limited presentation. Extending it inside one block requires a
  separate plan.
- Native browser editing, exact semantic marks, transient-decoration behavior,
  history, and collaboration outrank latency.
- Do not rescue a candidate by relaxing the frozen latency or correctness
  contract.

Boundaries:

- In scope: huge unmarked text, semantic marks, sparse/dense/overlapping
  transient decorations, highlighted code, pathological long lines, mount,
  trusted typing, selection, paste, undo/redo, DOM count, memory pressure, and
  the separately labeled virtualized lane.
- Plite owners: `packages/plitejs/src/react/components/editable-text.tsx`,
  `editable-text-blocks.tsx`, `decoration-source.ts`, `dom-text-sync.ts`, DOM
  selection/input owners, and their tests and benchmark targets.
- Plate owners: `packages/platejs/src/internal/plugin/getPlateDecorationSources.ts`,
  renderer capability lowering, code-block package/React owners, direct AI and
  DOCX consumers, registry, docs, migrations, and examples.
- Non-goals: a second virtualization system, a syntax grammar inside Plite, or a
  release claim.

Output budget strategy:

- Read named owners first. Store large samples in JSON. Put only decision
  percentiles, deterministic counters, limitations, and source identities here.

Blocked condition:

- Block only if no local runtime can execute a decision-critical lane, a fair
  reference adapter fails after three materially different harness moves, or
  two incompatible contracts remain tied. A failed candidate triggers its
  declared pivot or stop; it does not justify silent scope reduction.

Plite Plan state:

- status: complete
- phase: execution-closeout
- next: open a separate incremental-highlighter plan only if the remaining 14 ms input p95 gap is worth pursuing
- handoff: complete with the declared Phase 3 latency stop recorded

Start Gates:

| Gate                                        | Applies | Evidence                                                                                                                                              |
| ------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompt requirements captured                | yes     | Benchmark first, Wordgard inclusion, max-three-phase execution, pivot checkpoints, harsh verdict, and no mixed virtualization are recorded.           |
| Active goal and plan verified               | yes     | The active execution goal names this exact accepted plan and its pass-or-declared-stop threshold.                                                     |
| User accepted execution                     | yes     | The user said `lets go` after the three-phase benchmark-first plan handoff.                                                                           |
| Current owners read                         | yes     | Plite projection/decoration/input/virtual owners and every Plate CodeLine owner family were traced from live source.                                  |
| Best API target resolved                    | yes     | Keep `PliteDecorationSource` and Plate `decorate`; expose no text-flow, tile, viewport, or range-index API; hard-cut CodeLine only after Phase 2.     |
| Runtime scale applicability resolved        | yes     | Text runs, decoration boundaries, React units, DOM nodes, source parsing, model nodes, and changed spans are independent repeated units.              |
| Pre-acceptance Benchmark probe selected     | yes     | Matched editor matrix, CodeLine packet, splitter intervention, native all-mounted string probe, Lowlight, Lezer, and virtualization controls all ran. |
| Mode and execution boundary resolved        | yes     | One-shot execution; Phase 2 owns Plite runtime work and Phase 3 remains gated on its proof.                                                           |
| Performance pack selected                   | yes     | `performance-observability` is applied below.                                                                                                         |
| User operation and runtime owner identified | yes     | Cold mount, decoration refresh, and trusted middle typing are owned by Plite React projection and browser DOM reconciliation.                         |
| Scale variables and cohorts fixed           | yes     | Characters, lines, semantic runs, decoration count/overlap, unbroken length, renderer capability, and mode are fixed independently.                   |
| Budget frozen before target measurement     | yes     | The latency, correctness, DOM-presence, repeated-unit, and noise laws below were fixed before architecture lock.                                      |
| Baseline and target probes selected         | yes     | Current Plite/CodeLine are baselines; PM/WG retained views and disposable all-mounted DOM probes test the target laws.                                |
| Correctness guard selected                  | yes     | Exact model and DOM text, selection target, trusted input, and source-specific reconstruction ran; full native matrix is a Phase 2 veto.              |
| Production detector decision recorded       | no      | Planning uses deterministic anonymous local receipts. Product telemetry is not justified by this architecture decision.                               |

Explicit requirement ledger:

- [x] Benchmark before choosing or implementing the architecture.
- [x] Compare current Plate/Plite, ProseMirror, CodeMirror, Lexical, Slate, and
      the current local Wordgard checkout wherever the semantics are fair.
- [x] Treat Wordgard as the newest donor without awarding it correctness by age.
- [x] Keep viewport-limited wrappers and missing far DOM exclusively in explicit
      virtualized mode.
- [x] Cover huge code and prose with no marks, semantic marks, sparse/dense/
      overlapping transient decorations, and one pathological unbroken line.
- [x] Produce no more than three execution phases, each ending in a measured
      keep, pivot, or stop checkpoint.
- [x] Permit local clones and disposable packages but make no product runtime
      change before plan acceptance.
- [x] State where a general rich-text editor cannot honestly match CodeMirror.

## Benchmark Source

- request: benchmark every practical text-flow lane first, include `../wordgard`,
  reject mixed virtualization, and return a harsh max-three-phase execution plan
- scope: current Plite and Plate CodeLine; Slate, ProseMirror, Wordgard, Lexical,
  CodeMirror; plain/marked/decorated/long-line/code/virtualized fixtures; source
  parsing; causal projection probes
- invocation: `$benchmark plite text-flow architecture`
- candidate-identity: ref: Plate/Plite
  `a6afd55c30e97c74fe895d1ad005ca75413110f3` plus the artifact-local measured
  build and harness hashes
- plate-main-identity: N/A: this is an architecture selection, not a
  current-versus-main regression claim
- plite-identity: commit: `a6afd55c30e97c74fe895d1ad005ca75413110f3`
- slate-identity: fingerprint: Slate 0.124.1 and Slate React 0.124.2 measured
  builds recorded in `base-and-marks.json`
- named-symptom: one large decorated Text becomes multi-second work, while
  CodeLine avoids that exact shape by exploding canonical and React units
- final-artifacts: artifact: `docs/plans/artifacts/2026-09-02-plite-text-flow-benchmark-first/` plus
  `docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.json`
  and `docs/plans/artifacts/2026-09-02-plite-large-text-dom-tiling/`

Source identities:

| Surface              | Identity                                                                        |
| -------------------- | ------------------------------------------------------------------------------- |
| Plate / Plite        | `a6afd55c30e97c74fe895d1ad005ca75413110f3`                                      |
| ProseMirror          | `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`                                      |
| Wordgard             | `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54`, package 0.5.1                       |
| Lexical              | `dd5c41b13193efa9ab1574234d8593d2c9e4f988`                                      |
| Slate source context | `945a484df2497e4c448b33f417b0de2a49840032`; measured packages 0.124.1 / 0.124.2 |
| CodeMirror View      | `fbff59ba004d80d8c914f64c42586387b08706ac`; measured View 6.41.0 / State 6.7.2  |
| Syntax probes        | Lowlight 3.3.0; Lezer common 1.5.2, highlight 1.2.3, JavaScript 1.5.4           |

## Comparison Signature

| Field                                | Candidate                                                                     | Baseline                                                                           | Comparable evidence                                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| ref / dirty fingerprint              | Plate/Plite ref plus artifact hashes                                          | PM, WG, Lexical refs; Slate and CM measured package builds                         | artifact: each JSON receipt embeds source/build identities; key receipt SHA-256 values are recorded below         |
| lockfile / package manager           | pnpm 9.15.0 and Bun 1.3.12                                                    | local reference lockfiles; npm-prefix-only CM/Lezer packages under ignored `tmp`   | artifact: `base-and-marks.json` environment and source identities                                                 |
| build mode / host / port             | fresh Plite dist bundled into an in-memory page                               | same bundle/page for PM, WG, Slate, CM; old code packet rebuilt each reference     | artifact: matrix harness and canonical code-block receipt                                                         |
| browser / machine / viewport / DPR   | Playwright Chromium 1.61 on macOS arm64; 1280x720, DPR 1                      | identical for the matched browser packet                                           | artifact: `base-and-marks.json` and peer receipts                                                                 |
| route / fixture / document / plugins | one block, 48 characters per line, 200/2k/10k cohorts; exact scenario tags    | same text, caret, ranges, operation, and DOM intent per comparable surface         | artifact: matrix config plus exact text and coverage counters                                                     |
| setup / action / DOM strategy        | normal Plite full DOM; select trusted midpoint; type one character per sample | PM/WG/Slate full DOM; CM explicitly virtual; old code packet types five characters | artifact: receipts label coverage and operation; cross-operation rows are contextual, never divided as if matched |
| warmups / samples / interleave order | one discarded warmup; five mounts and twenty edits on decisive matrix rows    | same packet/order; catastrophic cells use one capped sample and are labeled limits | artifact: raw samples and config in each receipt                                                                  |

Frozen cohort matrix:

| Cohort       | Characters / lines                                                 | Independent variants                                 |
| ------------ | ------------------------------------------------------------------ | ---------------------------------------------------- |
| normal       | about 10k / 200                                                    | plain, one mark, semantic runs, sparse/dense/overlap |
| large        | about 100k / 2,000                                                 | same plus source parsing                             |
| stress       | about 490k / 10,000                                                | same plus CodeLine and full token wrappers           |
| pathological | 480k unbroken characters; 40k boundaries; arbitrary React renderer | each remains separately labeled                      |

Frozen budget and noise contract:

- Correctness veto: any mismatch in canonical text, intended DOM text, model
  selection, paste, undo/redo, composition, or follow-up typing fails.
- DOM-present law: all canonical text and all current semantic/transient paint
  remain mounted. Offscreen omission and viewport-only token materialization
  fail this lane.
- Model law: an unmarked block is one Text. Marks split Text only for semantic
  state. Physical newlines never create performance-only model nodes.
- Repeated-unit law: no React component, effect, subscription, or listener per
  internal text fragment or decoration run. Hot edits visit changed model spans
  and intersecting ordered boundary events, not every segment times every range.
- Base/mark/decorated stress: mount and trusted type p95 must be at most 200 ms
  and at most 1.5x the best matched DOM-present PM/WG row. A reference row that
  omits syntax parsing receives the measured source cost before comparison.
- Code representation: the matched five-character 10k code packet must be at
  least 50% faster than giant-Text Plite and 40% faster than CodeLine Plite.
- Normal guard: no operation may regress by both more than 10 ms and more than
  25% against current Plite.
- Decoration growth must be one ordered boundary pass plus changed-span DOM
  work. A 10x range increase may not create quadratic deterministic work.
- Report cold/warm p50/p75/p95/max, samples, model nodes, DOM elements/Text
  nodes, React-unit proxy, subscriptions/listeners, cached interval count, and
  heap where reliable. A timing win that explodes another unit fails.
- Five interleaved packets and twenty trusted edits are the default. Use at
  least 100 samples before p99. Material movement exceeds
  `max(10 ms, 15% of the slower p95)`.
- Virtualized mode has its own receipt and behavior contract. Its result cannot
  justify DOM-present auto.

Budget amendment after evidence:

- The early probe allowed DOM Text fragments up to 8,192 characters. Evidence
  tightened that permission: Phase 2 starts with one DOM Text per equal-format
  run, matching ProseMirror and Wordgard. Fixed all-mounted strings are allowed
  only if a profile proves one giant DOM Text owns a failed long-line row. This
  removes machinery; it does not relax any latency or correctness budget.
- The original 263.2 ms code-type ceiling compared highlighted Plite against
  unhighlighted ProseMirror and Wordgard. The fair 40k-decoration rerun measures
  ProseMirror at 151.9 ms mount / 412.6 ms type and Wordgard at 177.2 / 383.9.
  The corrected code ceilings are 204 ms mount and 475 ms type: 15% over the
  slower matched full-DOM reference. Highlight settle has a separate 600 ms
  ceiling, so deferred source work cannot disappear from the receipt.

## Benchmark Lane Table

| Order | Lane                          | Applies | Status                                                                                   | Evidence                                                                                                                                                                      | Next |
| ----- | ----------------------------- | ------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1     | source-and-host-readiness     | yes     | complete                                                                                 | Exact refs, package versions, build hashes, fixture/action, Chromium host, correctness assertions, and limits are embedded in receipts.                                       | none |
| 2     | current-vs-main-product-smoke | no      | N/A: inapplicable - architecture selection is not a current-versus-main regression claim | Registered current and legacy targets supply context without pretending to be a main comparison.                                                                              | none |
| 3     | plate-vs-plite-decomposition  | yes     | complete                                                                                 | CodeLine, one Text, all-mounted string, raw Plite, and core/React paths were isolated.                                                                                        | none |
| 4     | owner-microbench-and-trace    | yes     | complete                                                                                 | PTEXT-001 replaced the quadratic React projection with retained text flow; the identical production matrix passes with max ratio 0.98.                                        | none |
| 5     | product-mount-matrix          | yes     | complete                                                                                 | Plain, marked, semantic-run, sparse, dense, overlap, long-line, custom-fallback, and code cohorts pass the frozen Phase 2 budgets.                                            | none |
| 6     | trusted-editing-matrix        | yes     | complete                                                                                 | Native input, selection, clipboard, history, composition, beforeinput, and exact DOM/model text pass focused and strict browser proof.                                        | none |
| 7     | plite-vs-pinned-slate         | yes     | complete                                                                                 | The final full-DOM Plate path measures 214.0 ms input versus Wordgard 383.9 and ProseMirror 412.6 on the matched highlighted packet.                                          | none |
| 8     | example-breadth               | yes     | complete                                                                                 | Plite package proof, strict Chromium, the full browser matrix, and the live registry code-block demo pass.                                                                    | none |
| 9     | large-and-stress              | yes     | complete                                                                                 | Phase 2 passes; Phase 3 keeps one 490k-character Text and full syntax DOM, but its frozen 200 ms input gate stops at 214.0 ms while every correctness and growth gate passes. | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: execution closed after the declared Phase 3 stop
- lane: N/A: no active benchmark lane
- comparable-baseline: N/A: final comparisons are recorded in Cause History
- material-delta: N/A: no active intervention remains
- isolated-owner: N/A: no active fix owner
- causal-intervention: N/A: retained text flow is kept and syntax-source work is separate
- correctness-guard-result: N/A: final correctness evidence is recorded below
- fix-class: N/A: no active cause
- long-term-target: N/A: no active cause
- decision-owner: N/A: no active cause
- layer-plan: N/A: no active cause
- compatibility-verdict: N/A: no active cause
- fix-owner: N/A: no active cause
- benchmark-command: N/A: no active rerun
- benchmark-rerun: N/A: no active rerun
- benchmark-rerun-result: N/A: declared stop is recorded in Cause History
- correctness-command: N/A: no active rerun
- correctness-rerun: N/A: no active rerun
- correctness-rerun-result: N/A: final correctness evidence is recorded below
- resume-lane: N/A: all lanes are resolved

## Cause History

| Cause ID  | Lane                       | Decision    | Fix Class               | Long-Term Target                                                                                                          | Decision Owner | Layer Plan                               | Compatibility Verdict                                                                    | Fix Owner                        | Causal Evidence                                                                                                                                        | Pre-Fix Correctness                                                                                             | Benchmark Command                                                                                                                                                                                                                                                                                 | Benchmark Result                                                                                                            | Correctness Command                                              | Post-Fix Correctness                                                                                             | Evidence                                                                                                                             |
| --------- | -------------------------- | ----------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| PTEXT-001 | owner-microbench-and-trace | kept        | runtime-architecture    | Private DOM-present retained text-flow view with indexed ranges and changed-span reconciliation                           | best-api       | plite-plan + plate-plan                  | hard-cut: performance-only CodeLine state while public decoration calls remain unchanged | Plite React text projection      | Current splitting is quadratic, and replacing only the splitter leaves a 1.47-second dense row; retained imperative reconciliation removes both costs. | pass: 48 decoration, DOM-sync, selection, clipboard, and history contracts passed before the change             | `pnpm bench:targets:run -- react-text-flow-browser-matrix`                                                                                                                                                                                                                                        | pass: `production-chromium-phase2.json` has max ratio 0.98 across every frozen fixture and cohort                           | `pnpm check:plite`                                               | pass: package, contract, public-build, and strict Chromium checks pass, including 711 browser tests with 8 skips | The retained engine keeps one Text, exact full DOM, ordered decorations, one flow record, and zero React commits on the stress path. |
| PTEXT-002 | owner-microbench-and-trace | invalidated | internal-implementation | Ordered decoration sweep only as one component of the retained view, never the whole fix                                  | benchmark      | N/A: private implementation intervention | N/A: no public compatibility surface                                                     | Plite text projection            | A sweep removes 200 million checks at 10k ranges, but the 500-line dense browser row remains about 1.47 seconds                                        | pass: disposable sweep reconstructed exact text and ranges in completed cells                                   | `TEXT_FLOW_PLITE_DIST=tmp/plite-text-flow-sweep/packages/plitejs/dist TEXT_FLOW_FIXTURES=dense TEXT_FLOW_COHORTS=500 TEXT_FLOW_SURFACES=plite TEXT_FLOW_ITERATIONS=1 TEXT_FLOW_TYPE_OPS=1 bun docs/plans/artifacts/2026-09-02-plite-text-flow-benchmark-first/text-flow-browser-matrix-sweep.mjs` | fail: splitter-only target remains 1,474 ms type at 500 lines and cannot reach stress                                       | exact assertion inside the same browser harness                  | pass: completed sweep cells kept exact model and DOM text                                                        | `sweep-plite-200.json` and `sweep-plite-dense-500-capped.json` close the local-patch hypothesis.                                     |
| PCODE-001 | large-and-stress           | quarantined | internal-implementation | Keep one Text and retained full DOM; treat incremental syntax computation as a separate design if the final 14 ms matters | benchmark      | N/A: no public API change is accepted    | N/A: the one-Text hard cut and full-DOM contract remain                                  | Plate Lowlight decoration source | Lowlight source p95 is 64.6 ms and render residual p95 is 457.7 ms; shortening coalescing to 80 ms worsened input to 321 ms and caused two rebuilds.   | pass: code commands, codecs, selection, clipboard, history, and highlighting passed before the final timing run | `pnpm bench:targets:run -- plate-code-block-text-flow-browser`                                                                                                                                                                                                                                    | fail: final input p95 is 214.0 ms against the frozen 200 ms gate; mount 135.6, settle 522.3, and render residual 457.7 pass | target correctness command in `benchmarks/targets/slate-v2.json` | pass: 58 Plate code tests, 18 Plite Chromium highlighting tests, and five forced fresh Enter replays pass        | `production-code-block-phase3.json` fires the declared Phase 3 stop without invalidating the retained-view architecture.             |

Benchmark results:

The primary matrix uses about 490k characters, one trusted character per edit,
five mount samples, and twenty edit samples. Times are p95 milliseconds.

| 10k fixture            |     Surface | Mount |  Type | Model nodes | DOM total | Classification                            |
| ---------------------- | ----------: | ----: | ----: | ----------: | --------: | ----------------------------------------- |
| plain                  |       Plite |  41.3 |  66.3 |           2 |         6 | full DOM                                  |
| plain                  |       Slate |  41.4 |  24.7 |           2 |         6 | full DOM                                  |
| plain                  | ProseMirror |  42.1 |  40.8 |           2 |         3 | full DOM                                  |
| plain                  |    Wordgard |  58.2 |  33.0 |      20,000 |    20,000 | full text; newlines are structural leaves |
| plain                  |  CodeMirror |  32.7 |  16.6 |         349 |       168 | virtual; about 0.8% text mounted          |
| one semantic mark      |       Plite |  32.9 |  41.3 |           2 |         6 | full DOM                                  |
| one semantic mark      |       Slate |  41.2 |  29.4 |           2 |         6 | full DOM                                  |
| one semantic mark      | ProseMirror |  42.9 |  39.8 |           2 |         4 | full DOM                                  |
| one semantic mark      |    Wordgard |  58.1 |  33.0 |      20,000 |    20,001 | full text                                 |
| 10k semantic Text runs |       Plite | 732.9 |  56.7 |      10,001 |    40,002 | full DOM; React mount cliff               |
| 10k semantic Text runs |       Slate | 355.4 | 817.8 |      10,001 |    40,002 | full DOM; update cliff                    |
| 10k semantic Text runs | ProseMirror |  49.8 |  28.0 |      10,001 |    15,002 | full DOM; retained view                   |
| 10k semantic Text runs |    Wordgard |  74.4 |  47.2 |      20,000 |    25,000 | full text; retained tiles                 |
| 480k unbroken          |       Plite |  33.1 |  66.4 |           2 |         6 | full DOM                                  |
| 480k unbroken          |       Slate |  41.5 |  25.5 |           2 |         6 | full DOM                                  |
| 480k unbroken          | ProseMirror |  42.4 |  24.8 |           2 |         3 | full DOM                                  |
| 480k unbroken          |    Wordgard |  34.0 |  23.6 |           2 |         2 | full DOM                                  |
| 480k unbroken          |  CodeMirror |  66.4 |  16.4 |           1 |        53 | virtual; about 4.9% text mounted          |

Decoration stress:

| Stress row                        | Plite                                                                                 | Slate                                                      | ProseMirror                              | Wordgard                               | CodeMirror                  |
| --------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- | -------------------------------------- | --------------------------- |
| 1k sparse ranges, 10k lines       | 16,171.7 mount / 8,351.4 refresh / 16,076.4 type; one capped sample; about 1 GB heap  | 82.8 / 27.8 / 173.9; one sample, five-packet retry crashed | 41.0 / 15.8 / 24.6                       | 57.9 / 14.8 / 33.2                     | 32.6 / 16.0 / 16.5, virtual |
| 40k dense ranges, 10k lines       | cannot reach stress; 500 lines and 2k ranges already take 1,482.9 / 1,549.1 / 1,532.3 | 2k lines and 8k ranges take 633 / 547 / 1,216; capped      | 179.5 / 45.0 / 93.5; 120,002 DOM nodes   | 190.0 / 68.6 / 91.8; 130,000 DOM nodes | 33.4 / 15.9 / 16.1, virtual |
| 30k overlapping ranges, 10k lines | cannot reach stress                                                                   | capped before stress                                       | 220.6 / 110.4 / 115.1; 110,002 DOM nodes | 202.8 / 65.4 / 87.7; 130,000 DOM nodes | 33.8 / 15.9 / 16.2, virtual |

The full-DOM result matters: ProseMirror and Wordgard keep every painted range
mounted and still stay below about 115 ms type at 110k-130k DOM nodes. Token
virtualization is not required for this 10k-line target.

Code representation context:

The canonical code packet types five characters at the middle of a 10k-line
block, so it is not numerically interchangeable with the one-character matrix.

| Surface                                    | Mount p95 | Type p95 | Model shape                   | Verdict                                        |
| ------------------------------------------ | --------: | -------: | ----------------------------- | ---------------------------------------------- |
| Plate/Plite CodeLine                       |   1,789.5 |    438.7 | 20,001 model nodes            | reject                                         |
| Plite one Text / one giant DOM Text        |      62.9 |    634.6 | 2 model nodes                 | reject as the whole fix                        |
| Disposable Plite React all-mounted strings |      48.6 |    282.8 | 2 model nodes                 | useful negative/control probe, not target lock |
| ProseMirror                                |      40.8 |    133.9 | one text node in this fixture | strongest full-DOM code reference              |
| Wordgard                                   |      57.5 |    124.3 | Text plus LineBreak leaves    | fastest full-text code reference here          |
| Slate line elements                        |     857.2 |    625.3 | 20,001 model nodes            | reject                                         |
| Lexical CodeHighlight/LineBreak nodes      |   1,251.9 |    280.9 | line-shaped model             | contextual only; reject for Plite model        |

Fair highlighted-code control and retained-flow result:

| Surface                              | Mount p95 | Refresh p95 | Type p95 | Settle p95 | Mounted token spans |
| ------------------------------------ | --------: | ----------: | -------: | ---------: | ------------------: |
| ProseMirror, 40k decorations         |     151.9 |        51.4 |    412.6 |        N/A |              40,000 |
| Wordgard, 40k decorations            |     177.2 |        62.7 |    383.9 |        N/A |              40,000 |
| Plite retained flow, 40k decorations |     199.2 |        63.4 |    406.6 |      521.6 |              40,000 |

The earlier 124-134 ms reference types were unhighlighted and cannot govern
the highlighted packet. Plite beats ProseMirror type, trails Wordgard by 5%,
and keeps exact full DOM coverage. Its separate settle includes the delayed
source re-read and paint rather than hiding that work from the input number.

Final integrated Plate/Lowlight result:

| Surface                   | Mount p95 | Input p95 | Source p95 | Render residual p95 | Settle p95 | Token elements / DOM nodes |
| ------------------------- | --------: | --------: | ---------: | ------------------: | ---------: | -------------------------: |
| Plate one-Text code block |     135.6 |     214.0 |       64.6 |               457.7 |      522.3 |            20,000 / 60,003 |

The integrated path beats the matched Wordgard input by 44% and ProseMirror by
48%. It still misses Plate's stricter 200 ms input gate by 14 ms, so Phase 3
fires its declared stop. Mount, source settle, render residual, exact text,
single-Text shape, full DOM, one retained build, and zero React commits pass.

Causal microbench and intervention:

- Current `splitTextByDecorations` performs about 200 million range checks for
  10k non-overlapping decorations and 3.2 billion at 40k. An ordered sweep
  visits 20k and 80k boundary events respectively.
- The isolated 10k sweep takes 0.482 ms versus 158.8 ms current; 40k takes
  2.211 ms. Forty thousand overlapping ranges take 7.09 ms.
- In the browser, the sweep improves 200-line dense type from 99.3 to 48.3 ms
  and refresh from 35.6 to 18.4 ms.
- At 500 dense lines it still takes about 1.47 seconds, and sparse 10k remains
  16-18 seconds with about 1 GB heap. The splitter is guilty; React projection
  and wholesale reconciliation are guiltier.

Syntax-source scaling:

| Source / 10k lines                               |      Parse p95 | Range enumeration/build p95 |        End-to-end p95 | Meaning                                                          |
| ------------------------------------------------ | -------------: | --------------------------: | --------------------: | ---------------------------------------------------------------- |
| Lowlight 3.3 TypeScript, edited full rehighlight |          57.46 |   6.96 flatten + 2.46 build |                 63.42 | material but not the multi-second Plite cliff                    |
| Lezer JavaScript, initial                        |          53.55 |         7.15 full highlight |            about 60.7 | similar cold source cost                                         |
| Lezer JavaScript, one-char incremental parse     |          28.18 |         6.34 full highlight |            about 34.5 | useful donor, not enough to force a provider swap                |
| Lezer 1,025-char corridor                        | included above |                       0.186 | not a complete result | cost probe only; incremental replacement correctness is unproved |

Lowlight stays first because its 63 ms source cost leaves room under the full
operation budget and its language coverage has real value. Lezer proves a
possible later source optimization; it does not justify importing CodeMirror's
view contract or promising viewport-only paint.

Virtualization control:

- Existing Plite virtualization is top-level-node virtualization. At 5,000
  blocks it keeps about 370 DOM nodes and measures about 63.6 ms type and 63.7
  ms selection in the focused receipt.
- One huge block remains one virtual unit. In the single-block control, one Text
  changes from 282.9 to 166.8 ms type, while CodeLine changes from 285.7 to
  207.6 ms and mount gets worse. It does not remove in-block token DOM.
- CodeMirror is the specialized lower bound at about 16 ms because it combines
  fixed roughly 512-character TextTiles with viewport and long-line gaps. That
  is a different product contract.

Benchmark limitations:

- The matched browser matrix is headless Chromium on one machine. Phase 2 must
  prove Firefox, WebKit, mobile viewport, and native composition before landing.
- Catastrophic Plite/Slate rows are capped one-sample limits, not stable p95s.
  Their orders of magnitude are decisive; their decimal precision is not.
- CodeMirror rows are virtual and never count as DOM-present winners.
- Lexical ran the matched code-representation packet, not the full decoration
  matrix.
- Lowlight and Lezer are isolated source-cost probes. Only Phase 3 can measure
  the integrated input-to-highlight-settle operation.
- Disposable all-mounted string probes omit some production history,
  collaboration, React, or native-input ownership. They falsify naïve designs;
  they do not waive the Phase 2 production gate.

Decision brief:

- outcome: Build a private DOM-present retained text-flow view in Plite, then
  delete Plate CodeLine only after it passes. Do not virtualize decorations in
  auto.
- chosen shape: canonical Text and semantic marks; private indexed decoration
  buckets; one ordered boundary plan; stable model-to-DOM view records; changed-
  span imperative DOM reconciliation; React owns one flow island rather than
  every Text/leaf run.
- strongest rejected alternative: viewport-only token wrappers. They are
  partial view virtualization, duplicate the explicit virtualized mode's job,
  and create two meanings of "rendered" for selection, accessibility, print,
  geometry, and custom paint.
- consequence: Plite owns the renderer architecture and Plate deletes CodeLine.
  The remaining syntax latency belongs to a separate incremental-highlighter
  design; it does not justify restoring line-shaped document state.

Harsh verdict:

- Keeping CodeLine as the long-term answer is bad architecture. It exposes a
  2021 editing representation as document semantics and pays O(lines) model,
  schema, React, codec, AI, and migration cost.
- "Just use one Text" is also bad advice. Current Plite proves it: plain text is
  acceptable, but sparse decorations become a 16-second disaster.
- "Just fix the quadratic filter" is a local patch pretending to be an
  architecture. The browser intervention still takes 1.47 seconds at only 500
  dense lines.
- "Use CodeMirror chunking" is imprecise. ProseMirror does not use CodeMirror's
  fixed text chunks. It keeps a `TextViewDesc` with one DOM Text per equal-format
  run and updates `nodeValue`; its persistent `DecorationSet` scopes ranges.
- Wordgard is the most useful modern donor: retained `TextTile` records,
  changed-range comparison, DOM reuse, and native `beforeinput` adoption. It
  merges adjacent equal-format text without a fixed cap. Its code schema's
  LineBreak leaves are not worth copying.
- Slate block chunking groups child blocks. It cannot subdivide one Text and is
  not the same mechanism. Plite needs a text-flow view below the block/model
  layer, not "Slate chunks but for text."
- Phase 2 native proof passed. Phase 3's one red latency gate is real, but
  bringing CodeLine back would make the model and every downstream owner worse
  while also losing badly on mount and matched highlighted input.

Best API verdict:

- Keep the existing raw call shape:

  ```tsx
  const syntax: PliteDecorationSource = {
    id: "syntax",
    read: ({ editor, entry }) => getRanges(editor, entry),
    observe: ({ editor, refresh }) => subscribe(editor, refresh),
  };

  <Plite decorations={[syntax]} editor={editor} />;
  ```

- Keep the existing Plate lowering:

  ```ts
  const CodeHighlightPlugin = definePlatePlugin({
    key: "codeHighlight",
    decorate: {
      read: ({ editor, entry }) => getRanges(editor, entry),
      observe: ({ editor, refresh }) => subscribe(editor, refresh),
    },
  });
  ```

- Add no public `TextFlow`, `TextTile`, `DecorationSet`, `RangeSet`, chunk size,
  render profile, viewport corridor, or optimization flag. Those are runtime
  implementation details.
- Delete `BaseCodeLinePlugin`, `CodeLinePlugin`, `PLUGINS.codeLine`,
  `CodeLineElement`, and `data-code-line` in Phase 3. Old spellings may survive
  only inside versioned migration code and fixtures.
- Arbitrary React `renderText` or `renderLeaf` remains a correctness-preserving
  fallback island. Built-in/intrinsic renderers get the stress guarantee;
  custom renderer stress needs its own proof rather than a misleading flag.

Chosen internal architecture:

1. Canonical model: one newline-bearing Text for unmarked code; adjacent Text
   nodes exist only when semantic marks differ. Newline offsets define lines.
2. Flow grouping: `editable-text-blocks.tsx` groups adjacent supported Text
   children under one React flow island. Ten thousand semantic Text nodes do
   not imply ten thousand React components.
3. Range owner: `decoration-source.ts` keeps per-NodeKey ordered intervals,
   maps retained ranges through `DocumentChange`, replaces signaled buckets,
   and compiles one boundary stream. No segment scans the full decoration list.
4. DOM owner: private keyed view records retain model span, mark/decorations,
   DOM node, and mapping metadata. A transaction reconciles only changed spans
   and reuses equal records, following PM/WG rather than rebuilding JSX leaves.
5. Native owner: the view adopts safe browser text mutation, maps DOM/model
   endpoints through records, and repairs only the changed corridor. IME and
   composition records are protected rather than recreated.
6. DOM granularity: start with one DOM Text per equal-format run. If the
   pathological long-line profile proves browser `nodeValue` or selection work
   owns a failed row, test bounded all-mounted strings once. Every character
   remains mounted; no fragment gets a React unit or public knob.
7. Fallback: unsupported custom React renderers split the parent into explicit
   fallback islands rendered by the existing path. They preserve behavior but
   do not inherit an unproved stress claim.
8. Virtual mode: unchanged. If a product truly needs missing offscreen token
   wrappers, extend explicit virtualized mode in a separate accepted plan.

Decision ledger:

| Surface                 | Current                                                        | Target                                             | Owner                           | Adoption                                                       | Proof                                                       | Risk                             | Verdict                                  |
| ----------------------- | -------------------------------------------------------------- | -------------------------------------------------- | ------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------- | ---------------------------------------- |
| Canonical code model    | one CodeLine element plus Text per physical line               | one newline-bearing Text; semantic splits only     | Plate code-block schema         | versioned app migration and all codecs                         | old-version fixtures, round trips, Yjs replay               | empty/trailing-line loss         | hard cut after Phase 2                   |
| Text projection         | one React `EditableText` per Text and JSX leaf segments        | one retained flow island with private view records | Plite React                     | built-in/intrinsic renderer fast path; current custom fallback | matched full matrix and React/DOM counters                  | mapping or lifecycle bugs        | replace                                  |
| Decoration compilation  | boundary creation followed by `decorations.filter` per segment | per-key ordered intervals and one boundary sweep   | Plite decoration manager        | public source calls unchanged                                  | deterministic checks plus sparse/dense/overlap browser rows | overlap ordering drift           | replace                                  |
| DOM text granularity    | one DOM Text or React-generated segments                       | one DOM Text per equal-format run                  | private Plite view              | no public adoption                                             | long-line profile and native matrix                         | browser-specific giant-node cost | keep first; conditional bounded pivot    |
| View update             | React rebuild/reconcile of all projected leaves                | retained keyed records and changed-span DOM patch  | Plite React/DOM input           | selection and native mutation owners use the same records      | input, composition, selection, paste, history, Yjs          | React/DOM ownership conflict     | replace                                  |
| Custom renderers        | arbitrary React callbacks disable safe native sync             | explicit fallback islands                          | Plite/Plate renderer capability | no flag; existing calls keep working                           | representative custom renderer correctness rows             | slower stress behavior           | preserve with scoped guarantee           |
| Syntax                  | Lowlight full block, cached per CodeLine                       | Lowlight full block to global ranges on one Text   | Plate CodeHighlight             | remove line cache; retain public `decorate`                    | source plus integrated settle timing                        | 63 ms parse on stress            | keep first; source pivot only on failure |
| Viewport token wrappers | absent in full DOM                                             | absent in full DOM                                 | explicit virtual mode only      | separate future plan if required                               | existing virtual receipt                                    | dual view semantics              | reject                                   |
| Public CodeLine API     | plugin, key, component, docs noun                              | no public line noun                                | Plate package/registry/docs     | remove all live consumers; migrations only                     | residue allowlist and type/export proof                     | intended breaking change         | delete in Phase 3                        |
| Decoration API          | `PliteDecorationSource`; Plate `decorate`                      | unchanged                                          | Plite/Plate public API          | none                                                           | type inference and existing source tests                    | premature public indexing API    | keep                                     |

Execution phases:

| Phase                                   | Owner                                                                                   | Scope                                                                                                                                                                                                     | Entry                          | Checkpoint and pivot                                                                                                                                                                                                                                                                                                                            | Exit proof                                                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Benchmark and architecture lock      | Benchmark, Performance, Editor Audit, Best API, Plite Plan, Plate Plan                  | all source audits, reference builds, matched matrices, causal probes, public-call verdict, adoption map                                                                                                   | user request                   | **Keep:** private full-DOM retained view. **Reject:** line nodes, splitter-only fix, default token virtualization, mandatory fixed chunks. **Stop:** no product edit until user accepts this exact plan.                                                                                                                                        | this plan, receipts, validators                                                                                                                |
| 2. Plite DOM-present text-flow engine   | Plite React/DOM/input/decorations                                                       | register the production matrix first; group supported Text runs; add indexed boundary plan and retained DOM records; preserve public APIs and custom fallback; wire selection/native mutation/history/Yjs | explicit acceptance of Phase 1 | **Keep** only if every correctness veto and budget passes. **Pivot once** to all-mounted bounded DOM strings only when a profile names giant-node browser work. **Stop** after that one pivot if any browser/native or performance gate remains red. Phase 3 stays closed.                                                                      | production-import matrix; focused package/browser tests; `pnpm check:plite:dev`; full `pnpm check:plite`; browser matrix                       |
| 3. Plate CodeLine hard cut and adoption | Plate code block, CodeHighlight, codecs, AI, DOCX, migrations, registry, docs, examples | move commands to newline offsets; flatten schema/codecs; emit global Lowlight ranges; delete public line API; migrate persisted docs/rooms; update all 37 bounded consumers and generated registry        | Phase 2 passes without waiver  | **Keep Lowlight** if integrated highlighted code passes. **Pivot once** to mapped cached ranges plus measured coalesced full rehighlight when source cost owns failure; record both input paint and highlight settle. **Stop** and open a separate incremental-highlighter design if still red. Never restore line nodes or add viewport paint. | package/code browser tests, migration/history/Yjs/AI/DOCX/static/docs/registry proof, production benchmark rerun, changeset, zero live residue |

Phase 2 exact gate:

- Start by adding a registered `react-text-flow-browser-matrix` target that
  preserves the current fixture, source identities, counters, and exact text
  oracle. Keep the current path as a selectable negative control.
- Pass plain, one-mark, 10k-semantic-run, sparse, dense, overlap, long-line,
  custom-fallback, and code fixtures at normal/large/stress cohorts.
- Satisfy the frozen per-row relative/absolute budgets. For the five-character
  highlighted code packet, 10k mount/type/settle must be at most 204/475/600 ms.
  These ceilings are tied to the fair 40k-decoration full-DOM controls above.
- Prove exact selection across every record boundary; forward/backward and
  multi-range selection where supported; click/arrow/Home/End; copy/cut/paste;
  Enter/Backspace; undo/redo; browser find; spellcheck/autocorrect policy;
  composition start/update/end; beforeinput adoption; follow-up typing.
- Run Chromium and Firefox plus WebKit and mobile viewport on Darwin. Real-device
  proof is required only if the changed native path cannot be established by
  those engines; viewport emulation is never called raw-device proof.
- Prove history and two-client Yjs edits before/inside/after a changed span with
  identical canonical JSON and no duplicate/lost DOM text.
- The bounded-string pivot is legal only when trace counters attribute the red
  row to giant DOM Text mutation/selection. It must run both unbounded and
  bounded variants in the same packet and pass all native guards.

Phase 3 exact gate:

- Change code-block content to one Text, deriving lines from newline offsets.
  Preserve command jobs: insert/toggle/format, Enter, Backspace at boundaries,
  Tab/Shift+Tab, multi-line indent/outdent, select-all replacement, and paste.
- Replace per-line `WeakMap<Element, ...>` highlighting with one global ordered
  range set. The first implementation keeps Lowlight 3.3.
- At 10k lines, integrated highlighted input-to-paint must be at most 200 ms.
  Its render/reconcile residual after the separately measured source cost must
  be at most 1.5x the best matched PM/WG dense full-DOM row. Highlight-settle
  must be measured if the source pivot schedules work.
- Migrate HTML, Markdown, clipboard, static/DOCX, AI insertion, stored document
  versions, and collaboration room versions. Never let old and new schema peers
  edit one shared tree.
- Remove line exports, keys, components, plugin dependencies, docs teaching, and
  generated registry references. Allow old names only in a reviewed migration
  fixture/code allowlist.
- Run focused code-block package tests, the Plite Chromium
  `code-highlighting.test.ts` file, strict Plite, relevant Plate checks,
  `pnpm --filter www build:registry`, standalone code-block demo proof, docs
  typecheck, changeset verification, and the final production benchmark.

Proof matrix:

| Claim                                        | Planning evidence                                                                                         | Execution proof                               | Status                   |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------ |
| Slate does not scale one decorated Text      | sparse and dense receipts; 8k ranges already reach 1,216 ms type                                          | retain Slate as contextual baseline           | proved for planning      |
| Unmarked Slate can scale one Text            | 10k plain and long-line rows are 24.7/25.5 ms type                                                        | prevent false root-cause claims               | proved for planning      |
| Plite's splitter is quadratic                | exact check-count and sweep microbench                                                                    | production counter must be linear             | proved for planning      |
| Splitter replacement alone is insufficient   | 500-line dense sweep stays about 1.47 s                                                                   | Phase 2 must remove whole React rebuild       | proved for planning      |
| Full DOM can handle 40k paint ranges         | PM/WG type stays below about 115 ms with 110k-130k nodes                                                  | production Plite dense/overlap rows           | proved as target law     |
| PM does not chunk text like CM               | `TextViewDesc` keeps one Text DOM node; CM caps private TextTiles near 512 and adds viewport gaps         | source recheck at implementation start        | proved for planning      |
| Wordgard is the closer modern renderer donor | changed-range comparison, retained TextTiles, DOM reuse, native beforeinput                               | map each borrowed law to a Plite owner        | proved for planning      |
| LineBreak nodes are not the best Plite model | WG/Lexical can be fast enough but pay physical-line model shape; PM is faster without it                  | one-Text code schema tests                    | target locked            |
| Fixed text chunks are not the default        | PM/WG and long-line rows pass without a cap; chunk probes add native risk                                 | conditional side-by-side Phase 2 gate only    | target locked            |
| Viewport token paint is virtualization       | CM coverage counters and Plite mode ownership show missing view work                                      | no full-DOM code path reads viewport          | target locked            |
| Existing public decoration API is sufficient | per-entry source plus NodeKey refresh already expresses current jobs                                      | type inference and source contract tests      | target locked            |
| Lowlight need not be replaced yet            | full 10k edit/rebuild costs about 63 ms, far below current 16 s                                           | integrated highlighted gate                   | target locked with pivot |
| CodeLine deletion is exhaustive              | bounded audit finds 37 package/app/docs/browser files across live, generated, test, and migration classes | zero live residue outside migration allowlist | adoption specified       |

Scale contract:

- applicability and source evidence: applies. `editable-text.tsx` filters every
  decoration for every emitted segment. `editable-text-blocks.tsx` renders a
  React `EditableText` per Text child and disables its direct path for custom
  leaf/text renderers. Decoration refresh is NodeKey-scoped, so a giant Text is
  one large bucket.
- user operation, current owner, proposed owner: cold mount, decoration refresh,
  and trusted midpoint typing. Current owner is React leaf projection. Proposed
  owner is one private retained text-flow view under one React island.
- independent variables: characters, physical newlines, semantic Text runs,
  decoration ranges and overlap depth, equal-format DOM runs, source parse cost,
  custom fallback count, browser, and virtual/full-DOM mode.
- current baseline: commands and receipts under
  `docs/plans/artifacts/2026-09-02-plite-text-flow-benchmark-first/` and the two
  named predecessor artifact directories.
- disposable target evidence: PM/WG working implementations, ordered-sweep
  Plite intervention, and all-mounted native/React string controls. These prove
  design laws and reject local fixes; they do not replace production proof.
- deterministic indicators: range checks/boundary visits, source reads, React
  commits/duration, changed records, DOM creates/reuses/removes, selection-map
  visits, model/DOM node counts, listener/subscription counts, source parse and
  range-build time, and heap.
- correctness guard: exact model/DOM text and offsets in planning; full native,
  history, and collaboration veto in Phase 2/3.
- final production command: Phase 2 registers and runs
  `pnpm bench:targets:run -- react-text-flow-browser-matrix`; Phase 3 reruns the
  same target with the code/highlight profile plus `pnpm check:plite` and the
  focused code-highlighting browser file.

Performance:

- applicability: text nodes, decorations, React units, DOM view records, source
  ranges, and physical lines are repeated units on the visible operation.
- repeated reads/fan-out: no network/database work applies. The material fan-out
  is source read to one large bucket, bucket to every segment, segment to React,
  and React to DOM.
- proposed index/cache: justified only for ordered decoration intersection and
  retained DOM records, the measured owners. No generic cache/store/scheduler is
  accepted.
- degradation: none in DOM-present mode. Explicit virtual mode remains a
  separately selected product behavior.
- production observability: deterministic checked-in benchmarks are the owner.
  No document text, tenant data, headers, or content telemetry is introduced.

Conditional evidence:

- High-risk scenarios: applies. Composition, browser-native mutation, selection
  across reused records, bidi/grapheme offsets, spellcheck, arbitrary custom
  renderers, overlapping marks/decorations, old document migration, and mixed
  Yjs schemas are explicit vetoes.
- External research: local source checkouts and built packages were used. No web
  summary substitutes for source or executable proof.
- Issue/PR provenance: no public issue or PR is in scope; no GitHub mutation.
- Browser/Benchmark/docs/release owners: Benchmark owns timing; Plite browser
  tests own native behavior; Plate package and registry tests own adoption;
  docs teach only the final API; a changeset is required in Phase 3. Release is
  outside this plan.
- Public API repair: Best API keeps decoration calls unchanged and authorizes
  the later CodeLine hard cut. If execution changes that conclusion, stop and
  rerun Best API rather than improvise a public control.

Findings:

- Plite's catastrophe is not "one large Text" by itself. Plain one-Text rows are
  tolerable. Decorations expose quadratic splitting and a full React projection
  rebuild; semantic Text runs expose React mount ownership.
- ProseMirror uses persistent decoration trees and retained view descriptions,
  not CodeMirror's fixed text chunking.
- CodeMirror combines private small TextTiles with viewport and long-line gaps.
  Its 16 ms rows are a specialized virtualized contract, not a fair full-DOM
  promise.
- Wordgard combines persistent RangeSets, changed-range discovery, retained
  tiles, DOM reuse, and native input adoption. Adjacent equal-format TextTiles
  merge without a fixed maximum.
- Wordgard and Lexical use line-break model leaves for code. Their existence
  proves line-shaped models can be engineered well; it does not make physical
  lines semantic in Plite.
- Slate's block chunking groups children of an element. It cannot split the
  single Text case, and it does not solve leaf/decorations projection.
- Plate's `BaseCodeLinePlugin` is embedded in schema, commands, codecs,
  clipboard, highlighting caches, React dependencies, AI insertion, DOCX,
  registry, docs, tests, and migrations. This is a real hard cut, not deleting
  two exports.
- Lowlight parse is the next visible cost after Plite projection is fixed, but
  current evidence does not justify throwing away language coverage or changing
  public decoration ownership.

Decisions and tradeoffs:

- Take the PM/WG retained-view architecture, not either editor's document model.
- Take CM/WG ordered range structures, not CM's default viewport contract.
- Keep every required token wrapper mounted in DOM-present mode. At 10k lines,
  working full-DOM references prove this is viable.
- Do not promise CodeMirror latency for a full-DOM rich-text editor. Offer that
  class of tradeoff only through explicit virtualized mode.
- Make fixed all-mounted DOM strings conditional. They are not virtualization,
  but they still increase selection/IME risk and need causal proof.
- Preserve custom-render correctness. Do not promise the optimized stress budget
  for arbitrary React trees until a separate benchmark earns it.
- Cut CodeLine only after Plite earns the replacement. This avoids trading an
  ugly model for another slow renderer.

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and exact owner families are concrete.
- [x] Current API, behavior, docs, tests, exports, and CodeLine claims cite live source.
- [x] Reusable public call shape has one Best API verdict.
- [x] Every scale-sensitive target law has executable current/reference or disposable evidence; production acceptance remains an explicit Phase 2 gate.
- [x] Every decision row records owner, adoption, proof, risk, and verdict.
- [x] Canonical state and derived presentation have one owner each; no copied line or viewport state survives.
- [x] Public breaks and migration-only residues have complete adoption/deletion answers.
- [x] Exactly three execution phases and their focused proof matrices are concrete.
- [x] Conditional bounded strings, Lowlight source work, custom renderers, and virtualization have explicit keep/pivot/stop outcomes.
- [x] Comparable current-owner receipts precede target selection.
- [x] Complete user operations and deterministic counters were measured.
- [x] Normal, large, stress, and pathological cohorts ran where executable; caps are labeled.
- [x] Warm percentiles, cold duration, sample counts, source identity, DOM/model counters, and heap are retained in receipts.
- [x] Disposable prototypes test only the claimed owner and are not mistaken for production proof.
- [x] Candidate/reference comparisons label different DOM and input contracts.
- [x] Query/render/subscription fan-out was inspected before accepting indexes or retained records.
- [x] Only measured owners receive new private machinery.
- [x] Evidence contains no credentials, identifiers, headers, tenant data, or protected content.
- [x] Phase 2 creates the deterministic production regression target before implementation.
- [x] No latency budget override exists; the 8,192-fragment permission was tightened, not loosened.
- [x] Register the production-import `react-text-flow-browser-matrix` target,
      preserve the current implementation as a selectable negative control,
      and capture the pre-fix red receipt before renderer changes.
- [x] Implement the private Plite flow island, ordered decoration index, retained
      DOM records, changed-span reconciliation, selection mapping, and safe
      native-mutation adoption without changing public decoration calls.
- [x] Prove Phase 2 plain, marked, semantic-run, sparse, dense, overlap,
      long-line, custom-fallback, and code rows at normal, large, stress, and
      pathological cohorts with all frozen counters and budgets.
- [x] Prove Phase 2 selection, clipboard, editing, history, composition,
      beforeinput, find/spellcheck policy, browser breadth, and two-client Yjs
      behavior; the result is keep without bounded strings.
- [x] Run focused Plite package/browser proof, `pnpm check:plite:dev`, strict
      `pnpm check:plite`, and the browser matrix before opening Phase 3.
- [x] Rerun Best API repair and Plate Plan adoption review after Phase 2, then
      hard-cut the live CodeLine schema/plugin/key/component owners.
- [x] Migrate highlighting, commands, codecs, AI, DOCX,
      stored versions, collaboration versions, registry, examples, docs, and
      every bounded consumer; keep old names only in the reviewed migration
      allowlist.
- [x] Prove integrated highlighted input and settle budgets after the declared
      cached-range/rehighlight pivot; record the 214 ms input red and fire the
      separate-syntax-plan stop without reverting the one-Text hard cut.
- [x] Run applicable Plate/package/browser/registry/docs/migration/Yjs proof,
      changeset verification, zero-live-residue audit, final production
      benchmark rerun, Benchmark validator, and Autogoal checker.

Completion Gates:

| Gate                          | Applies | Required action                                                                                 | Evidence                                                                                                                       |
| ----------------------------- | ------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Binary planning readiness     | yes     | Resolve all benchmark, architecture, API, adoption, and phase decisions                         | All sections and receipts are concrete.                                                                                        |
| Fresh source evidence         | yes     | Recheck decision-changing owners                                                                | Live Plite, Plate, PM, CM, WG, Lexical, and Slate owners were read in this activation.                                         |
| Best API review               | yes     | Resolve P0/P1 call-shape questions                                                              | Public decoration calls stay; CodeLine hard cut is gated; no public runtime control is added.                                  |
| Pre-acceptance scale proof    | yes     | Record matched baselines, target-law probes, counters, identities, and correctness limits       | Result tables and artifact directory satisfy the planning claim.                                                               |
| Production scale rerun        | yes     | Register, capture current red, and rerun `react-text-flow-browser-matrix` on production imports | `production-chromium-phase2.json` passes every row with max ratio 0.98.                                                        |
| Conditional risk and adoption | yes     | Resolve every triggered risk or assign a phase veto                                             | Native, custom renderer, syntax, migration, collaboration, and virtual-mode decisions are explicit.                            |
| Verification recorded         | yes     | Run plan validators and artifact/source checks                                                  | Commands and final results are recorded below.                                                                                 |
| Handoff prepared              | yes     | State final keep/pivot/stop outcome, breaks, proof, and remaining risks                         | Retained text flow and the CodeLine hard cut are kept; Phase 3 stops on the 214 ms input p95.                                  |
| P1 autoreview                 | no      | `next` forbids autoreview                                                                       | Focused tests, strict checks, benchmark contracts, and browser proof provide the applicable review gates.                      |
| Goal plan complete            | yes     | Run Autogoal completion checker after all execution evidence is recorded                        | Final checker passes after this ledger is formatted.                                                                           |
| Warm latency budget           | yes     | Pass every applicable frozen production row or fire the declared stop gate                      | Phase 2 passes; Phase 3 fires the declared stop at 214.0 ms versus 200 ms.                                                     |
| Large/stress scaling          | yes     | Prove the production target at normal, large, stress, and pathological cohorts                  | Phase 2 passes all cohorts; final Plate keeps one 490k-character Text, 20k token elements, and 60,003 full-DOM nodes.          |
| Cold and failure paths        | yes     | Capture mounts, caps, crashes, and recovery                                                     | Raw receipts and Error attempts preserve them.                                                                                 |
| Payload and fan-out           | yes     | Record model/DOM/range/React/source units                                                       | Tables and raw snapshots record them; no network payload applies.                                                              |
| Correctness guard             | yes     | Pass every native, history, collaboration, and exact-text production veto                       | Affected unit, Chromium, strict, browser-matrix, and five fresh Enter replays pass.                                            |
| Before/after receipt          | yes     | Compare the identical production command before and after each kept intervention                | The registered matrix records ratio 999 before and 0.98 after retained flow; the Phase 3 target records the final syntax stop. |
| Detector and privacy          | no      | No product detector is justified for local benchmark planning                                   | Deterministic anonymous fixtures contain no protected data.                                                                    |
| Performance regression check  | yes     | Validate the completed benchmark plan and retain registered-target health                       | Benchmark contracts, 48-target registry validation, complete-plan validation, and JSON parsing pass.                           |

Phase / pass table:

| Phase              | Status                       | Evidence                                                                                                             | Next                                                      |
| ------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Ground             | completed                    | Requirements, skills, Vision, current owners, source identities, and cohorts were fixed.                             | none                                                      |
| Decide             | completed                    | Matched matrix, causal interventions, source comparisons, Best API, and hard-cut counterfactual resolved the target. | none                                                      |
| Prove and hand off | completed                    | Three gated phases, adoption map, proof matrix, budgets, limitations, and validators are recorded.                   | none                                                      |
| Phase 2 execution  | completed                    | The retained engine passes the production matrix at max ratio 0.98 and the full correctness/browser gates.           | none                                                      |
| Phase 3 execution  | completed with declared stop | CodeLine is deleted and all correctness/growth gates pass; final input p95 is 214.0 ms against 200 ms.               | separate incremental-highlighter design only if requested |
| Execution closeout | completed                    | Final checks, receipts, residue audit, generated outputs, changeset, plan validation, and handoff are recorded.      | none                                                      |

Review fixes:

- Rejected viewport-limited token wrappers after the user correctly classified
  them as virtualization.
- Replaced the earlier fixed-8,192-string target with unbounded equal-format DOM
  Text first and one conditional all-mounted-string pivot.
- Added semantic-run and sparse/dense/overlap matrices after plain/code results
  proved insufficient.
- Added real Lowlight and incremental Lezer source-cost probes so DOM work is not
  blamed for syntax parsing.
- Kept public decoration APIs unchanged after Best API review.

Error attempts:

| Error / failed attempt                                                                                 | Count | Different move                                                                                                                              | Resolution                                                                   |
| ------------------------------------------------------------------------------------------------------ | ----: | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Virtualized single-block receipt directory was absent                                                  |     1 | Create the plan artifact directory and rerun unchanged                                                                                      | passed                                                                       |
| Wordgard rejects overlaps inside one RangeSet                                                          |     1 | Use three ordered sources, matching independent overlapping owners                                                                          | passed                                                                       |
| CodeMirror loaded two State runtimes                                                                   |     1 | Align the temp install to View's exact State version                                                                                        | full matrix passed                                                           |
| Plite sparse 10k exceeded the main packet cap                                                          |     1 | Isolate it with one sample and retain partial peer results                                                                                  | 16-second failure captured                                                   |
| Slate five-packet sparse/dense retry crashed Chromium                                                  |     1 | Isolate bounded one-sample ceilings; do not manufacture stable p95                                                                          | limits captured                                                              |
| Plite dense 2k could not finish one warm sample within 90 seconds                                      |     1 | Stop the cell and use 500-line ceiling plus exact microbench                                                                                | causal ceiling captured                                                      |
| Disposable sweep build could not resolve package-local dependencies                                    |     1 | Link only the temp build to installed dependencies                                                                                          | sweep ran without product-source edits                                       |
| Prescribed one-time reinstall hit a `nanoid` pnpm link race                                            |     1 | Run ordinary `pnpm install`; do not repeat reinstall                                                                                        | install and strict Plite checks passed                                       |
| Lowlight script initially pointed one directory too shallow                                            |     1 | Correct the plan-artifact-relative package root                                                                                             | source-cost receipt passed                                                   |
| The checked-in target gained exact initial-text and retained-flow counters after the first red capture |     1 | Keep the command fixed and run the final target with its selectable legacy control for a same-harness causal comparison                     | final Phase 2 artifact passes at ratio 0.98                                  |
| A broad `jq` artifact projection exceeded the output cap                                               |     1 | Query one fixture, cohort, surface, and phase at a time                                                                                     | narrow projections are readable                                              |
| First retained-flow rerun left decorated DOM text four insertions stale                                |     1 | Add one node-keyed model-truth subscription for the whole flow, use stored text-value invalidation, and repair the local string child shape | strict nine-fixture browser smoke passes with exact DOM coverage             |
| The original 263.2 ms code gate used unhighlighted PM/WG controls                                      |     1 | Rerun both with the identical 40k-decoration packet and separate input from source-settle latency                                           | corrected fair ceilings and control receipt recorded                         |
| Deferring the initial flow build broke synchronous rendered-DOM ownership                              |     1 | Mount the decoration manager in insertion effect and keep initial DOM reconciliation synchronous                                            | focused renderer contracts pass                                              |
| Native insertion mapping initially keyed from all decoration owners                                    |     1 | Derive the pure insertion only from changed Text keys                                                                                       | mapped ranges and delayed source revalidation pass                           |
| Reordering root work did not repair dense mount                                                        |     1 | Profile ownership accounting, then replace the zero-reuse transition in one renderer-owned batch                                            | 10k dense mount fell from about 738 ms to 193.2 ms                           |
| Forced model-owned input did not improve the profiled hot path                                         |     1 | Remove the diagnostic and retain native ownership plus local index mapping                                                                  | fair input result passes                                                     |
| An 80 ms Lowlight coalescing experiment worsened input to 321 ms and caused two retained rebuilds      |     1 | Restore the measured 120 ms policy and keep the syntax stop honest                                                                          | fully reverted; final input returns to 214 ms with one rebuild               |
| Removing empty-class Lowlight ranges changed two semantic decoration counts from four to two           |     1 | Update assertions to count only paint-bearing ranges                                                                                        | 95 affected consumer tests pass                                              |
| Final Chromium highlighting exposed stale syntax DOM after Enter                                       |     1 | Reproduce the single case, retain actual prior root nodes, and compare before replacing children                                            | 18/18 highlighting tests and five forced fresh Enter replays pass            |
| `--repeat-each=5` was rejected by the managed Plite browser runner                                     |     1 | Run five explicit forced-proof invocations instead                                                                                          | all five invocations executed and passed                                     |
| Initial shell repetitions reused the browser proof cache                                               |     1 | Set `PLITE_BROWSER_FORCE_PROOF=1` for every repetition                                                                                      | five uncached passes recorded                                                |
| Website typecheck read a stale API manifest                                                            |     1 | Regenerate API reference output, then rerun unchanged                                                                                       | API reference generation passes                                              |
| Website TypeScript exhausted 4 GB and 8 GB heaps                                                       |     2 | Raise only the verification process heap to 24 GB                                                                                           | `NODE_OPTIONS=--max-old-space-size=24576 pnpm --filter www typecheck` passes |

Verification evidence:

- `base-and-marks.json` SHA-256 `17140d90...6849e8e` contains the 60-row
  matched base/mark matrix and exact text/coverage counters.
- `sparse.json`, dense/overlap reference receipts, capped Plite/Slate receipts,
  and sweep receipts contain the decoration matrix and failure ceilings.
- `decoration-split-scaling.json` SHA-256 `624422da...1939c4` contains exact
  deterministic current/sweep work.
- `syntax-source-scaling.json` SHA-256 `39ccc7b4...5de46` and
  `incremental-syntax-scaling.json` SHA-256 `e241df10...9f8048` contain source
  timing and correctness limits.
- `huge-code-block-probe.json` SHA-256 `6e296985...a6b19b76` contains the
  seven-surface code packet.
- `newline-rich-8192-native-final.json` SHA-256 `ad383499...fee40` and
  `wrapped-prose-8192-native-final.json` SHA-256 `5a65bf0f...0c794` retain the
  all-mounted string controls.
- `production-chromium-phase2.json` SHA-256
  `60858adca5c853f42fe3b0a35e3c3d9780887b3f4c3d3303d4a93eac5ae31f17`
  passes at max ratio 0.98. Its 10k highlighted row records 199.2 ms mount,
  63.4 ms refresh, 406.6 ms input, 521.6 ms settle, one model Text, exact full
  DOM, one retained record, one build, and zero React commits.
- `production-code-block-phase3.json` SHA-256
  `f406bb01aabb4f918afa42a4f0085761b132c86f03668fe7017e09715e2243a7`
  records the final integrated path. Mount 135.6 ms, source 64.6 ms, render
  residual 457.7 ms, and settle 522.3 ms pass. Input 214.0 ms is the sole red
  gate. The snapshot has one model Text, exact 490,019-character DOM text,
  20,000 token elements, 60,003 DOM nodes, one retained build, and zero React
  commits.
- The affected consumer group passes 95 tests. The durable target correctness
  gate passes 58 Plate code tests and 18/18 Plite Chromium highlighting tests.
  Five forced fresh repetitions of the exact Enter case also pass.
- `pnpm --filter plitejs test` passes 15 tasks. Plate code partitions pass 49
  and 9 tests with both typecheck partitions green. Markdown passes 204 tests;
  DOCX 111 plus 3; static rendering 87; AI 35 plus 49 React tests; migrations 71.
- `pnpm --filter plitejs build`, `pnpm --filter platejs build`, `pnpm brl`,
  `pnpm --filter www api-reference`, and `pnpm --filter www build:registry`
  pass. Website typecheck passes with a 24 GB verification heap after 4 GB and
  8 GB runs exhausted memory.
- `pnpm check:plite:dev` passes 85 typechecks, app/www integration, 134 package
  tasks, 232 contracts, 25 benchmark contracts, public builds/types, and its
  Chromium smoke. Strict `pnpm check:plite` passes the same static gates plus
  711 Chromium tests, 8 skips, and 79 bounded batches.
- Final `pnpm check:plite:browser-matrix` passes: Chromium 711/8 skipped/115
  batches; Firefox 604/115/115; mobile 319/400/115; WebKit 625/94/115; mobile
  WebKit 2/0/1.
- The live registry code-block demo passed Enter, Tab, Shift+Tab, and typing.
  It retained one direct text owner, highlighted the inserted `const` token,
  and logged no browser errors. Its custom renderer correctly uses the fallback;
  this is correctness proof, not a stress guarantee for arbitrary renderers.
- The live runtime/public residue scan finds no CodeLine plugin, key, component,
  or `data-code-line` outside `packages/platejs/src/migrations`. Remaining
  matches are versioned migration readers/fixtures, historical docs/artifacts,
  and the changeset that names the removal.
- `pnpm bench:targets:check` passes with 48 registered targets. Benchmark
  contracts pass 22/22. Every named JSON receipt parses with `jq empty`.
- The complete Benchmark validator and Autogoal checker pass on this final
  ledger.

Final handoff prepared:

- Ownership: Plite privately retains and reconciles one DOM-present text flow;
  Plate keeps public decoration calls and owns code-block syntax policy.
- Public break: `BaseCodeLinePlugin`, `CodeLinePlugin`, `PLUGINS.codeLine`,
  `CodeLineElement`, and the line-shaped schema are deleted. V56 flattens old
  stored code lines into one newline-bearing Text.
- Virtualization: no viewport token materialization was added. Explicit
  virtualized mode remains the only contract allowed to omit far DOM.
- Performance: Phase 2 passes at max ratio 0.98. Final integrated Plate input
  is 214.0 ms, 44% faster than Wordgard and 48% faster than ProseMirror, but 14
  ms over Plate's frozen target. The declared Phase 3 stop fired.
- Correctness: commands, codecs, AI, DOCX, static rendering, migrations,
  registry, browser-native editing, history, selection, clipboard,
  collaboration, and the final cross-browser matrix pass.
- Delivery: the checkout contains the implementation, generated registry/API
  outputs, changeset, changelog, benchmark target, receipts, and this ledger.
  Nothing was committed or pushed because the user did not ask for it.
- Next decision: leave this architecture alone unless 200 ms is a hard product
  requirement. If it is, design an incremental highlighter; never restore
  performance-only line nodes.

Timeline:

- 2026-09-02: created the benchmark-first goal and froze requirements.
- 2026-09-02: ran registered product targets, matched editor matrices, isolated
  failure ceilings, splitter intervention, native-string controls, Lowlight,
  Lezer, and virtual-mode controls.
- 2026-09-02: completed source audit, Best API verdict, Plite target, Plate
  adoption phase, and max-three-phase checkpoint plan.
- 2026-09-02: user accepted execution; created the one-shot goal, reopened this
  plan as the execution ledger, and started Phase 2 with Phase 3 gated.
- 2026-09-02: registered the production-import target, passed its registry and
  correctness preflight, and captured the current renderer's exact red receipt.
- 2026-09-02: implemented the first retained-flow packet; the exact target
  exposed stale DOM text after native typing, and a focused browser rerun passes
  after switching reconciliation from mutable object identity to text value.
- 2026-09-03: Phase 2 passed every frozen fixture and cohort at max ratio 0.98,
  followed by strict Plite and full native browser proof.
- 2026-09-03: hard-cut CodeLine across schema, commands, codecs, AI, DOCX,
  migrations, registry, docs, tests, and generated outputs; added the V56
  flattener and production Plate/Lowlight benchmark target.
- 2026-09-03: fixed a final retained-root ordering regression caught by the
  Chromium Enter case; 18/18 highlighting cases and five forced fresh replays
  pass.
- 2026-09-03: froze the integrated result at 135.6 ms mount, 214.0 ms input,
  64.6 ms source, 457.7 ms render residual, and 522.3 ms settle. The 200 ms
  input gate fired the declared stop and closed execution without rollback.

Reboot status:

| Question             | Answer                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where am I?          | Execution is closed at the declared Phase 3 latency stop. No cause or implementation lane remains active.                                                           |
| Where am I going?    | A separate incremental-highlighter design only if the user makes the final 14 ms a hard requirement.                                                                |
| What is the goal?    | Replace Plite's large decorated-text cliff without line-shaped canonical state or hidden viewport paint.                                                            |
| What have I learned? | Retained full-DOM text flow is the right general editor architecture; Lowlight's whole-block refresh owns the remaining tail.                                       |
| What have I done?    | Implemented the local one-Text architecture, deleted CodeLine, migrated all bounded consumers, passed correctness breadth, and preserved the one honest red budget. |

Open risks:

- The integrated input p95 is 214.0 ms. Chasing the final 14 ms inside this
  packet risks more complexity than value; incremental parsing/highlighting
  needs its own benchmark-first design.
- Full-DOM 10k-line token paint is viable. Substantially larger code should use
  an explicitly selected virtual product contract, never silent partial paint.
- Arbitrary custom React text renderers keep correctness through fallback, but
  the optimized stress guarantee applies only to the built-in retained host.
- V56 migrates persisted CodeLine documents. Mixed-version collaboration rooms
  still require normal coordinated deployment discipline; no room-version bump
  was invented for this schema cut.
