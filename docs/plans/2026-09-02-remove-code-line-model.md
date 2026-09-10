# remove code line model

Objective:
Close the CodeLine hard-cut decision; done when live ownership, matched
performance evidence, native behavior gates, adoption slices, and plan checks
pass; plan docs/plans/2026-09-02-remove-code-line-model.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-02-remove-code-line-model.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:

- performance-observability

Mode:

- `deep`: the decision changes a repeated model/DOM unit and the user asked for
  measured Slate, ProseMirror, and Lexical comparison.

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:

- Live source/export/caller/docs audit for CodeLine and code-block ownership.
- Existing benchmark target inventory plus a matched current-CodeLine versus
  no-CodeLine executable probe, with Slate/ProseMirror/Lexical context kept
  separate from the causal comparison.
- Code-block model, rendering, selection, clipboard, IME, highlighting, and
  serialization correctness guards identified from current tests/browser rows.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-09-02-remove-code-line-model.md`.

Constraints:

- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:

- In scope: whether persisted CodeLine elements should disappear; the raw
  Plite model/DOM/runtime law needed for large code blocks; Plate code-block,
  highlighting, codecs, registry/docs/example adoption; matched performance
  and native-browser proof requirements.
- Source owners: Plite model/React/DOM and benchmark owners; Plate code-block
  package and direct teaching/registry consumers. Exact paths remain a Ground
  checkpoint and will be recorded before the decision locks.
- Non-goals: product-source implementation before explicit plan acceptance;
  unrelated code-block UI polish; broad editor ranking; claiming shipped or
  fixed behavior from planning evidence.
- Direct Plate/collaboration adoption owners: Plate code-block model,
  normalization, render/highlight, codecs, copied registry examples, docs, and
  collaboration/history behavior if current source proves line nodes enter
  persisted operations.

Prompt requirements:

- Give harsh, decisive feedback on whether optimizing away CodeLine is the
  right long-term target now that Plite may break APIs and architecture.
- Confirm the claimed huge-code-block performance problem with current
  benchmark evidence against Slate, ProseMirror, and Lexical where comparable
  targets exist; do not turn cross-editor ranking into causal proof.
- Apply `plite-plan`, `plate-plan`, and `performance`; use Benchmark for
  measurement and Best API for the hard-cut verdict.
- Deliver one source-backed plan and recommendation. Do not implement product
  code until this exact plan is accepted and invoked for execution.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- Stop short of a ready verdict only if no current benchmark can be made
  comparable and a disposable no-CodeLine probe cannot execute, or if native
  behavior ownership cannot be determined after focused source and test audit.
  Do not block while a narrower owner probe remains runnable.

Plite Plan state:

- status: ready-for-acceptance
- phase: prove-and-handoff complete
- next: user accepts, rejects, or amends this exact target
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Prompt requirements section copies the requested hard-cut judgment, editor comparisons, named skills, breaking freedom, and plan-only handoff. |
| Active goal and plan verified | yes | Goal tool returned active objective for this exact plan path. |
| Current owners read | yes | `BaseCodeBlockPlugin.ts` owns persisted line nodes, commands, codecs, and highlight invalidation; `CodeBlockPlugin.tsx` exports the public React plugins; Plite `editable-text.tsx` owns decorated text splitting; registry and docs teach the public line component. |
| Best API target resolved | yes | Delete the public plugin and persisted node. Keep line editing as derived offset behavior owned by `CodeBlockPlugin`; keep long-text DOM projection private to Plite. |
| Runtime scale applicability resolved | yes | Code line count and token-decoration count repeat across model nodes, React elements, DOM wrappers, path operations, invalidation, and text projection. |
| Pre-acceptance Benchmark probe selected | yes | Matched local Chromium probe: current nested CodeLine value versus one multiline Text value, plus actual ProseMirror and Lexical code-block shapes; cohorts, budget, identities, counters, and content guard are frozen below before target measurement. |
| Mode and execution boundary resolved | yes | Deep, agent-led plan hardening; planning only until explicit acceptance. |
| Performance pack selected | yes | `performance-observability` is materialized in this plan because CodeLine repeats in model and DOM hot paths. |
| User-facing operation and runtime owner identified | yes | Cold render, middle-line caret placement, and a five-character typed burst in one multiline code block. Current owner: Plate CodeBlock model plus Plite React text/element rendering. |
| Scale variables and cohorts fixed | yes | Line count is 100 / 1,000 / 5,000 / 10,000; fixed 48 visible characters per line; plain-code comparison first, token decoration count tagged separately. |
| Budget frozen before target measurement | yes | Candidate must cut model nodes by at least 90% and DOM nodes by at least 30% at 5,000 lines; typed-burst p95 may not regress by both more than 20% and more than 5 ms; content and caret-target guards must pass. |
| Baseline and target probe selected | yes | Baseline is a Plite code block containing one CodeLine element per line. Target prototype is the same Plite/React build with one newline-bearing Text child. ProseMirror and Lexical are contextual peers, not causal baselines. |
| Correctness guard selected | yes | Exact pre/post text, typed-character count, middle-line offset, model line count, and mounted editable DOM; execution adds the current code-highlighting browser behavior suite plus native find/selection/copy/paste/IME/history/collaboration rows. |
| Production detector decision recorded | yes | No production telemetry owner is introduced by this model change. Use the deterministic checked-in benchmark with aggregate timing/node counters only; no document text or identifiers in artifacts. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every scale-sensitive target has a passing executable current-owner versus
      target Benchmark receipt before its decision row locks; paper complexity,
      a review score, or deferred measurement does not satisfy this row.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus exact-view presentation is classified when
      applicable: no parallel state, copied payload, or editor-global policy
      owner survives without an independent job.
- [x] Public breaks and the private DOM projection have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Performance pack: capture a comparable current-owner receipt before accepting a scale-sensitive target or optimizing an existing path.
- [x] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [x] Performance pack: exercise normal, large, stress, and pathological cohorts where applicable; a single convenient size cannot prove scaling.
- [x] Performance pack: record warm percentiles, cold duration, sample/warmup counts, noise, payload bytes, and deterministic work counters when the harness supports them.
- [x] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [x] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [x] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [x] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [x] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads.
- [x] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [x] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [x] Performance pack: no budget override exists; the frozen budget passed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Decision ledger, slices, proof matrix, risk rows, and final handoff are complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Live code, current docs, current browser tests, public exports, and 2021 history were read on 2026-09-02. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | P0 verdict: remove `BaseCodeLinePlugin`, `CodeLinePlugin`, `PLUGINS.codeLine`, and `CodeLineElement`; expose only `CodeBlockPlugin` and optional `CodeHighlightPlugin`. |
| Pre-acceptance scale proof | yes | Record a matched baseline/target result | Ten measured Chromium iterations after one warm-up across 100/1,000/5,000/10,000 lines passed the frozen 5,000-line budget. |
| Production scale rerun contract | yes | Name exact final-path rerun | Benchmark reruns `CODEBLOCK_PROBE_ITERATIONS=10 bun docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.mjs` after replacing the disposable target with production imports. |
| Conditional risk and adoption | yes | Resolve triggered risk/browser/docs/release work | Five risk scenarios and every direct Plate, persisted-data, collaboration, registry, docs, and browser owner are assigned below. |
| Verification recorded | yes | Record planning proof and execution gates | Verification evidence and proof matrix contain exact commands and receipts. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and order | Final handoff is complete below. |
| P1 autoreview | no for planning | Run only for implementation changes | This turn changes a plan and disposable benchmark only. Accepted implementation must run P1 review within the repo cap. |
| Goal plan complete | yes | Run the mechanical completeness check | The exact command is recorded in Verification evidence and must pass before goal close. |
| Warm latency budget | yes | Prove the changed operation stays within budget | At 5,000 lines target typed-burst p95 was 199.2 ms versus 260.6 ms current; ratio 0.76 and delta -61.4 ms. |
| Large/stress scaling | yes | Cover all declared cohorts | Receipt covers 100, 1,000, 5,000, and 10,000 lines; target stayed below current mount/type p95 at stress and pathological sizes. |
| Cold and failure paths | yes | Measure cold work and preserve fallback ownership | Mount-to-paint and long tasks are recorded. Production must block release rather than restore CodeLine if native correctness or the budget fails. |
| Payload and fan-out | yes | Record bytes and repeated work | Fixtures are 4,899 / 48,999 / 244,999 / 489,999 characters before typing. At 5,000 lines model nodes fall 10,001 to 2 and total DOM descendants 25,004 to 242. No queries or subscriptions exist in this path. |
| Production-path rerun | yes | Assign exact final rerun | Benchmark owns the exact cohort command after implementation; focused browser and `pnpm check:plite` are mandatory companions. |
| Correctness guard | yes | Define behavior/native/data guards | Exact text and target offset passed in the probe; current code-highlighting rows plus native find/selection/copy/paste/IME/history/collaboration are execution gates. |
| Before/after receipt | yes | Keep comparable evidence | `huge-code-block-probe.json` contains matched current, naïve target, private-chunk target, Slate, ProseMirror, and Lexical samples. |
| Detector and privacy | yes | Avoid protected data | Deterministic synthetic code only; aggregate timing, heap, model, and DOM counters; no user, tenant, document, header, or credential data. |
| Performance regression check | yes | Keep deterministic owner proof | The checked-in probe becomes the regression owner after production integration and runs with package/browser proof. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, consumers, history, tests, docs, exports, and scale variables audited. | Decide |
| Decide | complete | Best API hard cut and Plite-first target locked by the matched probe. | Prove and hand off |
| Prove and hand off | complete | Receipt, slices, gates, risks, and execution commands recorded. | User review |

Decision brief:

- outcome: Kill CodeLine as a public plugin, persisted element, schema noun, key,
  component, and documented concept. Keeping it would preserve accidental
  representation as API and pay O(lines) model/DOM cost forever.
- chosen shape: One `codeBlock` element contains exactly one newline-bearing
  Text. Plate derives line ranges from offsets. Plite privately renders long
  text in bounded DOM strings while keeping one canonical Text and complete
  browser-visible content. `CodeHighlightPlugin` decorates global offsets on
  that Text.
- strongest rejected alternative: A single canonical Text rendered as one
  giant DOM Text. It removes model/DOM nodes but reached 634.6 ms typed p95 at
  10,000 lines versus 438.7 ms current and 282.8 ms with bounded strings;
  runtime/DOM repair reached 454.6 ms and produced a 59 ms long task. That
  shortcut is not good enough.
- consequence: This is a Plite runtime change first, then a Plate hard cut and
  persisted-data migration. Shipping only the Plate cleanup would trade an
  ugly model for a different performance bug.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Persisted code-block content | One CodeLine element and Text per source line | Exactly one newline-bearing Text child | Plate code-block schema; app-owned schema migration | Lines are offsets, not durable entities | Flatten line children with `\n`; codecs emit/read plain code text | Schema tests, codec round trips, migration fixtures, collaboration snapshot replay | Newline or mark loss | rearchitect |
| Public line API | `BaseCodeLinePlugin`, `CodeLinePlugin`, `PLUGINS.codeLine`, `CodeLineElement` | No line plugin, key, component, export, or docs noun | Plate package and registry owners | No independent user job remains | Delete exports/config/docs; allow old names only inside historical migration fixtures/readers | Barrel/typecheck/docs search with a migration-only allowlist | Hidden consumer break is intended but must be exhaustive | cut |
| Long-text DOM projection | One element/string wrapper per persisted line | One canonical Text projected into private bounded DOM strings | Plite React text and DOM-selection owners | A giant DOM string shifts cost into caret repair; private chunks passed | Generic Plite capability based on measured size; no code-block plugin or public chunk option | Benchmark plus boundary selection/copy/find/IME tests | DOM/model offset drift at chunk boundaries | rearchitect |
| Line editing | Path-addressed CodeLine commands | Derived newline spans on `[blockPath, 0]` | `CodeBlockPlugin` | Enter, Backspace, Tab, Shift+Tab, selection indent, and format are offset jobs | Preserve command names when the job remains; replace line-node traversal with ranges | Existing package and browser rows plus boundary cases | Off-by-one around CRLF, trailing newline, and reversed selection | move/keep behavior |
| Highlighting | Join line strings, tokenize, map tokens back per line, invalidate all line caches | Tokenize canonical text and return ordered global ranges on one Text | `CodeHighlightPlugin` plus Plite decoration splitter | Highlighting is optional presentation, not document structure | Replace per-line cache/map; make decoration segmentation an ordered sweep rather than repeated filtering | Plain and highlighted JS/Python benchmark lanes; semantic token browser rows | O(tokens x segments) work or full retokenize on each key | rearchitect |
| HTML/Markdown/clipboard | Encode line spans and split/join line nodes | Read/write ordinary newline text in `<pre><code>` and Markdown fences | Code-block codecs, Markdown, clipboard owners | External formats already represent text, not line nodes | Delete `data-code-line`; update Markdown types/deserializer and copy/paste paths | Exact string and round-trip fixtures including empty/trailing lines | Whitespace normalization | simplify |
| Static/DOCX presentation | Line elements double as presentation units | Derive line fragments only inside the renderer | Registry/static and DOCX owners | Presentation does not justify persisted state | Replace CodeLine renderers with local split/view logic | DOCX/static output fixture and demo | Visual line-height or numbering change | move |
| Persisted migrations and collaboration | Existing version chain can contain `code_line` and `codeLine` | Next schema version stores no line elements; new room version only | App schema migration and collaboration bootstrap | Serialized data is a hard law; runtime aliases are not | Retain old spellings only in quarantined migration code/fixtures; migrate snapshot before opening a new schema-versioned room | Old-version fixtures to final JSON; two-client new-room replay; reject mixed-version peers | Data loss or divergent Yjs trees | rearchitect |
| Public teaching and generated registry | Kit/docs/examples configure three plugins | Kit/docs/examples configure `CodeBlockPlugin` and optional `CodeHighlightPlugin` | Plate UI, docs, examples, registry generation | Public teaching must match the final API | Update 24 `apps/www/src` files and 14 content files found by bounded audit; regenerate registry on `next` | Docs typecheck, standalone demo, generated diff, zero runtime/public residues | Generated output or translated docs drift | cut/adopt |
| Prior node-model recommendation | Research retained line nodes by analogy to other editors | Measured local hard cut | Plite/Plate architecture docs | External shape similarity is weaker than current causal evidence | Supersede the row and update the smallest durable Vision owner if execution confirms the production path | Source-linked decision note and final receipt | Stale worker teaching | supersede |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Production Plite long-text projection | Plite React text rendering and DOM/model mapping | `packages/plitejs/src/react/components/editable-text.tsx`, `packages/plitejs/src/react/editable/fast-dom-selection-range.ts`, adjacent DOM text-sync owner and tests | This accepted plan; current and disposable target receipt | One canonical Text can be rendered in bounded private strings with bidirectional offsets and no public code-block knowledge/config | Focused Plite tests, chunk-start/end caret and IME rows, exact probe rerun using production imports |
| 2. Canonical Plate model and commands | Plate code-block package | `BaseCodeBlockPlugin.ts`, schema/rules/commands, AI and direct package consumers | Slice 1 is green at 10,000 lines | Schema is `schema.content.text({ default: 'text', min: 1, max: 1 })`; all line-node traversal is replaced by newline-offset logic; command jobs remain | Package tests for Enter/Backspace/Tab/ShiftTab/multi-line selection/trailing empty line/format/undo |
| 3. Highlight ranges | CodeHighlight plugin and Plite decoration segmentation | Global token offsets, cache invalidation, ordered range sweep | Slice 2 plain behavior is green | No per-line cache/model dependency; plain and highlighted stress lanes pass without quadratic decoration filtering | Semantic highlighting browser rows; JS/Python token-count cohorts; profiler receipt |
| 4. Serialized adoption | App schema migration, codecs, Markdown, collaboration | Flatten old line children, preserve source fingerprints, move rooms by schema version, update imports/exports | Target JSON shape is locked | Old documents deterministically become one Text; no mixed-version room can edit the same tree; runtime has no alias | Versioned migration fixtures, HTML/Markdown/clipboard round trips, collaboration snapshot and two-client replay |
| 5. React/UI/docs adoption | Plate React, Plate UI registry, examples, static/DOCX, docs | Remove line components/config/teaching; keep block UI and optional highlight | Package API and migration are green | All public call sites use two descriptors; registry output is regenerated from source on `next` | `/blocks/code-block-demo`, docs/typecheck, DOCX/static fixture, `pnpm --filter www build:registry` on `next` |
| 6. Closure | Benchmark, Plate Next, Best API repair, review | Full bounded residue audit, changeset, doctrine parity, final proof | All adoption slices complete | Only historical migration code/fixtures may name old line types; production receipt passes; package/browser checks and P1 review pass | Exact commands below, `pnpm check:plite`, relevant Plate checks, changeset validation, P1 autoreview |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| CodeLine is not needed for canonical text | Plite inserts `\n` into Text; schema content options support `max: 1` | Schema and normalization tests on one Text | specified |
| Slate is bad on this huge-code-block fixture | At 5,000 lines Slate typed p95 is 444.3 ms versus ProseMirror 114.7 ms, Lexical 131.7 ms, and Wordgard 140.3 ms; at 10,000 it is 625.3 versus 133.9, 280.9, and 124.3 ms in the matched packet | Rerun same receipt on final source identity | passed for planning |
| Current CodeLine scaling is also bad | At 5,000 lines current Plite mounts at 1,255.9 ms p95 with 10,001 model and 25,004 total DOM nodes; at 10,000 it mounts at 1,789.5 ms with 20,001/50,004 | Final current baseline retained in production receipt | passed for planning |
| One Text plus private DOM chunks is viable | Disposable target at 5,000 lines: 39.4 ms mount p95, 199.2 ms type p95, 2 model nodes, and 242 total DOM nodes; frozen budget passes | Replace prototype imports with production implementation and rerun all cohorts | passed for target lock |
| A naïve giant DOM string is insufficient | At 10,000 lines naïve target typed p95 is 634.6 ms versus 438.7 ms current and 282.8 ms chunked target; DOM repair dominates | Keep as negative control in the final probe | rejected by evidence |
| Line-shaped models are not inherently slow | Wordgard keeps about two model nodes per line yet beats current Plite CodeLines decisively: 10,000-line matched-packet p95 is 57.5 ms mount and 124.3 ms type; a 20-sample repeat is 90.3/181.7 ms | Do not misstate the hard cut as a universal indictment of line models | passed for planning |
| Public line API has no independent job | `CodeLineElement` only delegates to `PlateElement`; plugin is structural; codecs and commands can use text/offsets | Zero public/runtime matches outside migration allowlist and no type/export residue | specified |
| Editing behavior survives | Existing `code-highlighting.test.ts` covers highlight, language, Enter, trailing line, Backspace, arrows, Tab variants, selection, replacement, and paste | Focused Chromium file plus new chunk-boundary/native/undo rows | specified |
| Serialized data survives the hard cut | Current schema/codecs visibly create one element per line; app migrations already own versioned document shape | Fixtures from every supported old version, round trips, collaboration room upgrade | specified |
| Highlighting does not become the next bottleneck | Current Plite splitter filters every decoration for every segment | Ordered-sweep tests and highlighted 100/1,000/5,000/10,000 receipt | specified |
| Historical claim is accurate | 2021 commits name line editing and Tab/ShiftTab, not measured huge-code-block performance | Keep commit IDs in the decision record | passed |

Scale contract:

- applicability and source evidence: applies. Every source line is currently a
  persisted `BaseCodeLinePlugin` element and rendered wrapper. Highlighting
  joins all child strings, tokenizes the block, then maps ranges back to those
  line elements. A single multiline Text would instead send all decorations
  through Plite's `splitTextByDecorations`, whose current repeated filter makes
  decoration count an independent scale variable.
- user operation, current owner, proposed owner: cold render, middle-line caret
  placement, and five typed characters in one plain multiline code block.
  Current owner is Plate's line-element model rendered by Plite React. Proposed
  owner is one canonical newline-bearing Text rendered by Plite React; any
  scalable internal segmentation must belong to Plite, not a public Plate line
  plugin.
- independent scale variables and normal/large/stress/pathological cohorts:
  fixed 48 visible characters per line; 100 normal, 1,000 large, 5,000 stress,
  and 10,000 pathological lines. Plain code is the causal model probe.
  Highlight token count, selection span, browser/IME, and collaboration traffic
  are separate complexity tags and may not be hidden inside line count.
- frozen absolute/relative budget and noise rule: at 5,000 lines the target
  must remove at least 90% of model nodes and 30% of mounted DOM nodes. Its warm
  middle-line five-character burst p95 fails only when it is both more than 20%
  and more than 5 ms slower than current; exact content/caret guards are hard
  gates. One warm-up is discarded, at least five measured iterations are used,
  and cold duration, p50/p75/p95/max, longest task, heap, model-node count, and
  DOM-node count are recorded. Budgets are frozen before target results.
- current baseline command/artifact and source identity: local code-block probe
  against Plate/Plite `a6afd55c30e97c74fe895d1ad005ca75413110f3`,
  Chromium from Playwright 1.61.0 on Darwin arm64 with Node v24.3.0. Command:
  `CODEBLOCK_PROBE_ITERATIONS=10 bun
docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.mjs`.
  Receipt: `docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.json`.
- target command/artifact or disposable prototype and source identity: same
  command, build, browser, fixture text, action, and samples as baseline, with
  the disposable target using one multiline Text and 64-line private DOM
  chunks. The chunk size is a measured prototype input, not public API or a
  final constant; implementation sweeps reasonable sizes and reruns the frozen
  contract.
- contextual peer identities: Wordgard
  `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54` / 0.5.1, ProseMirror
  `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`, Lexical
  `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, Slate 0.124.1, and Slate React
  0.124.2. Peer results describe current code-block representations; they do
  not prove why Plate is faster or slower.
- deterministic work indicators plus timing result: at 5,000 lines, current
  Plite versus the private-chunk target is 10,001 versus 2 model nodes, 25,004
  versus 242 total DOM nodes, 1,255.9 versus 39.4 ms mount p95, and 260.6
  versus 199.2 ms typed-burst p95. At 10,000 lines it is 20,001 versus 2 model
  nodes, 50,004 versus 476 total DOM nodes, 1,789.5 versus 48.6 ms mount, and
  438.7 versus 282.8 ms typed-burst p95. All exact samples and
  p50/p75/p95/max values are in the receipt.
- correctness/native guard: probe asserts exact text, middle-line target, and
  five inserted characters. Production execution must keep the focused
  `code-highlighting.test.ts` suite green and add native browser-find,
  selection, copy/paste, IME, history, and remote-update coverage for the
  no-CodeLine path.
