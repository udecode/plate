# Plite large Text DOM tiling

Objective:
Fix Plite's single-Text scaling without changing document meaning: retain one
canonical Text, project it into private bounded DOM tiles, preserve native
editing, and remove any performance reason for per-line model nodes.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-02-plite-large-text-dom-tiling.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:

- performance-observability

Mode:

- `standard`: the decision crosses model, React/DOM, input, selection,
  decorations, history, collaboration, and browser proof. This activation is
  planning-only.

Completion threshold:

- Answer the ProseMirror/CodeMirror question from live local source.
- Choose one generic Plite representation and reject the others explicitly.
- Explain the exact relationship to Slate/Plite child chunking.
- Pass the frozen current-owner versus disposable-target scale contract for
  newline-rich and wrapped prose.
- Give the production implementation and native-browser proof contract.
- Pass `check-complete.mjs` without an unresolved decision.

Verification surface:

- Current Plite Text rendering, DOM text sync, input, selection repair,
  DOM/model point conversion, decorations, and root grouping.
- Local ProseMirror, CodeMirror View, Wordgard, and Slate source at recorded
  commits.
- One warmup plus ten measured trusted-input samples at 4.9k, 49k, 245k, and
  490k characters for both text shapes.
- Exact full-text correctness after five middle-offset keyboard characters.

Constraints:

- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- Preserve JSON meaning, history, collaboration, decorations, native
  selection, clipboard, find, IME, spellcheck, accessibility, and undo.
- No public tile size, mode, flag, LineBreak compatibility shape, parallel
  document state, editor-global view store, debounce, delayed correctness, or
  viewport-only behavior.
- A semantic hard break may remain a schema node where the schema gives it an
  independent user job. It must never be created as a performance device.

Boundaries:

- In scope: any large Plite Text inside a text block, including embedded `\n`;
  its private React/DOM projection; input ownership; point mapping; decoration
  composition; browser behavior; and the scale harness.
- Source owners: `packages/plitejs/src/react/components/editable-text.tsx`,
  `packages/plitejs/src/react/components/text-string.tsx`,
  `packages/plitejs/src/react/hooks/use-plite-node-ref.tsx`,
  `packages/plitejs/src/react/editable/**`, and
  `packages/plitejs/src/dom/plugin/dom-editor.ts`.
- Non-goals: no Plate code-block command/UI redesign, no editor-wide
  virtualization, no public API, and no product implementation in this turn.
- Plate/collaboration adoption: private and automatic. Plate consumes the
  Plite renderer; history and Yjs continue to store canonical Text changes.
  Removing Plate `code_line` remains the dependent Plate plan after production
  proof, not part of this implementation packet.

Output budget strategy:

- Read named owners first, aggregate profiler events, and keep full benchmark
  samples in JSON artifacts rather than chat output.

Blocked condition:

- During execution, stop before shipping if the production Plite path cannot
  pass exact text plus native selection/IME/copy/find/history/collaboration at
  tile boundaries. Do not fall back to model LineBreak nodes or a public mode;
  keep the current one-string renderer and reopen the measured owner.

Plite Plan state:

- status: ready-for-acceptance
- phase: prove-and-handoff-complete
- next: explicit user acceptance, then accepted-plan execution
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | ProseMirror versus CodeMirror, tile versus LineBreak versus both, child-chunk analogy, and generic single-Text scaling are explicit above. |
| Active goal and plan verified | yes | The active goal names this exact plan and its model/DOM, scale, native-proof, and checker exits. |
| Current owners read | yes | Live owners and exact line evidence are recorded under Findings. |
| Best API target resolved | yes | N/A for a public call shape: the winning behavior is automatic and private; public flags and model types are rejected. |
| Runtime scale applicability resolved | yes | Repeated unit is the rendered DOM string; independent variables are text length, tile count, decoration boundaries, edit kind, and browser/input mode. |
| Pre-acceptance Benchmark probe selected | yes | Matched giant Text, native tiled prototype, and ProseMirror run under one harness with frozen cohorts, budget, counters, source identities, and exact-text guard. |
| Mode and execution boundary resolved | yes | Standard plan; only plan and disposable benchmark artifacts changed. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Public call-shape review is N/A because no public call changes.
- [x] The scale-sensitive target has a passing executable design receipt.
- [x] Every decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state and private view state are classified; no parallel model
      or editor-global policy owner survives.
