# External text execution

Objective:
Replace the schema-level editable-island exception with a reusable Plite
external-text view. One canonical Plite `Text` owns content, selection, history,
composition, collaboration projection, and decorations while an adapter owns
its DOM and layout.

Completion threshold:
All three accepted phases are complete. The removed schema category has no live
source or current-doc consumer. The external-text runtime passes its model,
browser, API, lifecycle, and 30-cell frozen performance contracts without a
CodeMirror dependency or a weakened budget.

Verification surface:
Run proof from `/Users/zbeyens/git/plate-2`: focused core and React tests,
public-type contracts, strict `pnpm check:plite`, the five-project browser
matrix, docs and generated-registry checks, the benchmark target registry,
focused Ultracite, source scans, and the production external-text benchmark.
Inspect `/examples/plite/external-text` with Browser for real DOM, input,
selection, history, multi-view, decoration, named-root, read-only, console, and
network behavior.

Constraints:
- Breaking Plite APIs and internal architecture were allowed.
- Keep true voids, native editable nodes, native controls, named roots, and
  document virtualization.
- Do not add CodeMirror, Plate code-block integration, line nodes, a second
  document or history owner, per-block subscriptions, fixed-height layout, or
  viewport-only token wrappers.
- Do not weaken frozen correctness or latency limits.
- Do not delegate, switch branches, create worktrees, commit, push, open a PR,
  or write to external trackers.

Boundaries:
- Public entry: `slots.externalText({ adapter, ariaLabel, config? })` from
  `plitejs/react`.
- Supported node: a non-void, non-inline, non-atom element containing exactly
  one `Text`. Rich children and partial marks stay in native Plite DOM.
- Canonical owner: Plite document, selection, history, composition, decoration,
  and collaboration-change paths.
- View owner: one controller per `Editable`, a root-bound DOM coverage session,
  and adapter-owned native state, DOM, layout, accessibility, find, and print.
- Document virtualization remains an independent rendering mode. External text
  is a block-level view boundary, not generic in-block virtualization.
- The textarea example proves the adapter contract; it is not a code editor or
  a CodeMirror performance claim.

Blocked condition:
Closure is forbidden if canonical text or selection drifts, an event is handled
twice, stale writes are accepted, views share coverage state, lifecycle counts
leak, native follow-up input fails, generated public artifacts drift, or any
frozen benchmark cell fails.

Task source:
- Type: accepted Plite architecture plan.
- Source: `docs/plans/2026-09-03-editable-island-substrate-closure.md`.
- User authority: “go all” after accepting a maximum of three phases with a
  checkpoint after each phase.
- Root cause: a schema noun was encoding a React rendering workaround. That
  coupled document semantics to one view and could not safely support multiple
  projections of the same canonical text.

Decision:
Cut editable-island. Keep a small external-text protocol in Plite and let
specialized editors implement adapters later. Do not embed CodeMirror in the
kernel and do not pretend a textarea is a code editor. This gives Plite the
missing ownership boundary without rebuilding a code editor or mixing it with
document virtualization.

Explicit requirements:
- [x] Execute all Plite gaps for the external editable-text strategy.
- [x] Use no more than three dependency-ordered phases and stop at a failed
      checkpoint until the owning issue is repaired.
- [x] Permit public breaks and deep rearchitecture.
- [x] Remove the editable-island schema kind and editor-global coverage API.
- [x] Preserve true voids, embedded controls, named roots, native text, and
      explicit document virtualization.
- [x] Keep partial marks and rich children in native Plite DOM.
- [x] Keep adapter layout unrestricted; require no fixed item height.
- [x] Add no CodeMirror dependency, adapter, implementation, or demo.
- [x] Add no Plate code-block integration or collaboration transport rewrite.
- [x] Add no line nodes, duplicate model/history, per-block subscriptions, or
      ordinary viewport-only token wrappers.
- [x] Add a small textarea external-text example with native and external views
      of the same document.
- [x] Benchmark before choosing the target, then benchmark the final production
      runtime across all frozen text, mark, code, block, view, splice, and
      decoration cohorts.
- [x] Deliver source, tests, docs, generated artifacts, benchmark receipts,
      Browser proof, limitations, and a mechanically complete goal ledger.