- final production-path rerun owner and exact command: Benchmark owns the same
  checked-in cohort command after implementation; `pnpm check:plite` and the
  focused Chromium code-highlighting browser file are mandatory correctness
  companions. The final receipt must identify the implementation ref and use
  production imports, not the disposable bundle.

Performance:

- applicability: applied. Persisted lines, rendered wrappers, path walks,
  invalidation, token ranges, and DOM strings are repeated units on the typed
  interaction path.
- Vercel React rules: none selected. This decision is owned by document shape,
  DOM/model offset mapping, and native editing behavior; a React micro-tactic
  cannot remove the dominant repeated work.
- repeated units: current persisted CodeLine/Text pairs and DOM wrappers;
  target private DOM chunks; highlighted target token decorations. Chunks are
  derived presentation only and never copied into canonical state.
- cohorts and payload: 100 / 1,000 / 5,000 / 10,000 lines at 48 characters per
  line, yielding 4,899 / 48,999 / 244,999 / 489,999 characters before the
  five-character input.
- timing and deterministic counters: cold mount-to-paint; warm five-character
  middle-line type p50/p75/p95/max; longest task; heap; React duration/commits;
  Plite core/runtime duration; model and DOM nodes. One warm-up is discarded
  and ten iterations are retained.
- budget: at 5,000 lines remove at least 90% of model nodes and 30% of DOM
  nodes; fail typed p95 only when both over 20% and over 5 ms slower; exact text
  and caret target are hard gates. Result: 100% rounded model reduction, 99%
  rounded DOM reduction, and 83.1 ms faster typed p95.