- [x] No public break or compatibility bridge exists in this Plite packet.
- [x] Execution slices and focused proof are concrete.
- [x] Browser, benchmark, research, docs, release, and risk conditions are
      resolved.
- [x] The performance pass covers cohorts, repeated-unit budgets, p95, cold
      mount, DOM/heap tags, native behavior, trace, and RUM limits.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pass | Resolve every planning decision | All ledger verdicts and execution exits are fixed. |
| Fresh source evidence | pass | Recheck decision-changing claims | Local source was read on 2026-09-02 at the commits under Findings. |
| Best API review | pass | Avoid public machinery | N/A: automatic internal rendering wins; no reusable call shape changes. |
| Pre-acceptance scale proof | pass | Meet the frozen contract | Both final JSON receipts report `frozenBudget.pass: true`. |
| Production scale rerun contract | pass | Name exact final-path reruns | Commands and budgets are fixed under Scale contract and Slice 4. |
| Conditional risk and adoption | pass | Resolve triggered owners | High-risk browser rows, automatic Plate/Yjs adoption, and no-public-docs decision are explicit. |
| Verification recorded | pass | Record fresh planning proof | Source, receipt, hash, and checker evidence are listed below. |
| Handoff prepared | pass | Prepare ownership, proof, risk, and order | Final handoff section is complete. |
| P1 autoreview | pass | Review implementation changes | N/A for planning-only artifacts; accepted execution follows the branch-specific repo rule. |
| Goal plan complete | pass | Run the Autogoal checker | Fresh checker run is recorded under Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current Plite and four local comparison sources traced | Decide |
| Decide | complete | Hard-cut ledger plus passing design receipt | Prove and hand off |
| Prove and hand off | complete | Production slices, native matrix, scale contract, and handoff fixed | User acceptance |

Decision brief:

- outcome: fix single-Text scaling in Plite; do not encode rendering work in the
  document model.
- chosen shape: one canonical Text plus a private, host-local DOM tile plan and
  browser-owned ordinary typing. Start with an internal 8,192 UTF-16-code-unit
  target, prefer nearby newline/whitespace and grapheme boundaries, and locally
  split/merge only the edited tile and neighbor.
- strongest rejected alternative: model LineBreak/per-line children. It makes
  scale proportional to lines across transforms, history, normalization,
  collaboration, React, and DOM merely to dodge one renderer defect.
- consequence: “both” means semantic hard-break nodes may coexist with private
  tiles; it never means manufacturing break nodes for every newline.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Canonical large text | Plite can hold one Text containing `\n`; Plate code blocks use per-line nodes as a workaround | One Text remains the only generic content authority | Plite core model | Rendering policy must not infect JSON/history/collaboration | No Plite migration; dependent Plate plan may cut `code_line` after final proof | Exact-text and constant two-node fixture in both receipts | Very large string operations outside the renderer remain measurable future work | keep |