- [x] Keep this task local and send no messages or work to another task.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Requirements captured | yes | Scope, exclusions, stop laws, proof, and final deliverables are enumerated above. |
| Architecture evidence | yes | Existing Plite ownership plus local ProseMirror, Lexical, CodeMirror, and Wordgard research informed the accepted plan. |
| Hard-cut counterfactual | yes | Delete the schema category; retain only a view protocol because canonical text must support non-Plite DOM. |
| Performance packet frozen | yes | 30 cohorts, exact correctness counters, and latency limits were registered before the final target run. |
| Browser surface selected | yes | Raw `/examples/plite/external-text` plus existing void, root, native, staged, and virtualized examples. |
| Release artifact selected | no | `plitejs` is absent from local `main`, and no release, commit, push, or PR was authorized. |
| External tracker selected | no | This is local architecture execution with no authorized external write. |
| Agent-native review selected | yes | Public action, source slot, runtime owner, example, docs, generated output, and proof route were traced; no gap remained. |

Work Checklist:
- [x] Phase 1 removes schema-owned editable-island behavior.
- [x] Phase 1 introduces root-bound, independently disposable DOM coverage
      sessions and preserves true void/root behavior.
- [x] Phase 1 adds the private UTF-16 splice projector with exact model tests.
- [x] Phase 2 exposes the typed external-text slot and adapter actions.
- [x] Phase 2 centralizes external views under one controller per `Editable`.
- [x] Phase 2 routes input, directed selection, composition, undo/redo, remote
      changes, decorations, read-only state, schema invalidation, and errors
      through canonical owners.
- [x] Phase 2 proves multiple views, independent editors, moves, replacement,
      removal, plain-text dropout, cleanup, and stale-write rejection.
- [x] Phase 2 preserves cross-boundary selection and native follow-up input.
- [x] Phase 2 separates insertion coverage from layout coverage so hidden
      content remains out of DOM layout while selection insertion stays valid.
- [x] Phase 2 coalesces synchronous node-bind exports while preserving a
      trailing frame export for caret scrolling.
- [x] Phase 3 adds the textarea example, navigation entry, browser contracts,
      and current-state docs.
- [x] Phase 3 exports public types and regenerates API references, registry
      payloads, and package barrels.
- [x] Phase 3 registers the production benchmark and its correctness command.
- [x] Strict Plite, all five browser projects, docs, generated output, lint,
      doctrine version, target registry, source scans, and final benchmark pass.
- [x] Release artifact is not applicable because the package is absent from
      local `main` and no release was requested.
- [x] `autoreview` is not applicable because repo instructions prohibit it on
      `next`; agent-native review and direct source/test/browser review passed.
- [x] No environment-reset command was needed; failures matched changed code and
      were repaired at their owners.
- [x] No branch, commit, push, PR, or tracker mutation was performed.
- [x] Final evidence, limitations, fingerprints, and reboot state are recorded.

Phase / pass table:

| Phase | Status | Checkpoint result |
| --- | --- | --- |
| 1. Delete the schema exception and localize DOM coverage | complete | Core, DOM, schema, true-void, root, and splice contracts passed. |
| 2. Build the canonical external-text runtime | complete | Model, history, selection, composition, multi-view, lifecycle, browser, and frozen scale gates passed. |
| 3. Publish the contract and close proof | complete | Example, exports, docs, generated output, strict checks, five-project matrix, and 30-cell benchmark passed. |

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Canonical correctness | yes | Local, remote, history, selection, composition, read-only, stale/error, and native follow-up cases pass. |
| View isolation and cleanup | yes | Multiple views and independent editors retain separate coverage; mount/destroy and listener counters balance. |
| Public API and inference | yes | `plitejs/react` contract and negative type tests pass without callback annotations at call sites. |
| Existing behavior | yes | `pnpm check:plite` and the full browser matrix pass, including hidden-content and caret-scroll regressions. |
| Performance | yes | Production benchmark reports `plite_external_text_pass=1`; all 30 frozen cohorts pass. |
| Docs and generated output | yes | Docs parity, API reference check, both registry modes, 365 canonical payloads, 15 overlays, and `pnpm brl` pass. |
| Current-source audit | yes | No live editable-island identifier, debug statement, CodeMirror dependency, or CodeMirror adapter exists in the scoped source. |
| User-facing Browser proof | yes | Raw example passed typing, undo/redo, selection, two-view identity, decorations, named-root, read-only, zero console warnings/errors, and fourteen successful requests. |
| Release and tracker | no | No release artifact or external mutation is authorized for this local package work. |