- complete interaction proof after implementation: add Enter, Backspace,
  Tab/ShiftTab, multi-line selection, copy/paste, undo/redo, IME composition,
  remote updates, browser find, and selections crossing private chunk
  boundaries. Highlighted JS/Python has its own token-count lane.
- React/runtime primitive decision: use Plite's DOM-text-sync-capable private
  string projection and offset map. No React 19 primitive removes the need for
  correct bounded DOM/model mapping.
- memory and fan-out: heap/model/DOM/React counters are captured. There are no
  network queries, pagination, or subscriptions. Implementation must not add a
  listener or store per private chunk.
- degradation contract: none. The full document remains in DOM and must keep
  native find, selection, and copy semantics at every measured cohort.
  Virtualization and staged loading are rejected.
- production observability: no existing dashboard owns code-block line count
  or editing latency. Do not invent document telemetry for this cut; retain the
  deterministic aggregate harness. Add anonymous runtime measurement only as a
  separate product decision.
- plan delta from evidence: the hard cut is earned, but the first target changed
  from one giant DOM string to one canonical Text with private bounded DOM
  strings. Production acceptance also requires the highlighted lane and native
  boundary guards.

Conditional evidence:

- High-risk scenarios: applies. Offset-derived line operations can corrupt
  multi-line transforms; private chunk boundaries can break caret/composition
  and native selection; token decoration can become quadratic; migration can
  lose empty/trailing lines; mixed collaboration schemas can diverge. Each has
  an execution proof row and release-blocking guard.