| Performance LineBreak nodes | Wordgard code blocks parse newlines into LineBreak leaves; Slate/Lexical code-line shapes multiply nodes | Add none for performance; retain only independently semantic hard breaks | Schema/plugin owner | Line identity is not generic Text meaning | No compatibility model or transform | Wordgard source plus 20k-node 10k-line control in the existing seven-surface receipt | A code feature that truly needs line identity must own that separately | cut |
| Private Text projection | Plain undecorated Plite Text becomes one `data-plite-string`; decorations alone create segments | One leaf per equal mark/decoration run containing stable bounded string tiles | Plite React Text owner | Bounds browser character-data and caret/layout work without model nodes | Automatic for every consumer above the private threshold | Native tile design receipts pass both shapes | Span boundaries can affect shaping/spellcheck unless boundary choice is correct | rearchitect |
| Tile lifetime | A fixed-slice custom renderer recuts every suffix and current DOM sync rejects multiple strings | Host-local tile records keep stable ids; edited tile absorbs change and rebalances with at most one neighbor outside composition | Private mounted Text projection | Recomputing absolute slices turns insertion into suffix-wide DOM writes | No public cache/store; discard on text-host unmount | Production tests count changed tiles and retained DOM nodes | Decoration replacement and remote edits may widen the touched range | rearchitect |
| Native typing and caret | Single-string sync can adopt one DOM string; multi-string custom rendering falls back and `setBaseAndExtent` dominates | Let native collapsed `insertText` mutate the tile and caret; adopt into canonical Text; skip DOM write and selection reset when both already match | Input router, text sync, DOM repair queue | This is the ProseMirror advantage; chunks without native ownership remain slow | Existing input capability decides automatically and fails closed | Current profiler versus native-tile causal prototype | Browser/IME differences are the largest correctness risk | rearchitect |
| DOM/model points | Mapping linearly scans rendered strings and accumulates lengths | Resolve DOM-to-model from tile-local metadata; resolve model-to-DOM through a host-local ordered prefix index | DOMEditor and selection range owners | Multiple tiles require exact global/local offsets without document-wide scans | Replace private lookup paths; no public API | Boundary, direction, expanded/collapsed, and detached-host tests | Stale tile metadata can corrupt selection | rearchitect |
| Decorations and marks | `splitTextByDecorations` owns visual runs | Decoration/mark boundaries outrank size boundaries; size tiling occurs inside each run | Decoration source plus Text renderer | Visual semantics and performance projection have different jobs | Existing render callbacks receive the same logical leaf contract | Async decoration and IME tests plus new boundary rows | Decoration refresh can remount the active composition tile | rearchitect |
| Child/block chunking | Slate chunks child nodes; Plite groups top-level NodeKeys and can stage groups | Keep it independent; do not reuse its tree or virtualization policy for one Text | Existing child/root grouping owners | Same principle, different identity and native-editing laws | None | Slate and Plite child-group source audit | Merging the mechanisms would make Text offsets pretend to be child paths | keep |
| Public configuration | No generic Text tiling API | No public mode, size, renderer capability, or diagnostics contract | Plite public API owner | There is no independent caller job; private automatic behavior is better DX | Nothing to document or migrate | Hard-cut counterfactual | Internal tuning must remain benchmarked and deterministic | cut |
| History, collaboration, Plate | Consumers observe Text operations and snapshots | Keep canonical operations unchanged; remote/programmatic edits update private tiles | Core transaction/history/Yjs owners; Plate consumes Plite | View tiling has no serialized meaning | Automatic; dependent Plate code-line removal waits for final production proof | History, remote update, and Yjs browser rows | A full-text replace may legitimately rebuild all tiles | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Private tile plan | Plite React Text owner | Add a private host-local tile planner; compose decoration/mark runs with an 8,192-unit target; prefer nearby newline/whitespace then grapheme boundaries; preserve one logical leaf wrapper per run | User accepts this plan | Plain Text over the private threshold renders stable tiles; under-threshold output is unchanged; no public symbol or model node is added; no tile splits a surrogate pair or grapheme | Focused planner/renderer unit tests; DOM node and tile-count assertions |
| 2. Incremental DOM and point mapping | Text sync, input router, DOM repair queue, DOMEditor | Adopt native tile mutations, locally split/merge after the event, preserve unaffected DOM nodes, add host-local prefix lookup, and remove full-text render identity work | Slice 1 green | Five native characters touch one tile; no redundant `nodeValue` write or `setBaseAndExtent`; programmatic, undo, paste, and remote edits update the minimal affected range; unknown/custom/decorated behavior fails closed to existing model ownership | Package tests plus profiler assertions for changed tile count, render count, DOM writes, and selection repairs |
| 3. Native behavior closure | Plite browser proof owners | Add a one-Text stress fixture through browser-handle `applyValueChange`; cover tile start/end, newline, whitespace, long token, emoji/ZWJ/combining, RTL, trailing newline, empty transition, decorations, composition, corruption repair, clipboard, find, select-all, history, and remote update | Slice 2 green | Chromium, Firefox, WebKit, and mobile viewport preserve exact model/DOM text and caret/range direction; no composition tile is rebalanced mid-composition | Focused Chromium file, existing decoration/DOM-integrity/Yjs rows, then `pnpm check:plite:browser-matrix` |
| 4. Production performance rerun | Benchmark owner | Replace the disposable target claim with the final Plite default path under the same two fixtures/cohorts/action/environment; collect 100 stress/pathological operations for p99, trace DOM repair, and retain exact-text guard | Slice 3 green | Both shapes retain constant model count; 245k/490k p95 improves at least 40% from recorded giant-Text baseline; target is at most 1.5x matched ProseMirror; cold mount stays within +10 ms and 1.25x; DOM/heap budgets below pass | Exact commands under Scale contract; JSON receipts and Chrome interaction trace |
| 5. Package closeout | Plite package owner | Run source-first and strict gates, add the required changeset, and attest automatic Plate/Yjs adoption; do not edit Plate code-line shape here | Slice 4 green | `pnpm check:plite:dev`, `pnpm check:plite`, applicable review gate, and changeset pass; dependent Plate plan receives the production receipt | Command logs and final source identities |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| ProseMirror does not use CodeMirror fixed text tiles for ordinary text | PM `TextViewDesc` owns one DOM Text; CodeMirror emits at most 512-character `TextTile`s | Source identity recheck before implementation | proven-for-plan |
| The best generic model remains one Text | Constant two-node target and no serialized tile state | JSON round trip, history, Yjs, undo/redo | designed |
| Private tiling can remove the giant-string cost | Both frozen receipts pass; 490k target p95 is 42.2/49.8 ms | Final Plite path rerun | design-proven |
| Chunking alone is insufficient | Current fixed-slice prototype remains dominated by collapsed-selection/`setBaseAndExtent` | Profiler event count becomes zero for redundant selection writes | proven-for-plan |
| Point mapping is exact across tiles | Current multi-string mapping precedent exists, but it is linear | Collapsed/expanded/backward ranges at every boundary and root | designed |
| Decorations and IME survive restructuring | Existing async decoration tests expose this exact risk | Extended async-decoration and synthetic IME boundary rows | designed |
| Native browser behavior is not degraded | Target is DOM-present and native, not virtualized | Find, screen-reader traversal, selection, copy, paste, select-all, IME, touch viewport, undo, collaboration, follow-up typing | designed |
| Mount/DOM/heap stay bounded | At 490k the target used 120 DOM nodes and mounted within 42 ms | Final production counters and trace | design-proven |