Implementation result:
- `DOMCoverage.create(editor)` returns a view-local session bound to one root.
  Coverage tokens cannot collide across mounted views and are disposed with the
  owning view.
- The private text projector emits UTF-16 splices from canonical changes. It
  never becomes a second text model.
- `slots.externalText` matches eligible exact-one-`Text` elements. Its adapter
  receives projected text, directed selection, decorations, read-only state,
  and canonical action callbacks, never editor/path escape hatches.
- One external controller per `Editable` owns subscriptions and fans changed
  keys to mounted views. Blocks do not subscribe independently.
- The commit fence publishes text and decorations together. Schema identity,
  node replacement, removal, and domain dropout invalidate the view rather than
  applying stale state.
- DOM selection fallback uses explicit model-owned coverage at external/native
  boundaries. Ordinary partial DOM is still rejected.
- Synchronous node binds collapse into one microtask, then schedule a trailing
  frame export. This removes mount fan-out without breaking caret scrolling.

Verification evidence:
- `pnpm check:plite`: pass; 85 source-first typechecks, package/contract tests,
  232 Node proof contracts, 25 Bun benchmark contracts, 49 benchmark targets,
  and Chromium browser proof with 734 passed, 8 skipped, 81 bounded batches.
- `pnpm check:plite:browser-matrix`: pass. Chromium 734 passed/8 skipped;
  Firefox 627/115; mobile viewport 340/402; WebKit 648/94; mobile WebKit 2/0.
  All declared skips remained expected.
- Focused rich-text replay after the scheduler repair: 2 passed, 0 skipped for
  both scrollable-editor caret-visible cases.
- `pnpm --filter www check:docs`: pass. API reference and source parity match.
- Production and development registry builds: pass; 365 canonical payloads and
  15 sparse overlays materialized in each mode.
- `pnpm brl`: 4 package tasks passed.
- Focused Ultracite: 1,655 matched files formatted and linted with no finding.
- Unslop: the owning external-text page and this ledger have zero findings.
  Remaining audit candidates are the docs site's established title-case
  headings or an unchanged Vision sentence; each was reviewed and retained.
- Plate Next doctrine validation: v139 valid, 2 active and 44 retired entries.
- Benchmark registry: 49 targets valid.
- `git diff --check`: pass.
- Scoped current-source scan: zero editable-island identifier hits and zero
  debug statements. The sole CodeMirror text is a benchmark disclaimer that
  explicitly rejects a CodeMirror performance claim.
- Browser inspection of `/examples/plite/external-text`: exact typing,
  undo/redo, native/external text identity, two independent projections, no
  duplicate canonical text DOM, decoration count 2/2, named root, read-only,
  zero console warnings/errors, and fourteen HTTP 200 requests.

Benchmark evidence:
- Artifact: `tmp/plite-external-text-browser.json`.
- Environment: production bundle, Chromium 149.0.7827.55 on Darwin, five mount
  samples and twenty operation samples after one discarded warmup.
- Result: `plite_external_text_pass=1`; 30/30 cells pass with no evaluation
  failure.
- Source receipts: baseline bundle
  `64fe9a868d69ecfdbbab6ce670348f490ed625e31ba84a08a5240d6dd803731a`;
  target bundle
  `64fb224fb148ae55d986c833b709482c6b887a5adbf6ea1d680c7f58227515b2`.

Final fingerprints:
- Production owners:
  `6a64716c88e44c4570dea6024c9ce3b63d84d3f47755214e37f32661604aa051`.
- Package and browser tests:
  `f4ca62cf89cc90facf557a7f0a905041a94731730fa3bb299923f2b39806ad40`.
- Example and route registry:
  `dd52299abb2f80f1fa7bc005ce48b3bd932cfe95f1f668c11986b2431147fdea`.
- Benchmark and selection-proof harness:
  `eb6cd76a78cdfc36505bbd4b34faabeb0820cdc83e74281cbb5093d518684ec9`.
- Current docs and Vision:
  `748d08c2a97bbd3c888cb3ec08fc9e439e4c6a147fa56562b8cb96a84df9d9dc`.