- External research: no additional web research. Actual local Slate,
  ProseMirror, and Lexical packages were executed; local source and history own
  the Plate/Plite decision.
- Issue/PR provenance: no public issue or PR is in scope. This is an internal
  architecture decision and creates no GitHub mutation.
- Browser/Benchmark/docs/release/behavior-law owners: Benchmark owns the
  checked-in receipt; Browser owns ordinary demo and DOM behavior; Chrome owns
  exact native find/clipboard/IME proof when Browser cannot observe it; docs
  and registry are Slice 5; package changes require a changeset. If durable
  model law changes, execution updates the smallest Plite/Plate Vision owner,
  audits `plate-plugin-creator`, `plate-ui`, `docs-creator`, and `plate-next`,
  then runs `pnpm install` only if source agent rules changed.
- Current-turn browser decision: not applicable because no product UI or
  package source changed. Accepted execution changes `packages/**` and
  `apps/www/**`, so browser proof is mandatory before handoff.
- Performance pack, pre-acceptance receipt, and final rerun: applied. The
  planning receipt passes the frozen budget. Slice 6 replaces disposable target
  code with production imports and reruns the exact command on the final ref.

Findings:

- Historical memory is context only: a July 2026 cleanup made CodeBlockPlugin
  own code-line structure and CodeHighlightPlugin own optional highlighting.
  Current checkout source and benchmarks must re-prove that ownership.