Scale contract:

- applicability and owner: applied. User operation is cold mount, then five
  trusted keyboard characters at the middle of one Text. Current owners are
  the one-string Text renderer and selection repair; target owner is private
  DOM tiling plus native DOM adoption.
- independent variables: UTF-16 length, newline density, tile count,
  decoration/mark boundaries, changed-range width, native/model-owned input,
  browser, direction, and composition state.
- cohorts: normal 4,904 characters; large 49,004; stress 245,004;
  pathological 490,004. Shapes are newline-rich code-like text and one wrapped
  prose string.
- frozen budget: exact text and constant model count are hard gates; stress and
  pathological p95 trusted typing improve at least 40% versus giant Text; all
  target p95 rows stay at or below 1.5x matched ProseMirror; cold mount is no
  worse than +10 ms and 1.25x; production DOM is at most three nodes per tile
  plus eight per Text host; no per-tile listener, effect, or subscription;
  490k heap is at most baseline +16 MiB and 1.5x.
- noise rule: one warmup and ten measured samples establish large deltas. A
  result within 10 ms of a threshold or with a native-selection outlier gets a
  retry-free 30-sample packet. Do not report p99 below 100 operations; final
  stress/pathological closeout aggregates five 20-sample packets.
- design commands:
  `CODEBLOCK_PROBE_COHORTS=100,1000,5000,10000 CODEBLOCK_PROBE_ITERATIONS=10 CODEBLOCK_PROBE_SURFACES=pliteSingleText,nativeTiledText,prosemirror PLITE_TEXT_FIXTURE_SHAPE=newline-rich PLITE_TEXT_TILE_CHARACTERS=8192 CODEBLOCK_PROBE_ARTIFACT=newline-rich-8192-native-final.json bun docs/plans/artifacts/2026-09-02-plite-large-text-dom-tiling/run-large-text-variant.mjs`
  and the same command with `wrapped-prose` and its artifact name.