- Final benchmark artifact:
  `62b4685151379df02b017dbd24ec3d063ec1161bca2b1a76c87e8f6cc4fd12cd`.

| Cohort | Cold mount p95 | Warm mount p95 | Local action-to-frame p95 |
| --- | ---: | ---: | ---: |
| Plain 100,000 lines / one view | 23.9 ms | 15.5 ms | 9.2 ms |
| Whole-marked 100,000 lines / one view | 23.4 ms | 14.9 ms | 9.1 ms |
| Code 100,000 lines / one view | 20.9 ms | 16.3 ms | 8.7 ms |
| 1,000 blocks / one view | 74.1 ms | 49.6 ms | 8.8 ms |
| 1,000 blocks / two views | 84.3 ms | 62.9 ms | 8.3 ms |
| 1,000 blocks / four views | 138.4 ms | 104.0 ms | 8.3 ms |
| Code 100,000 lines / 100-splice batch | 36.6 ms | 8.6 ms | 55.3 ms |
| Code 100,000 lines / 1,000-splice batch | 23.7 ms | 16.8 ms | 515.2 ms |
| Code 100,000 lines / 40,000 sparse decorations | 42.8 ms | 22.7 ms | 23.1 ms |
| Code 100,000 lines / 30,000 overlapping decorations | 43.7 ms | 21.0 ms | 17.7 ms |

Performance interpretation:
Long text mount and ordinary local, remote, and selection work stay bounded
because Plite delivers the canonical string reference once, then exact patches;
the benchmark adapter keeps its own DOM sample to 4,096 code units.
The 1,000-block/four-view cold result has only 11.6 ms of headroom under its
150 ms veto, so it is green but not luxurious. A 1,000-splice transaction takes
515.2 ms because it is an intentional bulk batch over a 4.9 MB canonical text;
that result must not be advertised as one-character typing latency.

Repair record:
- The first full target run hit 152.1 ms for 1,000 blocks and four views. A
  profile found repeated selection-export scheduling on synchronous node binds.
- The first coalescing form used a leading frame and broke two caret-scroll
  cases. The final form coalesces binds in a microtask and retains a trailing
  frame; exact replay and the full matrix pass.
- A hidden-content regression showed one DOM-claim hook was serving insertion
  and layout. Separate claims preserve off-DOM layout while allowing explicit
  model-owned selection insertion.

Public documentation:
- `content/docs/plite/libraries/plite-react/external-text.mdx` owns the public
  contract, eligible domain, adapter responsibilities, lifecycle, and limits.
- Editable, DOM coverage, selection/DOM, DOM library, editor API, React index,
  proof-map, metadata, and Plite Vision pages point to the same owner.
- Docs describe the current contract only. They do not promise CodeMirror,
  viewport token materialization, or generic in-block virtualization.
- Unslop review covers every touched external-text doc and this ledger while
  preserving API names, commands, numbers, and source claims.

Final handoff:
- Outcome: all three accepted phases are implemented locally.
- Architecture: external text is a view protocol over canonical Plite state,
  not a document node kind and not a bundled code editor.
- Example: a textarea proves adapter ownership with native and external views
  of the same document.
- Proof: strict package, five browser projects, docs/generated output, lint,
  target registry, source audit, interactive Browser, and 30-cell benchmark are
  green.
- Git/release state: local uncommitted work only; no branch, commit, push, PR,
  release, or tracker update was performed.

Reboot status:
Complete. A resumed task should read this ledger and the final benchmark JSON;
no implementation or verification item remains open.

Open risks:
- The textarea adapter is contract proof, not a production code editor. A later
  CodeMirror adapter needs its own integration and browser/performance packet.
- The 1,000-block/four-view cold mount is 7.7% below its cap; future scheduler
  or mount work can erase that margin.
- App adapters own accessibility details, browser find, printing, and visual
  layout. Plite cannot guarantee those without adapter-specific proof.
- Automated composition coverage does not prove every physical IME or real
  mobile device. No raw-device claim is made.
- The exact-one-`Text` restriction is deliberate. Rich children and partial
  marks remain native until a different canonical projection law is justified.
- Bulk 1,000-splice latency is hundreds of milliseconds. It is acceptable for
  the frozen batch lane, not interactive keystrokes.