- Current history contradicts the neat origin story. The first line-element
  work was committed in February 2021 for line editing, Tab/Shift+Tab, Enter,
  and indentation. The repository does not show CodeLine being introduced as a
  measured huge-code-block performance workaround.
- The existing cross-editor huge-document benchmark uses thousands of separate
  paragraphs. It can compare general editor scaling, but it cannot validate a
  one-code-block representation decision.
- Wordgard's code schema admits Text and LineBreak leaves, and its whitespace
  parser turns each newline into a LineBreak. Its fast 10,000-line result proves
  that line-shaped model nodes can work in a lean tile renderer; it does not
  rescue Plate's public CodeLine noun or React wrapper stack.
- `CodeLineElement` is effectively a wrapper in the shipped registry, while the
  public plugin and docs expose it as a first-class concept. DOCX line rendering
  is the only current presentation-specific job found so far; that is not a
  sufficient reason for a persisted public model noun.
- Current source makes the coupling explicit: `BaseCodeLinePlugin` owns a text
  wrapper and `data-code-line` HTML; `BaseCodeBlockPlugin` requires it, splits
  codecs and `setContent` by newline, traverses it for Tab, and maps highlighting
  back to every child line. The React descriptor then exports the line plugin as
  a required dependency.
- Plite already accepts newline insertion into Text and schema content rules
  support `max: 1`. Its fast DOM selection mapper already sums multiple
  `data-plite-string` lengths, which is the right substrate for a private
  bounded-string projection.