- authoritative artifacts:
  `docs/plans/artifacts/2026-09-02-plite-large-text-dom-tiling/newline-rich-8192-native-final.json`
  and
  `docs/plans/artifacts/2026-09-02-plite-large-text-dom-tiling/wrapped-prose-8192-native-final.json`.
- source identity: Plite build SHA-256
  `723dba65faaaa886bc09d1e07e37f3dd9e0f61e6174e2d251ddc319e3f9960ff`;
  ProseMirror `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc` with build SHA-256
  `3c185eb98c60d3758f4e8ec9d1286f84d715a19f0cc37730c0da8e5ca198740f`;
  Chromium via Playwright 1.61.0 on arm64 Darwin; exact harness hashes live in
  each receipt and match their retained generated source.
- deterministic work indicators: two model nodes; target DOM nodes
  2/12/60/120 by cohort; one delegated input listener; zero target React
  components in the disposable isolation; exact full text after every sample.
- result at stress/pathological p95, in milliseconds:

| Shape | Chars | Giant Plite Text | Native tiled target | ProseMirror | Target improvement | Target / PM |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| newline-rich | 245,004 | 158.8 | 25.7 | 82.1 | 84% | 0.31x |
| newline-rich | 490,004 | 283.7 | 42.2 | 133.4 | 85% | 0.32x |
| wrapped prose | 245,004 | 149.7 | 34.1 | 66.5 | 77% | 0.51x |
| wrapped prose | 490,004 | 249.7 | 49.8 | 124.6 | 80% | 0.40x |

- claim limit: the disposable target proves the browser/view ownership law. It
  intentionally omits Plite transactions, React, history, and collaboration,
  so it does not prove shipped Plite performance or behavior. Slice 4 must
  replace that claim with the production path.
- final production commands: rerun both commands with final Plite as the target,
  five 20-sample stress/pathological packets, then run
  `pnpm --filter plite test:plite-browser:chromium apps/plite/tests/plite-browser/donor/stress/large-single-text.test.ts`,
  `pnpm check:plite:dev`, `pnpm check:plite`, and
  `pnpm check:plite:browser-matrix`.

### Performance

- applicability: applied
- Vercel rules used: none; the measured owner is native DOM character data and
  selection repair, not a React micro-tactic. No React 19.2 primitive fixes it.
- extra rules used: cohort-segmentation, repeated-unit-budget,
  interaction-inp-matrix, memory-dom-tagging, editor-native-behavior-proof
- repeated unit: one private DOM text tile; current repeated unit is one
  unbounded DOM Text
- cohorts: 4.9k, 49k, 245k, and 490k characters across newline-rich and wrapped
  prose, with decoration/browser/input tags in execution
- budgets: exact/constant model; 40% stress/pathological p95 gain; <=1.5x PM;
  cold mount, DOM, heap, listener/effect/subscription budgets above
- React/runtime primitives: stable keyed string spans, one logical leaf per
  visual run, host-local prefix metadata, delegated input, and no per-tile
  effects/subscriptions. A transition or deferred render cannot repair native
  caret ownership.
- interaction metrics: design p50/p75/p95 for mount and select-then-type;
  production adds p99, paste, undo/redo, selection, copy, and remote update
- trace/CWV proof: Chrome interaction trace at 490k must show no redundant
  selection write and no tile-wide suffix render; route LCP/CLS are out of scope
- memory tags: heap, DOM nodes, tile count, retained DOM nodes, React renders,
  listeners, effects, subscriptions, changed tiles, DOM writes, selection writes
- degradation contract: native and DOM-present for every cohort; no staged,
  virtualized, model-backed, or opt-in mode
- dashboard/RUM gap: no current Plite RUM owner was found and this packet adds
  none. Release truth is the content-free lab/browser gate; a future product RUM
  owner may tag operation, character cohort, tile count, browser, IME/mobile,
  and release, never document text.
- plan delta: added a native-tile causal prototype, rejected tiling-only React
  slices, froze DOM/heap/native budgets, and required production p99/trace proof

Conditional evidence:

- High-risk scenarios: (1) a caret on either side of a tile boundary maps to the
  wrong global offset; (2) a decoration refresh or rebalance replaces the active
  composition node; (3) insertion recuts every suffix tile and recreates the
  original O(text) work; (4) span boundaries alter shaping, spellcheck, find,
  accessibility, or clipboard text; (5) remote/full-text replacement leaves
  stale tile metadata. Slice 3 has a direct proof row for each.
- External research: local-source-only narrow `editor-audit`. No web claim is
  needed. ProseMirror, CodeMirror View, Wordgard, and Slate commits are recorded
  under Findings.
- Issue/PR provenance: inapplicable; this is not issue- or PR-backed work.
- Browser: applied because selection, input, IME, clipboard, find, and
  accessibility are browser-owned. Physical Appium receipts are deferred
  because no physical-device or release-ready mobile claim was requested;
  mobile viewport remains required.
- Docs/release: no public docs or migration surface changes. Package behavior
  requires a changeset during accepted execution; no release action is
  authorized here.
- Rollback/hard-cut: reject model break nodes and public modes. If production
  native proof fails, retain the current one-string renderer and reopen the
  private projection/input owner with the failing browser artifact.

Findings:

- ProseMirror is not CodeMirror here. At
  `../prosemirror/view/src/viewdesc.ts:914-960`, ordinary text is one
  `TextViewDesc` backed by one DOM Text. Its update writes `nodeValue` only when
  the model differs from the already-mutated DOM. `domchange.ts:81-123,221-270`
  reads the browser mutation and dispatches the model transaction.
- CodeMirror View deliberately bounds text at 512 characters in
  `../codemirror-view/src/buildtile.ts:19,53-64,543-556`, then maps positions
  through `TextTile` in `tile.ts:301-343,383-425`. Its line view and viewport
  machinery are editor-view policy, not Plite model precedent.
- Wordgard is a line-model precedent, not a bounded-text precedent:
  `../wordgard/src/types/schema.ts:46-54` permits Text plus LineBreak,
  `parse.ts:356-360` converts newlines to LineBreak leaves, and
  `editor/tile.ts:1259-1270` merges adjacent TextTiles without a maximum.
- Slate child chunking is a keyed tree of existing child nodes and is disabled
  for leaf blocks (`use-children.tsx:51-54,119-149`; `chunking/types.ts:33-48`).
  Slate only splits one Text by decorations (`components/text.tsx:43-65`).
- Plite's analogous block owner groups top-level NodeKeys in groups of 16 and
  stages groups only after 1,000 children
  (`editable-root-groups.ts:9-38`; `editable-dom-strategy-helpers.ts:7-9`).
  Text tiles instead keep one path and translate global offsets to local DOM
  offsets; they stay DOM-present.
- Current undecorated Plite Text returns one full segment
  (`editable-text.tsx:235-289`) and one `TextString`
  (`editable-text.tsx:393-470`; `text-string.tsx:23-35`). Its render identity
  serializes the entire text (`editable-text.tsx:79-94`).
- Current DOM sync explicitly rejects more than one string
  (`use-plite-node-ref.tsx:331-389`). Current point owners already understand
  multiple strings but linearly scan them (`fast-dom-selection-range.ts:6-49`;
  `dom-editor.ts:1531-1613`).
- In the fixed-slice Plite prototype, five characters caused ten collapsed
  selection repairs and five `setBaseAndExtent` calls; the latter consumed
  about 75-106 ms at 490k. `dom-repair-queue.ts:697-915` calls it without first
  proving the DOM caret differs. That is why text chunks alone missed the PM
  budget.
- Source commits: ProseMirror
  `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`; CodeMirror View
  `fbff59ba004d80d8c914f64c42586387b08706ac`; Wordgard
  `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54`; Slate
  `945a484df2497e4c448b33f417b0de2a49840032`.

Decisions and tradeoffs:

- Use CodeMirror's bounded DOM-string idea, ProseMirror's browser-first typing
  law, and Slate's stable private reconciliation principle. Copy none of their
  model shapes wholesale.
- Prefer newline or whitespace near the 8,192-unit target to protect words,
  spellcheck, and shaping. Fall back to a grapheme boundary for long tokens.
  One pathological grapheme may exceed the target; correctness beats a fake
  hard byte cap.
- Do not recompute fixed absolute slices after every edit. Local slack and
  neighbor rebalancing are mandatory; otherwise every insertion shifts every
  later string.