- CodeMirror 6 is the exact bounded-text precedent: its view builder caps text
  tiles at 512 characters and maps document positions through those tiles.
  Slate's decorated leaves are a partial precedent for multiple rendered
  strings under one logical Text. Wordgard merges adjacent TextTiles without a
  fixed cap, so it is not using this technique.
- The current decoration splitter builds all boundaries and filters every
  decoration for every segment. Moving a large highlighted block to one Text
  without replacing that repeated filter risks quadratic work.
- The bounded consumer audit found 17 `packages/platejs/src` files, 24
  `apps/www/src` files, 14 content files, and one `apps/plite` browser-test file
  containing `CodeLine`, `codeLine`, or `code_line`. Generated output and
  historical migrations require explicit classification, not blind deletion.

Decisions and tradeoffs:

- Yes, optimize away CodeLine. More bluntly: keeping it would be defending a
  2021 editing implementation as if it were document semantics. It is dirty
  architecture, and Plate's current implementation is a bad large-file
  strategy. Wordgard means we must not pretend line nodes themselves are the
  universal cause.
- Do not expose a replacement line/chunk plugin, line array, chunk-size option,
  persisted index, or virtualization mode. Those recreate the same mistake
  with newer names.
- Derive line starts/ends by newline offsets inside the code-block owner. Add an
  incremental private index only if the final profiler proves rescanning owns a
  failing operation; the current probe does not justify one.
- Preserve public command jobs, not their implementation. `insert`, `toggle`,
  format, indent, outdent, Enter, and Backspace stay only where users need them.
- Keep old spellings solely in versioned migration code and fixtures needed to
  recover persisted documents. No runtime alias, deprecated export, dual schema,
  or mixed collaboration room survives.
- Sequence Plite projection before Plate deletion. A half-cut that removes line
  nodes while rendering one giant string is measurably worse for typing and must
  not land as the final state.

Open risks:

- Private DOM chunks must preserve bidirectional offsets through empty lines,
  trailing newlines, surrogate pairs, combining marks, RTL text, and chunk
  boundaries. Any mismatch blocks release.
- Lowlight can emit many token ranges. Without an ordered range sweep and a
  highlighted stress receipt, one-Text highlighting could erase the plain-text
  gain.
- Old documents and collaboration snapshots are serialized facts. The hard cut
  requires deterministic migration and new schema-versioned rooms; mixed peers
  are forbidden.
- Browser find, copy, selection, and IME must remain native over the complete
  DOM. If private chunks break them, fix the projection or stop; do not restore a
  public CodeLine model.
- The benchmark is a controlled local result, not production telemetry. Final
  implementation must rerun on its exact source ref and report machine noise;
  it cannot claim universal hardware latency.

Review fixes:

- Rejected the original one-Text/one-DOM-string target after its runtime/DOM
  repair became pathological at 10,000 lines and lost to both current Plite and
  the bounded-string target.
- Rejected a decoration-based chunk prototype after it disabled the normal DOM
  text-sync path and raised typed p95 to 428 ms in diagnostics.
- Locked private DOM chunks only after the DOM-text-sync-capable prototype passed
  the predeclared node and typed-latency budget.
- Separated the cross-editor context from the causal current-versus-target
  comparison; the generic existing huge-document benchmark was not reused as
  proof for a code-block representation decision.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad CodeLine searches streamed generated/history noise and truncated output | 2 | Split by named source owner and count file lists before printing | Resolved with bounded `packages/platejs/src`, registry, docs, and test searches |
| `rg` pattern embedded a literal newline and was rejected | 2 | Search fixed tokens or use shell-safe escaped patterns | Resolved |
| Unmatched zsh artifact glob failed | 1 | Use `find` or quote a fixed path | Resolved |
| Guessed Lexical and ProseMirror source paths did not exist | 2 | Inspect package file lists before opening | Resolved; Lexical code lives in `lexical-code-core`, and ProseMirror comparison uses built core modules |
| Lexical loaded two core module identities in the disposable bundle | 2 | Rewrite only the temporary Code bundle import to the same Lexical module identity | Resolved; actual Lexical code nodes then mounted and typed correctly |
| Naïve single DOM Text target showed unstable and pathological DOM-repair cost | 2 | Profile Plite core versus runtime/DOM repair and test a private bounded-string projection | Resolved; private-chunk target passed and the naïve negative control remains in the canonical receipt |
| Decoration-based chunking rerendered through the wrong runtime path | 1 | Keep chunks private and mark the renderer DOM-text-sync capable | Resolved; final target typed p95 is 199.2 ms at 5,000 lines in the expanded seven-surface packet |
| Importing Wordgard subpackages by separate absolute paths created duplicate `wordgard/state` identities | 1 | Import the package root once and take its namespaces from one module graph | Resolved; smoke and full trusted-input packets passed |

Verification evidence:

- Source audit on 2026-09-02:
  - `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:126-202`
    proves the line schema/dependency/read owner; `399-446` proves line-based
    content and indentation; `1238-1417` proves per-line highlight mapping and
    invalidation.
  - `packages/platejs/src/react/features/code-block/CodeBlockPlugin.tsx:1-17`
    proves public export/dependency shape.
  - `packages/plitejs/src/editor/insert-soft-break.ts:8-22` proves newline Text
    insertion; `packages/plitejs/src/interfaces/schema.ts:262-266` proves exact
    content cardinality is expressible.
  - `packages/plitejs/src/react/components/editable-text.tsx:235-289` proves the
    repeated decoration filter; `packages/plitejs/src/react/editable/fast-dom-selection-range.ts:6-48`
    proves multiple DOM strings already map to one Text offset.
  - `apps/www/src/registry/components/editor/code-block.tsx:335-352` and
    `content/docs/(plugins)/(elements)/code-block.mdx:24-35,65-110,204-227`
    prove the wrapper component and three-plugin public teaching.
- History proof:
  - `fea6c6b88c17c57fe57e514c25ee9a8eedb571db` (2021-02-04),
    `[wip] switching code-block to use an element per line and to add tab/shift-tab`.
  - `3ca8a3fb970f3678160bdd0894f56b32e27ac26d` (2021-02-21),
    `feat: code block line`.
- Benchmark command:
  `CODEBLOCK_PROBE_ITERATIONS=10 bun
docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.mjs`.
- Benchmark result: frozen budget `pass: true`; ten samples per surface/cohort
  after one discarded warm-up; exact content guard passed. Full result:
  `docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.json`.
- Benchmark syntax/format gate:
  `pnpm exec prettier --check
docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.mjs
docs/plans/2026-09-02-remove-code-line-model.md`.
- Planning completeness gate:
  `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-09-02-remove-code-line-model.md`.
- Accepted implementation gates:
  `CODEBLOCK_PROBE_ITERATIONS=10 bun
docs/plans/artifacts/2026-09-02-remove-code-line-model/huge-code-block-probe.mjs`;
  `pnpm --filter plite test:plite-browser:chromium
apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts`;
  `pnpm check:plite`; relevant Plate package checks; registry build on `next`;
  Browser demo proof; native Chrome proof where Browser cannot observe the
  behavior; migration/collaboration fixtures; changeset; P1 autoreview.

Final handoff prepared:

- Ownership and target API/runtime: Plite privately projects one canonical long
  Text into bounded DOM strings; Plate owns code-block offsets, commands,
  codecs, and optional global-offset highlighting.
- Public breaks and Plate/collaboration adoption: delete every public/runtime
  CodeLine noun; migrate old JSON into one Text; create a new schema-versioned
  collaboration room; retain old spellings only in migration code/fixtures.
- Applicable browser/Benchmark/docs/provenance decisions: all are assigned in
  Slices 3-6; no public issue or PR mutation belongs to this planning turn.
- Scale applicability, design receipt, and production rerun contract: passed
  for target lock; exact final-path rerun and correctness companions are named.
- Proof and execution risks: native DOM behavior, offset correctness,
  highlighting complexity, migration, and collaboration are release blockers,
  not follow-up polish.
- Execution order and user attention: accept or amend the target; then run
  Plite projection, Plate model/commands, highlighting, serialized adoption,
  UI/docs adoption, and closure in that order. Do not land the naïve giant-DOM
  intermediate as a finished change.

Timeline:

- 2026-09-02T11:39:15.723Z Plite Plan created.
- 2026-09-02 Goal activated; explicit requirements, boundaries, deep mode, and
  performance pack recorded before source exploration or target measurement.
- 2026-09-02 Live ownership/history/consumer audit completed; existing generic
  huge-document benchmark rejected as non-causal for this decision.
- 2026-09-02 Matched seven-surface Chromium probe completed across four cohorts;
  naïve target rejected and private bounded-string target passed.
- 2026-09-02 Best API hard cut, Plate adoption, risks, proof matrix, and
  execution order prepared for user acceptance.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ready for user acceptance |
| Where am I going? | Plite-first execution only after this exact plan is accepted |
| What is the goal? | Decide whether to hard-cut CodeLine without losing the measured large-code-block advantage or native editor behavior. |
| What have I learned? | CodeLine is accidental public structure and scales badly; one canonical Text needs private bounded DOM strings, not one giant string. |
| What have I done? | Audited ownership/history/consumers, executed the matched probe, rejected two failed targets, and prepared the Plite/Plate adoption and proof plan. |

Open risks:

- Existing cross-editor benchmarks may use different document shapes or DOM
  strategies and therefore support symptom context without proving CodeLine is
  causal.
- Removing persisted line nodes can improve ontology while regressing native
  line selection, copy/paste, IME, highlighting invalidation, or incremental
  edits unless those laws receive explicit owners.