- Keep decoration runs as the visual authority. Tiles are subordinate DOM
  units and must not appear in `renderLeaf`/`renderText` public semantics.
- A full remote or programmatic replacement may rebuild the Text host. Small
  changed ranges may not.

Review fixes:

- The performance lens added explicit cohorts, p95/p99 policy, cold mount,
  repeated-unit DOM/heap/listener budgets, native behavior, trace, and RUM gap.
- The first render-only tile prototype failed the PM-relative budget; profiler
  evidence changed the target to native DOM adoption plus tiles.
- The first generated harness reused one output path and invalidated receipt
  provenance. Final source is retained per fixture, hashes match, and both
  authoritative packets were rerun.
- The initial exploratory packet ran before the Benchmark methodology was
  loaded. Both authoritative final packets were run after the full Benchmark
  and Performance instructions and relevant rule files were read.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Combined source inventory and raw profiler samples exceeded useful output | 1 | Read exact owner slices and aggregate labels | Resolved |
| Fixed-slice React tiles missed <=1.5x PM because selection repair dominated | 1 | Isolate native DOM tile ownership | Resolved by passing native prototype |
| Equality guard alone did not help because current multi-string sync falls back | 1 | Inspect sync reason and native/model ownership | Resolved; target includes multi-string adoption, not a no-op patch alone |
| Shared generated harness path made the first receipts non-durable | 1 | Retain one generated source per fixture and rerun | Resolved; receipt hashes match current files |

Verification evidence:

- Newline-rich final receipt: `frozenBudget.pass: true`; authoritative path is
  `docs/plans/artifacts/2026-09-02-plite-large-text-dom-tiling/newline-rich-8192-native-final.json`.
- Wrapped-prose final receipt: `frozenBudget.pass: true`; authoritative path is
  `docs/plans/artifacts/2026-09-02-plite-large-text-dom-tiling/wrapped-prose-8192-native-final.json`.
- Each receipt's path-aware harness SHA-256 matches its retained generated
  source. The wrapper is
  `docs/plans/artifacts/2026-09-02-plite-large-text-dom-tiling/run-large-text-variant.mjs`.
- Exact text passed on every measured sample; target model count stayed two;
  490k target DOM count stayed 120.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-plite-large-text-dom-tiling.md` passes in the fresh closeout run.

Final handoff prepared:

- Ownership and target runtime: Plite React owns private DOM tiling; input and
  DOM repair own native adoption; core Text remains canonical.
- Public breaks and adoption: none in Plite. No public option or serialized
  node. Plate and Yjs inherit behavior automatically; Plate `code_line` removal
  remains dependent work.
- Browser/Benchmark/docs/provenance: design benchmark passed; production and
  cross-browser native proof are mandatory execution exits; no public docs or
  issue mutation applies.
- Remaining execution risks: IME/decoration restructuring, Unicode and RTL tile
  boundaries, spellcheck/accessibility across spans, and minimal remote-edit
  reconciliation.
- Execution order: private tile plan, native sync and mapping, native browser
  closure, production benchmark, package/changeset closeout.
- User attention: accept or reject this target. Acceptance authorizes a new
  execution goal; this planning turn does not implement it.

Timeline:

- 2026-09-02T14:46:59.932Z Plite Plan created.
- 2026-09-02 Current Plite, Slate, ProseMirror, CodeMirror View, and Wordgard
  owners traced.
- 2026-09-02 Fixed-slice tiles isolated selection repair as the remaining hot
  owner.
- 2026-09-02 Native tiled design target passed both four-cohort receipts after
  the Benchmark and Performance contracts were loaded.
- 2026-09-02 Decision ledger, production slices, proof matrix, and handoff
  completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ready planning handoff |
| Where am I going? | Accepted-plan execution after explicit user acceptance |
| What is the goal? | One canonical large Text with fast native DOM tiling |
| What have I learned? | Tiling is necessary, but native DOM/caret ownership is the decisive second half |
| What have I done? | Source audit, causal profiler pass, two passing design receipts, and an execution-ready plan |

Open risks:

- No planning decision remains open. The native-behavior and final-production
  performance risks are explicit fail-closed execution gates, not accepted
  claims.
