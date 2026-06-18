# Slate v2 synced content roots

Objective:
Close the Slate v2 Synced Blocks / document-flow content-root architecture plan
for user review. The plan must define how a root-editor node renders an editable
same-runtime child or shared root, how a Notion-style `Synced Blocks` example is
added, how focus/selection/history stay one-runtime, and what proof gates are
required before implementation can claim the UX behaves like ordinary sibling
blocks.

Goal plan:
docs/plans/2026-05-26-slate-v2-synced-content-roots.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- slate-plan

Completion threshold:
- Slate Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md`
  passes.
- Planning closure does not implement `Plate repo root`. Execution requires a
  later explicit accepted-plan invocation.

Verification surface:
- Planning artifact: this file and any issue/reference/research rows under the
  Slate Plan allowed edit scope.
- Live source grounding: `Plate repo root` reads for roots data, `contentRoot`,
  root view registration, content-root navigation, current editable-voids
  example, examples route registration, and Playwright coverage.
- Future implementation gates: focused package tests for `slate` and
  `slate-react`, route typecheck, a new `/examples/synced-blocks` Playwright
  file, the existing editable-voids route rows, and a repeated/shared-root
  stress row.

Constraints:
- Planning mode only. Do not patch `Plate repo root` implementation, examples,
  tests, or package exports before explicit user acceptance and a later
  execution invocation.
- Keep default voids legacy-like and atomic. Do not make every void navigable or
  root-backed.
- Keep raw Slate unopinionated. Notion-like chrome can live in the example;
  Slate owns the substrate, not workspace permissions or product sync UI.
- Prefer the best long-term architecture over a local example hack.

Boundaries:
- Allowed planning edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`, and
  `docs/slate-v2/references/**`.
- Live source read workspace: `Plate repo root`.
- Target execution files, not edited in planning mode:
  `apps/www/src/app/(app)/examples/slate/_examples/synced-blocks.tsx`,
  `apps/www/src/app/(app)/examples/slate/[example].tsx`,
  `apps/www/constants/examples.ts`,
  `apps/www/src/app/(app)/examples/slate/_examples/custom-types.d.ts`,
  `packages/slate-react/src/components/editable-text-blocks.tsx`,
  `packages/slate-react/src/hooks/use-slate-runtime.tsx`,
  `packages/slate-react/src/editable/content-root-navigation.ts`,
  and `apps/www/tests/slate-browser/donor/examples/synced-blocks.test.ts`.

Blocked condition:
- Block only if current source, required ledgers, or a user-owned boundary become
  unavailable and no source-grounding, ledger, research, or plan-hardening move
  remains runnable.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none - plan is ready for user review; execution requires explicit
  user acceptance and a later Slate Plan execution invocation
- final_handoff_status: emitted

Current verdict:
- verdict: revise the current content-root primitive into a first-class
  document-flow slot API, then add a new `Synced Blocks` example that proves
  shared-root projections rather than independent nested editors.
- confidence: 0.92 final.
- keep / cut / revise call: keep one runtime editor and keyed roots; keep
  `contentRoot: { slot: string }`; make `props.slots.contentRoot('body',
  options)` the canonical React DX; keep `<ContentRoot />` out of the canonical
  example unless later pressure proves component sugar is worth the extra API;
  add active projection/view identity before claiming multiple mounts of the
  same root are production-correct; cut one-editor-per-block and mirrored-root
  sync as the canonical substrate.
- reason: live Slate v2 already stores document roots in one value and has
  same-runtime root views, content-root metadata, root lifecycle helpers, and
  browser rows for editable-void child roots. The remaining hard part is DX and
  ambiguity when the same root is mounted in more than one place: current
  `getMountedViewEditor(root)` returns a single arbitrary root view from a set,
  which is not enough for Notion-style repeated synced blocks.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Slate Plan completion
  gate below is satisfied and the checker command passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `slate-plan` loaded from `.agents/skills/slate-plan/SKILL.md`. |
| Active goal checked or created | yes | Active goal `019e5f10-3661-7312-a67b-66daf0a1aa99` targets this plan and keeps one pass per activation. |
| Source of truth read before edits | yes | Latest user request plus Notion screenshot/excerpt; active plan scaffold; live `Plate repo root` source reads below. |
| `docs/solutions` checked for non-trivial existing-code work | yes | `docs/solutions/developer-experience/2026-05-17-slate-v2-extension-composition-hard-cuts-need-creation-time-inference-and-browser-proof.md:169` warns browser rows catch stale root/runtime calls typecheck misses. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Recorded under Current-state source facts and Verification evidence. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected: this activation completed only
      the closure score and final gates pass; earlier passes completed current-state
      read, related issue discovery, full issue-ledger scan, intent/boundary
      decision brief, ecosystem refresh, pressure passes, maintainer objections,
      high-risk deliberate mode, ecosystem maintainer pressure, revision, and
      issue/reference sync accounting.
- [x] Live source grounding recorded for every current implementation claim in
      this pass.
- [x] Issue ledger / ClawSweeper pass applied or skipped with concrete evidence:
      related discovery completed in pass 2; full ledger, cluster, candidate,
      package-impact, benchmark, and requirements scan completed in pass 3 with
      no new fixed/improved claims.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Slate maintainer objection ledger complete for every breaking/paradigm
      change.
- [x] Verification workspace gate recorded for every Slate v2 source, runtime,
      browser, package, public API, or issue-fix claim.
- [x] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A with reason: planning mode changed no behavior; the execution plan
      names the first failing public behavior rows.
- [x] Browser proof captured for browser-surface claims, or marked N/A with
      reason: planning mode makes no browser-behavior claim; it defines the
      required `/examples/synced-blocks` proof gates for execution.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan. | final checker run recorded under Verification evidence |
| Slate v2 source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `Plate repo root` command/proof or mark as planning-only with reason. | source reads and verification workspace rows recorded; behavior proof is planning-only N/A because no implementation changed |
| Issue ledger or PR reference changed | yes | Sync the relevant ledger/reference row or record why no sync applies. | pass 11 synced `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, `docs/slate-v2/ledgers/issue-coverage-matrix.md`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, and `docs/slate-v2/references/pr-description.md`; no fixed/improved claim count changed |
| Autoreview for uncommitted implementation changes | no for passes 1-11 | Planning-only; no implementation patch. | N/A for passes 1-11 |
| Final user-review handoff | yes | Emit final handoff or keep the plan pending with the next pass. | emitted in this plan and final response |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md`. | final run recorded under Verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Live source/test reads for roots data, tx root lifecycle, content-root spec/hooks, current editable-voids example, root view registry, navigation strategy, route registry, and browser rows; initial score 0.74. | related issue discovery |
| Related issue discovery | complete | Ledger/cache-first ClawSweeper pass reused the 2026-05-25 content-root and vertical-navigation accounting for `#5212`, `#2072`, `#5524`, and `#6034`; added same-root projection pressure from `#5874`, `#6016`, `#5537`, and `#5117` as related/non-claim only. No live GitHub read and no ledger write were needed because claim text/status stays unchanged. | issue-ledger pass |
| Issue-ledger pass | complete | Full pass scanned the macro clusters, package-impact matrix, requirements, benchmark candidate map, open/live ledgers, v2 sync ledgers, fork dossier, PR reference, and relevant test-candidate maps. It widened related/non-claim coverage to mobile/IME, clipboard/drop, perf, collaboration/history, accessibility, and package ownership without adding fixed/improved claims. | intent/boundary pass |
| Intent/boundary and decision brief | complete | Pass 4 froze the canonical DX as `props.slots.contentRoot(...)`, split the vocabulary between content-root elements, editable islands, and Synced Blocks, assigned active projection identity to runtime-local view state, and resolved copy/unsync as example-local commands. | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Pass 5 read local ProseMirror, React ProseMirror, Tiptap, Lexical, React 19.2 research, Plate plugin, slate-yjs, and prior multi-root solution sources. It confirmed the slot/render-shell direction, rejected nested independent editors as the shared-state substrate, and turned root-qualified selection/history/collab into migration pressure. | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Applied Vercel React, performance-oracle, performance, tdd, shadcn, and react-useeffect lenses as planning constraints. Added repeated-projection budget, cohort, selector-fanout, browser proof, TDD order, migration, and simplicity deltas without implementation edits. | objection ledger |
| Slate maintainer objection ledger | complete | Expanded and closed the maintainer-objection ledger for content-root slot DX, same-root multiple projections, active projection identity, default void semantics, Notion-style example scope, root lifecycle/orphan policy, collaboration/history, and perf/browser proof. All accepted rows carry execution gates instead of claiming implementation done. | high-risk pass |
| High-risk deliberate mode | complete | Stress-read the chosen plan against wrong-copy focus, root lifecycle/orphan semantics, rootless selection inheritance, operation-root middleware, hidden perf tax, default void leakage, browser proof gaps, and slate-yjs/history boundaries. Added hard execution gates and rejected any completion path that relies on focus-only tests or route smoke tests. | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Re-read ProseMirror, React ProseMirror, Tiptap, Lexical, slate-yjs, React selector/runtime, and local research sources as if their maintainers were reviewing the plan. It preserved the slot/root architecture and added stricter render-phase, effect-phase, active-projection, and slate-yjs non-claim gates. | revision pass |
| Revision pass | complete | Folded the accepted deltas into a review-ready plan shape: scorecard now meets the planning threshold, TDD/browser are explicitly planning-only N/A, and final handoff outline is filled. | issue sync accounting |
| Issue sync accounting | complete | Synced the reviewed surface into the manual gitcrawl sync ledger, issue coverage matrix, fork dossier, and PR description reference. The sync records Synced Blocks as related/non-claim planning only, with zero new fixed or improved issue claims. | closure score and final gates |
| Closure score and final gates | complete | Final score is 0.92 with no dimension below 0.85; all pass rows are complete; issue/reference sync is current; planning-only TDD/browser gates are explicit; final handoff is emitted; checker run is recorded under Verification evidence. | none |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.92 | One runtime with many root views remains the cheap direction: roots live in one `EditorDocumentValue` at `packages/slate/src/interfaces/editor.ts:89`, mounted views are tracked by root in `packages/slate-react/src/hooks/use-slate-runtime.tsx:348`, and current selector hooks already support root/runtime-scoped subscriptions at `packages/slate-react/src/hooks/use-slate-runtime.tsx:639`. Revision keeps perf honest: no render-time root mutation, no effect-created document roots, no perf claim before selector fanout and 20/100 projection stress rows. |
| Slate-close unopinionated DX | 0.20 | 0.93 | `contentRoot: { slot: string }` exists at `packages/slate/src/interfaces/editor.ts:513`, renderers receive `slots` at `packages/slate-react/src/components/editable-text-blocks.tsx:521`, and ProseMirror/Tiptap source confirms the wrapper/content split. Revision reduces the public API to one canonical call site: `props.slots.contentRoot('body', options)`, with `useSlateContentRoot` kept as the escape hatch and `<ContentRoot />` rejected for now. |
| Plate and slate-yjs migration backbone | 0.15 | 0.92 | One operation stream plus `tx.roots.create/replace/delete` at `packages/slate/src/interfaces/editor.ts:249` is the right backbone. Revision makes the migration split explicit: root keys are content identity, projection ids are runtime-local, root deletion is explicit, history focus must be projection-aware, and current slate-yjs remains a non-claim because it exposes one `sharedRoot`. |
| Regression-proof testing strategy | 0.20 | 0.89 | Existing editable-voids browser rows cover horizontal root boundaries, vertical boundaries, and click-outside focus at `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts:379`, `:787`, and `:910`; prior solution notes add wrong-root selection, operation-root middleware, and false-green browser proof failures. Revision keeps route behavior unclaimed but makes the proof matrix concrete enough for execution: shared edit, active-copy undo/redo, ArrowUp/Down, click outside, placeholder, clipboard/move, delete/range delete, selector fanout, and editable-void regressions. |
| Research evidence completeness | 0.15 | 0.95 | Passes 5 and 9 checked local ProseMirror, React ProseMirror, Tiptap, Lexical, slate-yjs, React selector/runtime, Plate, and research docs. Every external source still points to the same decision: Slate model/ops plus React slot/root projection, not nested independent editors or mirrored roots. |
| shadcn-style composability and minimalism | 0.10 | 0.93 | Existing `EditableElementSlots` only exposes `unstableBoundary` at `packages/slate-react/src/components/editable-text-blocks.tsx:415`. Revision keeps the public surface minimal: one content-root slot, active projection runtime state, route-local copy/unsync, no product DSL, no Plate wrapper in raw Slate, and no canonical `<ContentRoot />`. |

Weighted score after pass 11: 0.92.

Reviewer-ready summary:
- Build Synced Blocks as content-root block projections, not editable voids and
  not nested independent editors.
- The root editor stores owner blocks in the main root; each owner block points
  `childRoots.body` at a keyed content root. Multiple owners may point at the
  same root key.
- React DX is `props.slots.contentRoot('body', options)`. The slot internally
  wires root lookup, root chrome, nested `Editable`, DOM coverage, placeholder,
  and active projection registration.
- Active projection identity is runtime-local view state. Root key answers what
  content is being edited; projection identity answers which mounted copy gets
  DOM focus.
- Duplicate and unsync are example-local commands that prove root identity:
  duplicate creates another owner pointing at the same root; unsync clones the
  body root and updates only that owner.
- Default voids stay atomic. Only content-root elements get document-flow
  navigation.
- Current slate-yjs support is not claimed. The future adapter needs a
  root-keyed shared type map plus root-qualified selection/history/cursors.

Source-backed architecture north star:
- target shape: a root editor contains a normal app-defined block node that
  projects an editor-owned content root. Synced copies can point at the same
  root key, so edits are shared by data identity, not by mirroring.
- source evidence: current `InitialValue` accepts `roots: Record<RootKey, V>` at
  `packages/slate/src/interfaces/editor.ts:94`; current element
  specs can declare `contentRoot: { slot: string }` at
  `packages/slate/src/interfaces/editor.ts:523`; current child
  roots are stored on `element.childRoots[slot]` by convention in
  `packages/slate-react/src/hooks/use-slate-child-root.ts:37`.
- rejected drift: do not create one editor per block; do not model Synced Blocks
  as copied mirror roots by default; do not redefine all voids as navigable;
  do not force users to hand-wire every root mount in examples.
- migration posture: raw Slate exposes the root projection primitive and a small
  React slot; Plate can wrap this into richer synced-block UI later.

Current-state source facts:
| Surface | Current source | Fact | Plan implication |
|---------|----------------|------|------------------|
| Root value model | `packages/slate/src/interfaces/editor.ts:87` | Roots are keyed strings in `EditorDocumentValue.roots`. | Keep keyed roots; ordering belongs to owner nodes in parent roots. |
| Root lifecycle API | `packages/slate/src/interfaces/editor.ts:249` | Transactions expose `tx.roots.create`, `delete`, and `replace`. | Synced Blocks can create or duplicate body roots without raw op replay. |
| Content-root schema | `packages/slate/src/interfaces/editor.ts:513` | `contentRoot.slot` is schema vocabulary; actual root key is document data. | Correct substrate for synced block body. |
| Current editable section data | `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:91` | Initial value stores `main` plus separate child body roots. | Example already teaches same-runtime roots, but not shared copies. |
| Current content-root specs | `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:137` | Both example node types declare `contentRoot: { slot: 'body' }` and `void: 'editable-island'`. | Synced Blocks should use the content-root axis, but should not teach mixed-control islands as the only model. |
| Current root render DX | `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:227` | `EditableSection` calls `useSlateContentRoot(element)` and renders `<Editable root={root}>`. | This works, but it is too complex for the canonical Synced Blocks DX. |
| Current mixed island DX | `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:243` | `EditableVoid` calls `useSlateChildRoot`, `useSlateRootChrome`, then renders `<Editable root={bodyRoot}>` beside native inputs. | Keep this as lower-level/mixed island proof, not the ideal synced-block call site. |
| Root view registry | `packages/slate-react/src/hooks/use-slate-runtime.tsx:348` | Runtime tracks `Map<RootKey, Set<ReactRuntimeEditor>>`. | Multiple mounts per root are structurally possible. |
| Mounted view lookup gap | `packages/slate-react/src/hooks/use-slate-runtime.tsx:386` | `getMountedViewEditor(root)` returns the first editor in a root's set. | Synced Blocks need active projection/view identity before duplicate root mounts are safe. |
| Content root helper | `packages/slate-react/src/hooks/use-slate-content-root.ts:25` | Helper resolves slot and returns `{ chrome, root }`. | Good low-level API; example DX should be one call or one slot. |
| Root chrome | `packages/slate-react/src/hooks/use-slate-root-chrome.ts:26` | Root chrome wires mouse focus and selection restore for a root. | Reuse internally for root-content slots. |
| Render slots today | `packages/slate-react/src/components/editable-text-blocks.tsx:415` | `EditableElementSlots` exists but only exposes `unstableBoundary`. | Best DX likely extends slots with a `contentRoot` renderer. |
| Void render contract today | `packages/slate-react/src/components/editable-text-blocks.tsx:529` | `renderVoid` receives only `{ element }`. | Synced Blocks should use `renderElement`, not `renderVoid`, if they need clean slot DX. |
| Navigation implementation | `packages/slate-react/src/editable/content-root-navigation.ts:443` | Navigation classifies Enter, horizontal arrows/delete, and vertical arrows for content roots. | Existing bridge is valuable but must be proven on the new route. |
| Keyboard integration | `packages/slate-react/src/editable/keyboard-input-strategy.ts:341` | Keydown calls `applyContentRootNavigation` before generic caret movement. | New route can prove content-root navigation without product code. |
| Existing browser proof | `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts:787` | Chromium row checks vertical movement across current content-root boundaries. | Good floor; user-reported browser breakage means Synced Blocks needs route-specific browser proof, not trust in generic code. |
| Example route registry | `apps/www/src/app/(app)/examples/slate/[example].tsx:18` | Examples are explicitly imported by route key. | Execution must register `synced-blocks`. |
| Example nav registry | `apps/www/constants/examples.ts:11` | Examples list drives the visible index. | Execution must add `['Synced Blocks', 'synced-blocks']`. |

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Synced content node | App-defined block element with `contentRoot: { slot: 'body' }`; node data stores `syncId` and `childRoots.body`. | A Synced Block is just another root-editor node. Its body root is projected in place. | Existing void users do not move. Existing child-root examples still work. | Current `EditorElementContentRootSpec` at `packages/slate/src/interfaces/editor.ts:513`. | target |
| Root projection DX | Add stable render slot: `props.slots.contentRoot('body', options)`. Do not teach `<ContentRoot />` as the canonical API. | Example renderer shows a shell plus one content slot, not hook plumbing. | `useSlateContentRoot` remains lower-level escape hatch; component sugar can be reconsidered later if a repeated public call site proves it. | Existing `EditableElementSlots` at `packages/slate-react/src/components/editable-text-blocks.tsx:415`, slot creation at `:424`, and `slots` passed to renderers at `:521`. | chosen |
| Shared synced copy | Multiple owner nodes may point at the same `childRoots.body` root key. | Editing either copy mutates one shared body root; every mounted projection renders the same data. | No mirror/diff sync layer. | Root view set supports many views per root at `packages/slate-react/src/hooks/use-slate-runtime.tsx:348`. | target with active-view gate |
| Unsync | `tx.roots.create(newRoot, clone old body); tx.nodes.set({ childRoots: { body: newRoot } })` on one owner. | Breaks a copy into an independent root. | Raw example should include `Duplicate synced block` and `Unsync this copy` as example-local commands, because they prove the data model without making Slate own Notion permissions. | `tx.roots.create` exists at `packages/slate/src/interfaces/editor.ts:249`. | chosen example action |
| Default voids | No change. | Images, embeds, inline voids stay atomic. | Preserves legacy-like behavior. | Previous plan decision in `docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md:397`. | keep |

Vocabulary boundary:
| Term | Meaning | Owns | Does not mean |
|------|---------|------|---------------|
| Content-root element | App-defined element whose schema has `contentRoot: { slot }` and whose node data points `childRoots[slot]` at a root key. | Raw Slate substrate. | Not a product sync feature by itself. |
| Root-backed editable block | User-facing phrasing for a content-root element that renders only an editable document body. | Slate example/docs wording. | Not every void; not a nested independent editor. |
| Editable island | Mixed app/native-control void that also has a child root. | Low-level escape hatch and regression proof. | Not the canonical document-flow Synced Blocks example. |
| Synced Block | Example/product pattern where multiple owner nodes point at the same content root. | Example-local chrome plus raw root projection primitive. | Not cross-workspace permissions, server sync, or mirrored roots. |

Canonical slot call-site:

```tsx
const SyncedBlock = (props: RenderElementProps<SyncedBlockElement>) => (
  <section {...props.attributes} data-slate-synced-block>
    <SyncedBlockToolbar contentEditable={false} element={props.element} />
    {props.slots.contentRoot('body', {
      ariaLabel: 'Synced block content',
      className: syncedBlockBodyCss,
      placeholder: 'Empty synced block',
    })}
  </section>
)
```

Why this wins:
- It keeps the renderer as the single owner of product chrome.
- It gives Slate React enough context to consume or cover the owner node's
  placeholder children internally.
- It avoids forcing users to import a component and hope element context is
  available.
- It lets the slot wire `useSlateContentRoot`, root chrome, nested `Editable`,
  placeholder, DOM coverage, and active projection registration behind one
  public call.
- It keeps `useSlateContentRoot` for advanced users without teaching that hook
  stack as the default.

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Root storage | `slate` value/runtime | One `roots` map remains the canonical content store. Owner element path defines projection order. | Ordered root arrays and duplicate content copies. | `packages/slate/src/interfaces/editor.ts:89`. | keep |
| Root projection registry | `slate-react` runtime | Track root views by root and projection instance. Projection id is runtime-local and derived from mounted owner runtime id plus slot/root, not stored in the document. `getMountedViewEditor(root)` needs active-projection preference or an explicit projection-aware lookup. | Focusing an arbitrary mounted copy when the same root appears twice. | Current first-view lookup at `packages/slate-react/src/hooks/use-slate-runtime.tsx:386`. | chosen |
| Selection | `slate` selection + `slate-react` DOM bridge | Selection stays root-qualified; active projection is view-local UI state. Root selection answers "what content"; projection answers "which mounted copy should receive DOM focus." | Persisting DOM mount identity in document value. | `rootedRange` writes root-qualified points at `packages/slate-react/src/editable/content-root-navigation.ts:136`. | target |
| History | `slate` history/runtime | Undo/redo stay one operation stream. History focus restores the active root and the last active projection for that root when available, otherwise falls back to the first mounted projection. | Independent per-block stacks and cross-copy divergence. | History focus currently asks `getMountedViewEditor(root)` at `packages/slate-react/src/hooks/use-slate-history.ts:173`. | chosen |
| Navigation | `slate-react` content-root navigation | Keep explicit bridges only for content-root elements. Add same-root duplicate projection proof. | Global cross-root ranges or default void traversal changes. | Existing navigation bridge at `packages/slate-react/src/editable/content-root-navigation.ts:980`. | keep/gate |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Synced block renderer | `return <SyncedBlockChrome {...props}>{props.slots.contentRoot('body', { ariaLabel: 'Synced block content' })}</SyncedBlockChrome>`. | Renderer owns visual chrome; Slate React owns root resolution, root chrome, DOM coverage, active projection registration, and nested `Editable` mounting. | Mount only when the owner block is rendered; subscriptions stay root-scoped. | Current `slots` prop already exists at `packages/slate-react/src/components/editable-text-blocks.tsx:521`. | chosen |
| Low-level escape hatch | `const { chrome, root } = useSlateContentRoot(element)` remains valid. | Advanced users can compose custom root surfaces. | No hidden root creation in effects. | `packages/slate-react/src/hooks/use-slate-content-root.ts:25`. | keep |
| Component sugar | `<ContentRoot slot="body" />` is not canonical. Reconsider only if real user examples repeat the same slot call enough to justify another public primitive. | Avoids extra import/API weight. | Avoids context magic and keeps owner children/coverage inside `slots`. | `useElement` context exists at `packages/slate-react/src/hooks/use-element.ts:10`, but a component would still hide renderer-local ownership. | reject for canonical DX |
| Mixed island | Current `useSlateChildRoot` + `useSlateRootChrome` + `<Editable root>` remains acceptable for app/native-control islands. | Native controls and editor content can coexist. | Do not create child roots for controls that do not need rich text. | `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:243`. | keep |
| Synced Blocks example | New `site/examples/ts/synced-blocks.tsx` should show shared root identity, duplicate, edit, and unsync with Notion-like border/top chrome. | Product chrome is example-local. | Two copies of one root should not double-subscribe unrelated parent content. | route registry at `apps/www/src/app/(app)/examples/slate/[example].tsx:18`. | add |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Product synced blocks | Root projection primitive plus active projection identity. | Plate can wrap with synced-block menus, copy/unsync UI, comments, permissions, and persistence. | Raw Slate workspace permissions or cross-page sync service. | User-provided Notion excerpt/screenshot; current Slate root primitives. | target |
| Node UI complexity | Slot-based content root renderer. | Plate can expose a richer component around raw slots. | Raw Slate does not ship Notion UI. | `EditableElementSlots` current surface at `packages/slate-react/src/components/editable-text-blocks.tsx:415`. | target |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Shared body root | Root lifecycle ops and root-qualified selection/position metadata. | Adapter maps each root key to shared content and remote cursors include root keys. | Claiming current slate-yjs supports Synced Blocks without adapter work. | Prior 2026-05-25 plan notes current slate-yjs single shared root at `docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md:478`. | gated |
| Multiple projections | Remote selections need root plus projection display policy. | Show remote cursor in every copy or active copy by product policy. | Persisting projection view ids in collaborative document state. | Current runtime view registry gap at `packages/slate-react/src/hooks/use-slate-runtime.tsx:386`. | open |

Intent / boundary record:
- intent: make same-runtime embedded documents feel like ordinary document
  blocks, and demonstrate this with a Notion-style Synced Blocks example.
- outcome: a root-editor node can render an editable content root internally;
  multiple nodes can project the same root; focus, selection, undo/redo, and
  browser navigation behave like a simple editor where the projected root sits
  in document flow.
- in-scope: raw Slate content-root substrate, render DX, route/example shape,
  active projection identity, root lifecycle, focus/selection/history routing,
  and browser proof.
- raw Slate owns: keyed roots, content-root schema vocabulary, root lifecycle
  transactions, root-qualified selection/history metadata, React projection
  mounting, active projection identity, and browser-visible editing behavior.
- raw Slate does not own: cross-workspace permissions, server sync, access
  requests, source-page ownership, Notion product menus, or current slate-yjs
  adapter compatibility.
- example owns: Notion-like border/top chrome, duplicate/copy affordance,
  unsync affordance, two synced copies, and explanatory visual labels.
- Plate owns later: synced-block menus, comments, permissions, persistence,
  workspace copy flows, and richer collaboration display policy.
- non-goals: cross-workspace permissions, server sync, Notion product parity,
  full slate-yjs implementation, and changing ordinary void semantics.
- decision boundaries: this plan may choose API shape, example route shape,
  runtime identity requirements, proof gates, and example-local copy/unsync
  behavior without asking again.
- unresolved user-decision points: none for this pass. Remote cursor projection
  policy stays a future Plate/slate-yjs adapter choice, not a blocker for raw
  Slate planning.

Decision brief:
- principles: one runtime editor; keyed roots as content identity; owner node
  path as projection order; projection identity is runtime-local; explicit
  content-root bridge only; example DX must teach the public API, not internal
  plumbing.
- top drivers: same-root duplicate projection ambiguity; developer-facing
  example simplicity; preservation of default void behavior; collaboration
  readiness; browser proof after real user-reported failures.
- viable options:
  - Option A: same root, many projections, active projection identity, rendered
    through `props.slots.contentRoot(...)`. Best long-term substrate and best
    call-site DX.
  - Option B: mirrored roots with sync commands. Easier demo; wrong substrate
    because undo, collab, selection, and conflict behavior split.
  - Option C: independent nested editors per block. Easy local mount; fails the
    shared history/selection/collab goal.
  - Option D: make default voids traversable. Too broad and regresses legacy-like
    void behavior.
  - Option E: canonical `<ContentRoot />` component. Tempting, but weaker than
    the slot because the slot already has renderer-local access to owner
    children, attributes, and DOM coverage ownership.
- chosen option: Option A.
- rejected alternatives: B, C, D, and E are rejected for canonical Slate. B and
  C can exist as app experiments. E can be reconsidered only as sugar after the
  slot API proves repetitive.
- consequences: execution must add active projection identity, a content-root
  slot API, a route example, and route-specific browser tests before claiming
  done.
- follow-ups: ecosystem synthesis, pressure passes, objection ledger, and final
  proof matrix.

Decision rows:
| Decision | Call | Why | Evidence | Revisit trigger |
|----------|------|-----|----------|-----------------|
| Canonical projection API | `props.slots.contentRoot(slot, options)` | It is renderer-local, has owner children context, can wire DOM coverage and nested `Editable` internally, and avoids a new import. | `EditableElementSlots` at `packages/slate-react/src/components/editable-text-blocks.tsx:415`; slots passed to renderers at `:521`. | If three or more real examples need identical options and component sugar stays type-clean. |
| Top-level component | Do not teach as canonical. | It hides ownership behind context and cannot naturally consume owner children without more magic. | `useElement` context exists at `packages/slate-react/src/hooks/use-element.ts:10`, but current renderer already passes slots. | Later ergonomic pass, not Synced Blocks blocker. |
| Active projection identity | Runtime-local id derived from mounted owner runtime id + content slot/root. | Same root can appear twice; root key alone answers data identity, not DOM focus target. | Current root view registry is `Map<RootKey, Set<...>>` at `packages/slate-react/src/hooks/use-slate-runtime.tsx:348`, but root lookup returns one arbitrary view at `:386`. | Browser proof shows wrong-copy focus remains after active projection state. |
| Synced Blocks route actions | Include duplicate/copy and unsync as example-local commands. | Mimics Notion's core workflow and proves shared-root versus cloned-root data. | Root lifecycle API at `packages/slate/src/interfaces/editor.ts:249`. | If route becomes too product-heavy during implementation. |
| Void semantics | Keep default voids atomic; content-root blocks are opt-in. | User asked for legacy-like voids plus a special editable-root node type. | Existing `void` kinds include `editable-island` at `packages/slate/src/interfaces/editor.ts:487`; prior plan rejected broad void traversal. | Browser proof shows content-root bridge leaks into ordinary voids. |

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| `#5212` | related/planned example and DX candidate | Synced Blocks strengthens the canonical example story, but no fixed/improved claim is allowed until the new route exists and proves shared editing, navigation, focus, and route DX. | The existing issue is about misleading editable-void/example teaching; a Synced Blocks route is adjacent but not the same exact closure. | `synced-blocks` route proof plus editable-voids regression proof. | Existing rows stay unchanged; no pass-2 ledger write. | no new PR claim |
| `#2072` | related architecture pressure | Content roots and Synced Blocks continue the accepted island/content-root split, but do not close the old `<Island>` request. | The plan keeps mixed native/app islands separate from document-flow content roots. | API proof, browser proof, owner/root lifecycle proof. | Existing rows stay unchanged. | no new PR claim |
| `#5524` | related navigation guardrail | Soft-break ArrowDown remains a different failure family; Synced Blocks should not broaden it. | The target is same-runtime root crossing, not soft-break vertical selection. | New route keyboard proof; no issue closure without exact repro. | Existing vertical content-root rows stay unchanged. | no new PR claim |
| `#6034` | existing exact fixed claim unchanged | Table-last-node ArrowDown stays exact and must not be broadened to Synced Blocks. | Prevents overclaiming vertical navigation. | Existing table proof plus no regression. | Existing `Fixes #6034` stays exact. | unchanged |
| `#5874` / `#4309` | related/non-claim identity guardrail | Reusing the same Slate node object more than once remains unsupported; Synced Blocks share a root key in one runtime, not node object identity across positions or editors. | Same-root projection could be confused with shared object reuse. | Unit/browser proof should deep-copy owner nodes and share only root keys. | Existing `#5874` rows stay unchanged. | no new PR claim |
| `#6016` | triage-closed/non-fix | Shared node graphs across independent editor runtimes remain unsupported; Synced Blocks deliberately use one runtime with root-bound editable surfaces. | Confirms one-runtime architecture, rejects one-editor-per-block/shared-value misuse. | No exact closure; keep as invalid/non-fix unless current minimal repro changes. | Existing triage-closed rows stay unchanged. | no PR text |
| `#5537` / `#5117` | related multi-view focus and DOM-state pressure | Active projection identity and root-local DOM state need browser proof, but no exact multi-editor programmatic focus or placeholder closure is claimed. | Same-root copies can reproduce wrong-view focus/measurement bugs if root lookup is too coarse. | Browser proof: edit copy B, undo/redo, click outside, placeholder/empty-root behavior. | Existing rows stay unchanged. | no new PR claim |
| `#3482`, `#3367` | related model-shape pressure | Default void descendants do not become traversable; rich content belongs in child/content roots. | Synced Blocks must not reopen ordinary void semantics. | Existing void rows plus synced-block route proof. | Existing rows stay unchanged. | no new PR claim |
| `#3435`, `#3884`, `#4301` | related navigation guardrails | Arrow/Enter behavior must be explicit for content roots and must not change selected-void behavior; existing `#4301` fixed floor remains exact. | Synced Blocks adds document-flow root navigation pressure. | Keyboard/browser rows before any claim change. | Existing rows stay unchanged. | unchanged |
| `#3991`, `#3868`, `#5582`, `#5477`, `#4896`, `#4350`, `#4328`, `#5630` | related delete/selection guardrails | Root-backed surfaces must preserve delete, range delete, select-all delete/paste, and root restore semantics. | Shared roots make delete/remap risk higher. | New route delete/undo/select-all proof. | Existing rows stay unchanged. | no new PR claim |
| `#4984`, `#4842`, `#3909` | related nested/contenteditable ownership guardrails | Same-runtime root projections remain the answer; only existing `#4984` fixed floor is preserved. | Synced Blocks replaces nested independent editor thinking without claiming offset/CodeMirror closure. | Existing nested proof plus route-specific DOM bridge proof. | Existing rows stay unchanged. | unchanged |
| `#4806`, `#4802`, `#4104`, `#3926`, `#4888`, `#4623` | related clipboard/drop/move guardrails | Synced root payload copy/unsync/move semantics remain proof gates; existing inline-void clipboard claims are not broadened. | Shared body roots need explicit transfer/remap behavior. | Clipboard/drop/move browser proof before claim changes. | Existing rows stay unchanged. | no new PR claim |
| `#1769`, `#3893` | related focus/external DOM pressure | Clicking outside a projected root must clear/move focus coherently; no exact external/native focus closure is claimed. | User already hit click-outside focus bugs in editable roots. | Synced-block click-outside browser row. | Existing rows stay unchanged. | no new PR claim |
| `#5183`, `#5391`, `#5087`, `#4839`, `#5130`, `#5559` | related mobile/IME/inline-boundary guardrails | Synced Blocks must not claim mobile, IME, placeholder, inline-void spacer, or line-ending cursor fixes from the new route. | Content-root projection crosses the same runtime/input boundary class, but the example is not a mobile/device proof lane. | Desktop route proof plus explicit mobile/IME follow-up if behavior changes touch the input pipeline. | Existing rows stay unchanged. | no new PR claim |
| `#5131`, `#2051`, `#2195`, `#2405`, `#790` | related performance guardrails | Repeated root projections need rerender breadth, dirty-path, and large-document budget proof before any perf claim. | Same-root projections can accidentally fan out subscriptions or normalization if view identity is too broad. | Benchmark or stress row only; no benchmark closure from planning. | Existing rows stay unchanged. | no perf claim |
| `#5771`, `#5533`, `#1770` | related collaboration/history guardrails | Shared roots require root-qualified ops, transactions, history grouping, and remote-selection policy; no slate-yjs or collaboration closure is claimed. | Editing one shared root from two projections is a collab-like identity problem even inside one runtime. | Unit/runtime proof for root-qualified history plus future adapter proof. | Existing rows stay unchanged. | no collab claim |
| `#3177`, `#3222`, `#3283` | related render/API/example pressure | Synced Blocks should improve the render API story without turning raw Slate into a plugin framework or product UI kit. | The route must teach a small content-root projection primitive, not internal hook plumbing. | Typecheck and source review of the call site. | Existing rows stay unchanged. | no new PR claim |

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete for pass 2, ledger/cache-first. Full
  issue-ledger pass: complete for pass 3, ledger/cache-first. No broad live
  GitHub discovery was run.
- generated live gitcrawl rows read: `#6034`, `#6016`, `#5524`, `#5212`,
  `#2072`, `#5874`, `#5537`, and `#5117`.
- durable issue sources read: `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-v2/references/pr-description.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-issues/open-issues-ledger.md`, and
  `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- pass 3 additions read:
  `docs/slate-issues/issue-clusters.md:59`,
  `docs/slate-issues/package-impact-matrix.md:64`,
  `docs/slate-issues/requirements-from-issues.md:72`,
  `docs/slate-issues/benchmark-candidate-map.md:458`, and relevant rows in
  `docs/slate-issues/test-candidate-map/**`.
- manual v2 sync ledger update: not written in pass 3 because all reviewed
  issues keep existing statuses and claim text.
- fork issue dossier update: not written in pass 3 because the existing
  content-root, multi-root, `#5874`, `#6016`, `#5537`, and `#5117` sections
  already cover the claim stance, and the new rows are guardrails rather than
  fixed/improved claims.
- issue coverage matrix update: not written in pass 3 because no fixed/improved
  claim or status changes.
- PR description sync: closed by the issue-sync accounting pass; pass 3 added
  no new PR claim, and pass 11 recorded the current non-claim stance.

Full issue-ledger pass coverage:
| Source | Relevant finding | Plan effect |
|--------|------------------|-------------|
| `docs/slate-issues/issue-clusters.md:59` | The corpus says runtime boundaries, not the JSON model, are the pain. | Keep the serialized Synced Blocks node simple: owner node plus `childRoots.body`, no renderer-owned document shape. |
| `docs/slate-issues/issue-clusters.md:71` | Mobile/IME and placeholder behavior are top-priority runtime pressure. | Do not claim mobile/IME from the desktop Synced Blocks route; add explicit guardrails. |
| `docs/slate-issues/issue-clusters.md:124` | React identity/subscription bugs form a strong `slate-react` cluster. | Active projection identity is mandatory, not polish. |
| `docs/slate-issues/issue-clusters.md:182` | Selection/focus/DOM bridge is the largest raw cluster. | Browser proof must cover click-outside, ArrowUp/Down, focus restore, and outside-to-inside boundaries. |
| `docs/slate-issues/issue-clusters.md:209` | Clipboard/import/export needs explicit boundary policy. | Copy, paste, drag, move, sync copy, and unsync stay proof gates. |
| `docs/slate-issues/issue-clusters.md:235` | Core operations, normalization, and history remain high leverage. | Shared roots need one operation stream and root-qualified history, not mirrored editors. |
| `docs/slate-issues/package-impact-matrix.md:64` | `slate`, `slate-react`, `slate-dom`, and `slate-history` have separate owners. | Split implementation ownership: core stores roots/ops, React mounts projections, DOM owns bridge behavior, history owns undo grouping. |
| `docs/slate-issues/requirements-from-issues.md:72` | Simple document model, first-class operations, and explicit DOM/input ownership are non-negotiable. | Keep product chrome out of serialized Slate data. |
| `docs/slate-issues/requirements-from-issues.md:220` | Selection must be a dedicated runtime subsystem. | Synced Blocks requires root-qualified selection plus view-local projection identity. |
| `docs/slate-issues/requirements-from-issues.md:275` | `slate-react` must be snapshot-driven and selector-first. | Repeated projections need narrow subscriptions and rerender proof. |
| `docs/slate-issues/requirements-from-issues.md:302` | History must be transaction-aware. | Undo/redo must restore the active projection when available. |
| `docs/slate-issues/requirements-from-issues.md:326` | Clipboard and serialization boundaries must be explicit. | Shared-root transfer/remap behavior is a named proof gate. |
| `docs/slate-issues/requirements-from-issues.md:401` | Performance work must be benchmark-driven. | No performance claims until repeated-root and rerender/dirty-path workloads exist. |

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Notion Synced Blocks | User-provided excerpt and screenshot in the 2026-05-26 prompt. | Same content appears in multiple block positions; editing one copy updates all copies; UI shows top chrome/border/copy/unsync affordances. | Manual duplication and stale repeated content. | Product scenario and visual proof target. | Permissions/cross-workspace semantics in raw Slate. | Example-local Synced Blocks chrome over raw content-root projections. | partial |
| ProseMirror | `../prosemirror-view/src/viewdesc.ts:31`, `:35`, `:71`, `:81`, `:86`, `:993`; `../prosemirror-state/src/transaction.ts:67`; `../prosemirror-state/src/selection.ts:173`. | `NodeView` splits `dom` from `contentDOM`; transaction owns selection mapping; bookmarks give history durable anchors. | Random renderer-owned browser repair. | Outer chrome plus editor-owned content slot; transaction-owned selection; bookmark/history discipline. | Integer positions, schema-first identity, and ProseMirror plugin complexity as raw Slate's public shape. | `props.slots.contentRoot(...)` is Slate's `contentDOM`-like authoring point, backed by keyed roots and Slate operations. | adopt mechanism, not model |
| React ProseMirror | `../react-prosemirror/README.md:109`, `:114`, `:215`; `../react-prosemirror/migration-guides/v2.md:12`, `:22`, `:34`. | Moves ProseMirror rendering into React to avoid portal wrappers, double render, stale state, and DOM ownership fights. | React portals into editor-owned nodes as the normal API. | React component node views receive props; layout/editor methods run outside render. | Extra wrapper/portal handoff as the Synced Blocks architecture. | Slate React slot should render normal React chrome while Slate owns the nested editable root internally. | strong support |
| Tiptap | `../tiptap/packages/react/src/NodeViewWrapper.tsx:10`; `../tiptap/packages/react/src/NodeViewContent.tsx:10`; `../tiptap/packages/core/src/CommandManager.ts:51`; `../tiptap-docs/src/content/editor/api/commands/index.mdx:28`. | Product DX wraps ProseMirror node views with `NodeViewWrapper` and `NodeViewContent`; commands use `chain().run()`. | Raw ProseMirror ceremony in app docs. | Product-grade naming and wrapper/content split; example should feel obvious. | `chain().focus().run()` as raw Slate command law; product command DSL in core. | Raw Slate keeps `editor.update((tx) => ...)`; Plate may later own higher-level synced-block commands. | DX benchmark only |
| Lexical | `../lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts:23`; `../lexical/packages/lexical-react/src/shared/useReactDecorators.tsx:18`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:33`; `../lexical/packages/lexical/src/LexicalUpdates.ts:243`; `../lexical/packages/lexical/src/LexicalUtils.ts:460`. | Decorator nodes mount React UI by node key; nested composers are separate editors; dirty leaves/elements drive transforms and subscriptions. | Treating all UI as document children or all nested rich content as one editor. | Dirty-node/runtime invalidation and decorator channel. | Class node model and nested editors as the shared content-root answer. Lexical's nested composer explicitly needs an `initialEditor` and does not inherit plugins. | Keep one Slate runtime with multiple root views, not Lexical-style nested editor states, for Synced Blocks. | reject nested editor substrate |
| React 19.2 / Slate React selectors | `docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md:20`; `packages/slate-react/src/hooks/use-editor-selector.tsx:181`; `packages/slate-react/src/hooks/use-slate-runtime.tsx:639`; `../lexical/packages/lexical-react/src/shared/useReactDecorators.tsx:30`. | External-store selectors and root/runtime-scoped update gates keep React from rerendering every surface. | Editor-wide React rerenders and effect-created roots. | Narrow subscriptions, snapshot reads, deferred selectors, root-affect checks. | Claiming React alone solves dirty-path fanout. | Content-root slot implementation must mount views with root-scoped selectors and a repeated-root stress row. | adopt |
| Plate | `packages/core/src/lib/plugin/createSlatePlugin.ts:91`; `packages/core/src/react/plugin/toPlatePlugin.ts:70`; `packages/core/src/internal/plugin/pluginInjectNodeProps.ts:25`; `packages/core/src/internal/plugin/pipeInjectNodeProps.tsx:11`. | Slate-first plugins compose into React Plate plugins; Plate injects node props, selectors, chrome, and product behavior on top. | Raw Slate becoming a product UI framework. | Ownership boundary: raw Slate owns keyed root projection; Plate owns rich synced-block product wrappers later. | Copying Plate plugin APIs into raw Slate for this route. | Keep `Synced Blocks` example local; no workspace permissions, toolbar kit, or Plate dependency. | boundary confirmed |
| slate-yjs | `../slate-yjs/packages/core/src/plugins/withYjs.ts:29`; `:156`; `:204`; `../slate-yjs/packages/core/src/plugins/withYHistory.ts:68`; `:80`; `:130`; `../slate-yjs/packages/core/src/plugins/withCursors.ts:31`; `:98`; `../slate-yjs/packages/core/src/utils/position.ts:65`. | Current adapter binds one `Y.XmlText` shared root to one editor; history/cursors store relative selections against that shared root. | Pretending current slate-yjs can understand multiple Slate v2 roots without adapter work. | Relative selection/history concept, origin grouping, cursor awareness. | Single sharedRoot as enough for Synced Blocks. | Slate v2 must expose root-qualified ops, selection/history metadata, and local projection identity; adapter maps each keyed root to a shared type. | migration pressure |

Ecosystem pressure conclusions:
- ProseMirror and Tiptap both say the same thing in different layers: an
  editable child surface should be a named content slot inside visible chrome,
  not a second editor app wired by users.
- React ProseMirror is the warning label. Portal handoffs and stale render
  phases are exactly why the public Synced Blocks example should not teach
  manual nested `<Editable root>` plumbing.
- Lexical's nested composer is not a green light for one editor per block. It
  creates a nested editor that must configure its own plugins/nodes; that is
  useful for isolated embeds, but wrong for shared selection/history.
- slate-yjs forces root-qualified migration metadata. A repeated root view is
  local projection state; collaboration data must name the document root and
  range, not the mounted copy as persisted truth.
- Plate should get a clean substrate and then wrap it. Raw Slate should expose
  the slot/root primitive and browser behavior, not Notion workspace features.
- The final ecosystem pass did not change the chosen architecture. It made the
  render/effect lifecycle boundaries stricter and kept current slate-yjs support
  as a hard non-claim.
- The only acceptable "nested editable" answer for Synced Blocks is another
  `Editable` view over the same runtime root. A nested editor/composer per block
  is useful for isolated embeds, but wrong for shared content, shared history,
  and simple-editor-like navigation.

Ecosystem maintainer pass:
| Maintainer | Likely objection | What we steal | What we reject | Plan verdict | Execution gate |
|------------|------------------|---------------|----------------|--------------|----------------|
| ProseMirror maintainer | "If child content is editable, the editor must own that content slot." | `dom` vs `contentDOM`, transaction-owned selection, and mapped selection discipline from `../prosemirror-view/src/viewdesc.ts:31` and `../prosemirror-state/src/transaction.ts:67`. | Integer positions, schema-first identity, plugin-system weight, and NodeView as Slate's public model. | `props.slots.contentRoot(...)` is Slate's content slot: React owns chrome, Slate owns the child editable root. | Slot must wire internal `Editable`, DOM coverage, root selection, and root-qualified navigation without user hook plumbing. |
| React ProseMirror maintainer | "React render cannot safely call view/layout methods or mutate editor state." | View/layout methods outside render, render props as the React surface, and render-phase purity warnings from `../react-prosemirror/README.md:117`. | Portal/double-render handoff and manual nested `<Editable root>` as the canonical example. | Root view setup belongs to Slate React lifecycle, not user render code. | Content-root slot must not call focus/layout/view mutation during render; root creation/copy/unsync must happen in transactions/events. |
| Tiptap maintainer | "Good DX needs obvious wrapper/content primitives and high-level actions." | Wrapper/content naming clarity from `NodeViewWrapper` / `NodeViewContent`, plus product-grade example affordances. | `chain().focus().run()` as raw Slate law and a product command DSL in core. | Raw Slate exposes `props.slots.contentRoot(...)` and route-local duplicate/unsync commands using `editor.update((tx) => ...)`; Plate can wrap richer commands later. | Source audit must show the canonical renderer teaches the slot, not hook soup or command-chain ceremony. |
| Lexical maintainer | "Nested editors are an established pattern; why not one per block?" | Decorator UI channel, dirty-node/update discipline, and external-store decorator subscriptions. | Nested composer as the shared-content answer; class node model as Slate's public authoring model. | Synced Blocks use one runtime with multiple root views. Nested editors remain only an isolated-embed strategy. | Active projection identity and 20/100 projection stress must prove no wrong-copy focus or broad rerender fanout. |
| slate-yjs maintainer | "The current adapter has one `sharedRoot`; this plan cannot claim collaboration support." | Relative selection/history, origin grouping, and cursor-awareness concepts from `withYHistory` / `withCursors`. | Claiming current slate-yjs understands multiple Slate v2 roots or projection ids. | Raw Slate plan is root-keyed collaboration substrate only; adapter work is future. | No slate-yjs fixed/improved claim until a root-keyed shared type map and root-qualified cursor/history proof exist. |
| React maintainer | "Subscriptions and effects can fan out or break render purity." | External-store selector posture, root/runtime update gates, and one-time runtime initialization. | Effect-created roots, derived active projection state in effects, and imperative view mutation during render. | The slot is okay only if it is lifecycle-owned and selector-scoped. | Add selector fanout proof, no effect-created root creation, and source audit for render purity. |
| Slate maintainer | "Raw Slate should not become product UI." | Slate's JSON-like model, operation stream, and minimal React bridge. | Notion permissions, workspace sync, command DSL, and Plate product wrappers in raw Slate. | Raw Slate owns the content-root slot and browser behavior; the Synced Blocks route owns only a compact demo. | Keep duplicate/unsync route-local unless another raw example proves reuse; no product sync API in this plan. |

Performance / DX / migration / regression / simplicity pressure results:
| Lens | Stressor | Finding | Required plan delta | Verdict |
|------|----------|---------|---------------------|---------|
| Performance | 20 and 100 owner nodes projecting the same root; edit one projection while every copy is mounted. | Current root/runtime selectors are a good base, but same-root projections can still multiply mounted editors, subscriptions, event handlers, DOM nodes, and focus work. | Treat one mounted content-root projection as the repeated unit. Add selector-notify count, rendered component count proxy, DOM node count, event-to-paint, and heap/DOM tags to the stress proof. No perf claim without those rows. | strengthened |
| Performance | Benchmarks that read full snapshots after every small edit. | Prior core benchmark notes show helper reads can hide true runtime cost. | Synced Blocks perf rows must measure public typing/copy/paste paths and keep snapshot reads out unless the row explicitly measures snapshot materialization. | strengthened |
| DX | Current `editable-voids` call site requires `useSlateContentRoot` plus nested `<Editable root>`. | That is acceptable low-level proof, but bad canonical teaching for Synced Blocks. | The new example must show the shell and a single `props.slots.contentRoot('body', options)` call. Source audit should reject `useSlateContentRoot`, `useSlateChildRoot`, or manual `<Editable root>` in the canonical renderer unless intentionally isolated in an advanced helper. | strengthened |
| Migration | Same root rendered in multiple places. | Root key is content identity; mounted projection id is UI identity. Persisting projection ids would pollute document/collab data. | Runtime needs active projection preference for focus/history lookup. History/collab metadata stays root-qualified; remote cursor projection policy is future adapter/product work. | strengthened |
| Regression | User already hit ArrowDown and click-outside bugs on editable roots. | Existing editable-void rows are a floor, not proof for same-root duplicate projections. | `/examples/synced-blocks` needs native browser rows for ArrowDown from p1 into the first block, ArrowUp/Down out, active-copy undo/redo, outside click, placeholder isolation, delete/range delete, and copy/unsync. | strengthened |
| Simplicity | Tempting public helpers and product UI. | One new slot plus active projection identity is enough. Extra component API, Notion permissions, command DSL, or a Plate wrapper belongs later. | Keep route-local commands inline unless reused; expose only the slot/root primitive from raw Slate; keep Notion chrome local to the example. | strengthened |

Performance review lane:
| Question | Answer | Evidence / rule |
|----------|--------|-----------------|
| Vercel React micro-rules used | `rerender-defer-reads`, `rerender-derived-state-no-effect`, `advanced-init-once`, plus selector/external-store posture. | `.agents/skills/vercel-react-best-practices/SKILL.md`; current selector source at `packages/slate-react/src/hooks/use-editor-selector.tsx:104` and `:213`. |
| Extra performance rules used | `cohort-segmentation`, `repeated-unit-budget`, `effect-subscription-budget`, `interaction-inp-matrix`, `memory-dom-tagging`, `browser-trace-cwv-proof`, and `editor-native-behavior-proof`. | `.agents/skills/performance/rules/*.md` reads in pass 6. |
| Repeated unit | One mounted content-root projection: owner shell, root chrome, nested editable view, subscriptions, event handlers, and active projection registration. | Current root view registry at `packages/slate-react/src/hooks/use-slate-runtime.tsx:348`; current slot surface at `packages/slate-react/src/components/editable-text-blocks.tsx:415`. |
| Cohorts | normal: 1-5 projections; medium: 20 projections; stress: 100 projections; pathological: custom renderers plus comments/decorations plus same-root projections. | Cohort rule; benchmark candidate rows for dirty path, rerender breadth, and large docs at `docs/slate-issues/benchmark-candidate-map.md:458`, `:488`, `:518`. |
| Budgets | Unrelated root edits must not notify same-root projection selectors; same-root text edit may update each mounted projection, but not unrelated parent blocks or unrelated roots. | Existing selector fanout tests at `packages/slate-react/test/provider-hooks-contract.tsx:545`, `:615`, `:946`, and `:1079`. |
| Interaction metrics | type, select, select-all, copy, paste, delete/range delete, click outside, ArrowUp/Down, undo/redo, and follow-up typing after focus repair. | Interaction INP matrix; editable-void browser floor at `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts:379`, `:787`, `:910`. |
| Memory / DOM tags | JS heap, DOM node count, mounted projection count, selector subscription count, listener count, dirty id set size, and custom renderer flag. | Memory/DOM tagging rule. |
| Degradation contract | No degradation for normal/medium route proof. Stress rows may be lab-only but cannot silently break native selection, copy, paste, find, undo/history, or follow-up typing. | Editor native behavior proof rule. |
| Trace / CWV scope | Page-load CWV is out of scope for the planning pass; editor event-to-update/event-to-paint and Playwright/native proof are in scope after implementation. | Browser trace/CWV rule. |
| RUM gap | Future production dashboard should tag route, root key, projection count, active root, browser, mobile/IME, interaction name, and document size. | Performance skill dashboard guidance; not required before raw plan acceptance. |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Default void behavior | Ordinary voids are atomic unless explicitly opting into special behavior. | No broad void traversal change. | Existing editable-voids and void-selection tests plus new synced-block route. | execution | pending |
| Root-backed block navigation | User expects projected root to feel like sibling block content. | Arrow, Enter, Backspace/Delete, click, select-all, paste/drop, undo/redo work across owner/root boundaries. | New `synced-blocks.test.ts` plus focused content-root navigation tests. | execution | pending |
| Shared copy editing | Editing one synced copy updates every copy. | One body root, multiple projections, one history stream. | New browser row and unit/runtime row for duplicate root views. | execution | pending |
| Active copy focus | User clicks/edits copy B; undo/redo/focus should restore copy B, not arbitrary copy A. | Runtime active projection identity drives focus target. | Browser row with two mounted copies of same root. | execution | pending |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Synced Blocks route smoke | Open `/examples/synced-blocks`. | Chromium | `bunx playwright test playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep smoke` | Route renders two synced copies and surrounding paragraphs. | pending |
| Shared edit | Type in first copy. | Chromium | same file | Second copy updates from same root value. | pending |
| Active projection focus | Type/click copy B, undo/redo. | Chromium | same file | Focus returns to copy B's mounted view. | pending |
| Arrow flow | ArrowDown from paragraph before synced block; ArrowDown out to paragraph after; ArrowUp reverse. | Chromium first, other projects when stable | same file | Caret follows visual document flow. | pending |
| Click outside | Focus copy, click outside paragraph. | Chromium | same file | Root selection clears, outer selection/focus set correctly. | pending |
| Placeholder isolation | Empty one shared-root projection, click between copies, and edit another paragraph. | Chromium | same file | Placeholder/min-height/focus state applies to the active projection, not an arbitrary copy. | pending |
| Clipboard / move | Copy one synced owner, paste or move it, then edit the shared body. | Chromium | same file | Shared copy keeps root identity when intended; unsync or clone creates a new root with no stale references. | pending |
| Delete / range delete | Select around a synced block and delete/backspace across boundaries. | Chromium | same file | Owner node deletion and root body editing stay distinct; no orphaned root crash. | pending |
| Source DX audit | Inspect the canonical Synced Blocks renderer. | source review | `rg "useSlate(ContentRoot|ChildRoot)|<Editable[^>]*root" site/examples/ts/synced-blocks.tsx` | The canonical renderer teaches `props.slots.contentRoot(...)`, not hook plumbing. | pending |
| Selector fanout | Edit one projected root with 20 and 100 mounted copies plus unrelated roots. | package test or stress route | focused `slate-react` selector/projection test plus route stress row | Same-root mounted projections update; unrelated root/runtime selectors do not fan out. | pending |
| Memory / DOM pressure | Repeat mounted projections under normal, medium, and stress cohorts. | Chromium stress | focused route row with browser-side counters or profiler output | DOM node count, mounted projection count, listener/subscription count, and heap remain bounded by projection count, not document size. | pending |
| Existing editable roots | Rerun relevant editable-voids rows. | Chromium | `bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "content root|vertically|click outside"` | No regression to mixed islands. | pending |
| Stress | Repeated synced-root mount/unmount and edits. | Chromium stress | `playwright/stress/generated-editing.test.ts` new stress case or focused route row. | No arbitrary focus, no stale root view, no crash. | pending |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Current roots data model is keyed roots. | `Plate repo root` | `nl -ba packages/slate/src/interfaces/editor.ts \| sed -n '80,110p'` | observed `RootKey` and `roots: Record<RootKey, V>` | pass 1 |
| Current root lifecycle API exists. | `Plate repo root` | `nl -ba packages/slate/src/interfaces/editor.ts \| sed -n '240,260p'` | observed `tx.roots.create/delete/replace` type | pass 1 |
| Current content-root schema exists. | `Plate repo root` | `nl -ba packages/slate/src/interfaces/editor.ts \| sed -n '500,532p'` | observed `EditorElementContentRootSpec` | pass 1 |
| Current root view lookup is root-only. | `Plate repo root` | `nl -ba packages/slate-react/src/hooks/use-slate-runtime.tsx \| sed -n '340,405p'` | observed `Map<RootKey, Set<...>>` and first-value lookup | pass 1 |
| Current examples route is explicit. | `Plate repo root` | `nl -ba "site/pages/examples/[example].tsx" \| sed -n '18,50p'` | observed explicit route import map | pass 1 |
| Current selector fanout base exists. | `Plate repo root` | `nl -ba packages/slate-react/src/hooks/use-editor-selector.tsx \| sed -n '213,360p'` and `nl -ba packages/slate-react/test/provider-hooks-contract.tsx \| sed -n '545,700p'` | observed runtime-id listener map, affected-runtime filtering, and tests that skip unrelated runtime id commits | pass 6 |
| Current mounted render selector base exists. | `Plate repo root` | `nl -ba packages/slate-react/test/provider-hooks-contract.tsx \| sed -n '946,1120p'` | observed mounted render selector tests for synced text commits and root selector sources | pass 6 |
| Current content-root navigation unit floor exists. | `Plate repo root` | `nl -ba packages/slate-react/test/content-root-navigation-contract.test.ts \| sed -n '1,275p'` | observed unit rows for horizontal, Enter, Backspace, and selection-root navigation | pass 6 |
| Browser behavior is not claimed by this pass. | `Plate repo root` | not run | planning-only current-state read | pass 1 |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied as planning lens | Relevant rules are rerender subscription narrowing, derived state during render, and one-time runtime initialization. | Content-root slots must use selector/root-scoped subscriptions and event handlers; no derived active projection state in effects. |
| performance-oracle | yes | applied as planning lens | Repeated projections make complexity and memory boundedness the risk. | Added 20/100 projection cohorts, selector fanout budgets, and memory/DOM tags. |
| performance | yes | applied as planning lens | Repeated-unit, cohort, interaction, memory, native-behavior, and trace boundaries were missing. | Added the performance review lane and stress rows; no perf claim before measured proof. |
| tdd | yes | applied to execution plan | Behavior must be proven through public routes/hooks, not private internals. | Execution order starts with one failing public behavior row at a time: shared edit, active-copy focus, Arrow flow, click outside, then clipboard/delete stress. |
| shadcn | partial | applied as composability lens | No shadcn dependency is expected, but the composability rule matters. | Keep chrome local, use familiar buttons/menus in the example, and expose one slot instead of a product component kit. |
| react-useeffect | partial | applied as guardrail | Effects are only for external sync/subscriptions. | Root creation, copy, unsync, and active projection updates must happen in transactions/events/runtime stores, not effect-created owner state. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Wrong focused copy | Same root rendered twice. | Undo/redo or mouse focus returns to the first mounted copy because `getMountedViewEditor(root)` picks an arbitrary first view. | Active projection identity keyed by root + owner runtime id + slot; history/focus lookup prefers active projection. | Synced Blocks row: focus/edit copy B, undo/redo, assert DOM focus/native selection/model selection belong to copy B. | deliberate-mode closed; execution proof pending |
| Owner/root lifetime | Delete one owner of a shared body root. | Automatic cleanup deletes a root still projected elsewhere, or never-cleaned roots become silent garbage. | Do not auto-delete shared roots from owner deletion in raw Slate. Duplicate shares a root; unsync creates a new root and updates one owner; cleanup is explicit app/persistence policy. | Unit/browser rows for delete owner, edit remaining copy, unsync, and no stale root crash. | deliberate-mode closed; execution proof pending |
| Rootless selection inheritance | Click from one root/projection to another. | A rootless explicit selection inherits the previous root and resolves paths in the wrong tree. | Preserve the existing split: implicit edits may follow current selection; explicit rootless runtime locations target main unless a root-bound view stamps its root. | Unit row that selects projected root B, then main/sibling path; assert root and marks reads do not crash. | deliberate-mode closed; execution proof pending |
| Operation-root middleware | Undo/replay while another root/projection is focused. | DOM middleware reads `[path]` in the focused root before core apply enters the operation root. | Any middleware reading operation paths must enter the operation root before `NodeApi.get`, `Editor.levels`, path refs, or DOM key repair. | Repeated undo across roots where the operation path cannot exist in the focused root. | deliberate-mode closed; execution proof pending |
| Hidden perf tax | Many root projections mounted. | Every root commit rerenders too much of the page, or benchmark helper snapshot reads hide the true cost. | Root/runtime-scoped subscriptions; mount only rendered projections; benchmark interaction path without full snapshot reads unless named. | 20/100 projection stress with selector notifications, DOM count, heap, listeners, and event-to-paint. | deliberate-mode closed; benchmark proof pending |
| Broken default voids | Root-content change leaks into void traversal. | Images/embeds/ordinary voids become unexpectedly navigable. | Content-root-only bridge; do not widen default void semantics. | Existing void/editable-void rows plus synced-block route proof. | deliberate-mode closed; regression proof pending |
| Browser proof false green | Tests click the editable directly or assert focus only. | User still cannot move/click/type naturally although tests pass. | Browser rows must click visible chrome/text, assert activeElement, native selection ownership, Slate selection, model text, and follow-up typing. | `/examples/synced-blocks` native mouse/keyboard gauntlets, not smoke-only route checks. | deliberate-mode closed; browser proof pending |
| Split-brain collab | Shared roots not mapped by collab adapter. | Remote cursors/ops target the wrong root or copy. | Root-qualified collab design; projection ids local only; no current slate-yjs claim. | Future root-keyed slate-yjs adapter proof; raw Slate plan records non-claim. | deliberate-mode closed; non-claim |
| Example teaches internals | Example exposes hook soup and nested Editable ceremony. | Developers copy brittle root plumbing. | Stable content-root slot in renderer; low-level hooks remain escape hatches. | Source audit: canonical renderer uses `props.slots.contentRoot(...)`, not `useSlateContentRoot` + manual `<Editable root>`. | deliberate-mode closed; execution pending |

High-risk deliberate-mode conclusions:
- Active projection identity is the hard runtime requirement. Without it,
  Synced Blocks can render, but undo/redo and focus restoration are wrong by
  design when the same root has multiple mounted views.
- Root lifecycle must stay explicit. A root is content identity; an owner node is
  projection/order. Deleting an owner must not silently delete shared content.
- Root-qualified selection and operation-root middleware are not optional
  implementation details. Prior wrong-root bugs crashed before examples could
  repair them, so package-level tests must cover them.
- Browser proof must test human paths: visual text/chrome clicks, native
  selection ownership, model selection, model text, and follow-up typing. Focus
  alone is a liar here.
- Performance proof must avoid benchmark helper traps. If a row reads full
  snapshots after every small edit, it is measuring snapshots, not interaction
  cost.
- slate-yjs compatibility remains a non-claim until a root-keyed adapter exists.
  Persisted collaboration data names roots and ranges, not projection ids.

Slate maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Add `props.slots.contentRoot(...)` | "This is React convenience, not core Slate." | Correct: the slot is React DX. But the model is already core: `contentRoot` is schema vocabulary and `childRoots[slot]` stores the data root. | Core spec at `packages/slate/src/interfaces/editor.ts:513`; renderer slots at `packages/slate-react/src/components/editable-text-blocks.tsx:415` and `:521`; ProseMirror's `NodeView.contentDOM` split at `../prosemirror-view/src/viewdesc.ts:31`. | Keep core to schema/root identity and implement the render affordance in `slate-react`. Document the slot as "project this root here", not as a synced-block product primitive. | accepted; execution gate |
| Reject canonical `<ContentRoot />` | "A component is more React-like than a slot function." | A component is easy to add later, but it hides owner renderer context and pushes root resolution into context magic. | Renderer already receives `attributes`, `children`, `element`, and `slots` together at `packages/slate-react/src/components/editable-text-blocks.tsx:506`; `useSlateContentRoot` can resolve context today at `packages/slate-react/src/hooks/use-slate-content-root.ts:25`. | Ship the slot first. Reconsider component sugar only if multiple real examples repeat identical slot options and the type surface stays clean. | accepted; keep rejected alternative |
| Allow same root in multiple owner nodes | "A root should have one mounted editor view; multiple views make focus arbitrary." | Data identity and view identity must split. Root key answers what content is edited; projection identity answers which DOM mount receives focus. | Root view registry is already `Map<RootKey, Set<...>>` at `packages/slate-react/src/hooks/use-slate-runtime.tsx:348`, but `getMountedViewEditor(root)` picks the first view at `:386`. | Add runtime-local active projection identity before claiming Synced Blocks done. Do not serialize projection ids. Browser proof must show copy B keeps focus through edit/undo/redo. | accepted; hard gate |
| Add active projection identity | "This is hidden mutable UI state." | Yes, and that is exactly where it belongs. It is DOM-focus state, not document content. | History restore currently calls root-only `getMountedViewEditor(root)` at `packages/slate-react/src/hooks/use-slate-history.ts:173`; content navigation writes root-qualified ranges at `packages/slate-react/src/editable/content-root-navigation.ts:136`. | Store active projection in runtime/view state keyed by root plus owner runtime id and slot. History/focus may prefer it, but operations, snapshots, and collab state stay root-qualified. | accepted; hard gate |
| Keep default voids atomic | "Content roots will make every void traversable and break legacy expectations." | Only opt-in content-root elements get navigation. Ordinary void behavior stays atomic. | Void kinds are explicit at `packages/slate/src/interfaces/editor.ts:487`; editable-voids opt in with `void: 'editable-island'` and `contentRoot` at `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:137`; navigation first checks for content-root specs at `packages/slate-react/src/editable/content-root-navigation.ts:145`. | Do not change default void traversal. New Synced Blocks should be a content-root element rendered through `renderElement`, not a broad `renderVoid` semantic change. | accepted; regression gate |
| Add Notion-style `Synced Blocks` example | "Raw Slate should not ship product UI." | The product chrome is example-local; the primitive is general. The example is valuable because it proves the hardest real workflow. | User supplied Notion scenario; root lifecycle API supports create/delete/replace at `packages/slate/src/interfaces/editor.ts:249`; current editable-voids example is too hook-heavy at `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:227`. | Include border/top chrome, duplicate, and unsync only in `site/examples/ts/synced-blocks.tsx`. Do not add permissions, workspace sync, comments, or Plate dependencies to raw Slate. | accepted; example-local |
| Copy/duplicate and unsync commands | "This starts defining a product sync protocol." | The commands are demonstrators for root identity, not a server sync API. | `tx.roots.create`/`replace`/`delete` are already public transaction concepts at `packages/slate/src/interfaces/editor.ts:249`. | Duplicate should create another owner node pointing at the same root. Unsync should create a new root cloned from the shared root and update only that owner node. Keep command code route-local unless a second example proves reuse. | accepted; route-local |
| Root lifecycle and orphan policy | "If owners share roots, deleting an owner can orphan or accidentally delete shared content." | Correct; the plan must not hide lifetime policy. Shared roots need explicit owner/root distinction. | Root storage is separate from owner nodes at `packages/slate/src/interfaces/editor.ts:89`; child-root resolution prefers persisted `childRoots[slot]` at `packages/slate-react/src/hooks/use-slate-child-root.ts:37`. | Owner deletion must not automatically delete a shared root in the canonical example. Cleanup can be explicit command/persistence policy. Browser tests should cover deleting an owner without crashing and unsyncing without stale references. | accepted; high-risk follow-up |
| Collaboration / slate-yjs | "This cannot be claimed while current slate-yjs has one shared root." | Agreed. The raw Slate plan is the substrate, not a slate-yjs compatibility claim. | Current `withYjs` stores one `sharedRoot: Y.XmlText` at `../slate-yjs/packages/core/src/plugins/withYjs.ts:29` and binds it at `:156`. | The adapter story is root-keyed shared types plus root-qualified selection/history. Projection ids remain local display state. No current slate-yjs fixed/improved claim. | accepted; non-claim |
| Performance of many projected roots | "Nested editables per block will blow up React and DOM work." | The risk is real; the answer is bounded projection budgets, not denial. | `useSlateViewState` gates by root with `isRootAffected` at `packages/slate-react/src/hooks/use-slate-runtime.tsx:639`; pass 6 added 20/100 projection cohorts. | No perf claim until route/package stress rows capture selector notification count, mounted projection count, event-to-paint, heap, DOM, and listener tags. | accepted; proof gate |
| Browser behavior | "The plan says it behaves like sibling blocks, but tests already missed user bugs." | Correct. Browser proof is mandatory, and Playwright alone is only enough when it exercises the real click/keyboard path. | Existing editable-voids rows cover some boundaries at `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts:379`, `:787`, `:910`; prior memory warns browser-visible Slate regressions need real browser proof when harnesses miss UX. | `/examples/synced-blocks` must prove shared edit, ArrowUp/Down, click outside, active-copy undo/redo, placeholder isolation, copy/unsync, delete/range delete, and follow-up typing. | accepted; browser gate |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| One editor per synced block | reject | Shared selection/history/collab become federation problems. | High. | Memory prior root-shape comparison and current one-runtime roots. | None. |
| Mirrored roots as canonical sync | reject | Looks synced but splits operation identity and conflicts. | Medium now, high later. | `tx.roots` makes real shared root possible. | Could be app-level escape hatch only. |
| Default void traversal | reject | User wanted voids like before; too much regression risk. | High. | Prior plan decision at `docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md:397`. | Preserve tests. |
| Manual `<Editable root>` in canonical Synced Blocks example | reject as best DX | It works but teaches internals and repeats hook boilerplate. | Low to replace with slot API. | Current example manual mount at `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:227`. | Add content-root slot target. |
| Canonical `<ContentRoot />` component | reject for now | It hides renderer-local owner children and DOM coverage behind context. | Low if added later as sugar. | Slots already exist at `packages/slate-react/src/components/editable-text-blocks.tsx:415`. | Reconsider after slot proves repetitive. |

Plan deltas from review:
- Pass 1 created the plan and narrowed the target from generic editable voids to
  Synced Blocks as repeated content-root projections.
- Pass 1 added the active projection/view identity gap as the central runtime
  risk.
- Pass 1 chose route-specific browser proof for `/examples/synced-blocks`
  instead of relying on existing editable-voids proof.
- Pass 2 kept the no-new-fixed/no-new-improved issue stance. It reused the
  existing content-root / vertical-navigation accounting and added
  shared-identity guardrails: Synced Blocks may share root keys inside one
  runtime, but must not support shared Slate node objects across owner nodes or
  independent editors.
- Pass 3 completed the full issue-ledger scan. It added no fixed/improved
  claims, but widened proof coverage to mobile/IME, placeholder isolation,
  clipboard/drop/move, delete/range-delete, performance budgets,
  collaboration/history, accessibility pressure, and package ownership.
- Pass 4 chose the public DX and sharpened boundaries: canonical
  `props.slots.contentRoot(...)`, no canonical `<ContentRoot />`, runtime-local
  active projection identity, content-root element vocabulary, and example-local
  duplicate/unsync actions.
- Pass 5 refreshed the ecosystem evidence. ProseMirror, Tiptap, and React
  ProseMirror support the slot/content-root direction; Lexical and slate-yjs
  sharpen the rejection of nested independent editors and the need for
  root-qualified migration metadata. No implementation code changed.
- Pass 6 applied the performance, DX, migration, regression, and simplicity
  pressure passes. It kept the same architecture, but added concrete budgets:
  one mounted projection as the repeated unit, 20/100 projection cohorts,
  selector fanout limits, active-projection history/focus proof, route-specific
  browser rows, source DX audit, memory/DOM tags, and TDD order. No
  implementation code changed.
- Pass 7 completed the Slate maintainer objection ledger. It did not change the
  architecture; it made the acceptance conditions sharper: slot API is accepted
  as React DX over a core schema concept, same-root duplicate projections are
  accepted only with runtime-local active projection identity, default voids stay
  atomic, Notion chrome stays example-local, owner/root lifetime policy becomes
  a high-risk follow-up, slate-yjs remains a non-claim, and perf/browser claims
  stay gated. No implementation code changed.
- Pass 8 completed high-risk deliberate mode. It preserved the chosen
  architecture but hardened the execution gates: active projection identity is a
  hard runtime requirement; owner/root lifetime is explicit; rootless selection
  and operation-root middleware need package tests; browser proof must assert
  focus, native selection, Slate selection, model text, and follow-up typing;
  perf rows must avoid snapshot-helper traps; slate-yjs remains a non-claim. No
  implementation code changed.
- Pass 9 completed the ecosystem maintainer pass. It preserved the chosen
  architecture again, then added final external-owner constraints: Slate React
  lifecycle owns root view setup, render stays pure, effects do not create
  document roots, current slate-yjs remains a non-claim, Tiptap-style wrapper
  clarity is copied without command-chain ceremony, and Lexical nested editors
  stay rejected as the shared Synced Blocks substrate. No implementation code
  changed.
- Pass 10 completed the revision pass. It did not change the architecture. It
  promoted the plan to review-ready shape by filling the final handoff outline,
  marking TDD/browser proof as planning-only N/A, raising the score to 0.92
  from cited evidence, and narrowing the remaining work to issue/reference sync
  accounting plus final closure gates. No implementation code changed.
- Pass 11 completed issue/reference sync accounting. It added the Synced Blocks
  planning-sync section to the manual gitcrawl sync ledger, issue coverage
  matrix, fork issue dossier, and PR description reference. The sync records
  zero new fixed or improved claims and keeps the reviewed issues related,
  unchanged, or non-claim until execution proof exists. No implementation code
  changed.
- Pass 12 completed closure score and final gates. It set the lane to complete,
  emitted the final user-review handoff, kept execution explicitly gated on a
  later accepted-plan invocation, and recorded final checker evidence. No
  implementation code changed.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Should the stable DX be `props.slots.contentRoot(...)` or `<ContentRoot slot="body" />`? | Determines whether root projection is renderer-slot-owned or component-context-owned. | Current renderer constraints. | slate-plan | decided: `props.slots.contentRoot(...)` |
| How should active projection identity be represented? | Same root mounted twice cannot rely on root key alone. | Runtime source design and browser proof. | slate-plan | decided for planning: runtime-local owner runtime id + slot/root projection identity |
| Should example include `Unsync`? | It proves root duplication semantics but may distract from core route. | Product/DX pass. | slate-plan | decided: include duplicate/copy and unsync as example-local commands |
| Should remote cursors render in all synced copies or active copy only? | Affects future collab story. | slate-yjs migration pass. | slate-plan | substrate decided: raw Slate stores root-qualified remote selection data; painting every copy vs active/nearest copy is product policy |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Content-root slot API | slate-plan execution mode | Extend React render DX so `props.slots.contentRoot(slot, options)` hides nested `Editable` plumbing. | Accepted plan; first failing slot/unit test written. | Example can render a content root with one stable public call; no effect-created root creation. | typecheck + focused slate-react tests + source DX audit |
| 2. Active projection identity | slate-plan execution mode | Runtime view registry/focus/history lookup handles duplicate mounted views for one root. | Phase 1 shape accepted; failing active-copy focus test written. | Editing copy B restores/focuses copy B. | unit + browser |
| 3. Synced Blocks route | slate-plan execution mode | Add `site/examples/ts/synced-blocks.tsx`, route import, nav entry, types. | Phases 1-2 green enough for route; route call site reviewed for slot DX. | Route mimics Notion core behavior: two copies share one body root, duplicate creates another projection, unsync creates an independent root. | Playwright smoke/shared-edit/source audit |
| 4. Navigation and focus proof | slate-plan execution mode | Arrow/click/undo/redo/select/paste/drop around synced roots. | Route exists. | Simple-editor-like flow across p1, synced block, p2, second copy. | focused Playwright |
| 5. Regression and sync accounting | slate-plan execution mode | Existing editable-voids rows, issue/reference updates, final review. | Browser rows green. | No widened issue claims without proof. | `bun check` or named focused gates |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md` | plan/template integrity at closure | complete |
| Slate v2 current source read | `Plate repo root` | `nl -ba packages/slate/src/interfaces/editor.ts`, `nl -ba packages/slate-react/src/hooks/use-slate-runtime.tsx`, `nl -ba site/examples/ts/editable-voids.tsx` slices | current data/API/render state | complete for pass 1 |
| Related issue discovery | plate-2 | `rg` / `nl -ba` reads across `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`, and `docs/slate-v2/references/pr-description.md` | current issue claim stance for content-root and same-root projection pressure | complete for pass 2 |
| Full issue-ledger pass | plate-2 | `rg` / `nl -ba` reads across cluster, requirements, package-impact, benchmark, and test-candidate files | no missed fixed/improved claims; broader proof guardrails for implementation | complete for pass 3 |
| Intent/boundary and decision brief | plate-2 | source reads for slots, element context, content-root hook, root chrome, and editable-voids call site | canonical slot API, vocabulary boundaries, active projection identity, and example-local copy/unsync decisions | complete for pass 4 |
| Research ecosystem refresh | plate-2 plus local sibling repos | Local source/research reads for ProseMirror, React ProseMirror, Tiptap, Lexical, React selector posture, Plate, slate-yjs, and prior multi-root solution notes | slot-owned root projection is still the best long-term architecture; nested editors and mirrored roots stay rejected | complete for pass 5 |
| Pressure pass | plate-2 plus `Plate repo root` source reads | Skill lens reads, selector fanout tests, content-root navigation tests, benchmark candidate rows, and prior multi-root failure notes | performance/DX/migration/regression/simplicity gates are concrete; no implementation claim is made | complete for pass 6 |
| Maintainer objection ledger | plate-2 plus `Plate repo root` and sibling source reads | Expanded ledger rows for every public/paradigm objection and converted each to accepted, accepted-with-hard-gate, non-claim, or rejected-alternative stance | maintainer objections are no longer open; high-risk pass remains runnable | complete for pass 7 |
| High-risk deliberate mode | plate-2 plus `Plate repo root` source/test reads | Stress-read wrong-copy focus, owner/root lifetime, rootless selection, operation-root middleware, perf helper traps, default void leakage, browser false greens, and slate-yjs non-claims | hard execution gates are explicit; ecosystem maintainer pass remains runnable | complete for pass 8 |
| Ecosystem maintainer pass | plate-2 plus sibling repos | Re-read ProseMirror, React ProseMirror, Tiptap, Lexical, slate-yjs, React selector/runtime, and local research source slices | final API survived external maintainer pressure; render/effect lifecycle, active projection, source DX, and slate-yjs non-claim gates are explicit | complete for pass 9 |
| Revision pass | plate-2 | Source-backed plan revision, scorecard update, final-handoff outline fill, and stale pending wording scan | plan is review-ready except for issue/reference sync accounting and final checker closure | complete for pass 10 |
| Issue/reference sync accounting | plate-2 | Updated `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, `docs/slate-v2/ledgers/issue-coverage-matrix.md`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, and `docs/slate-v2/references/pr-description.md` with a Synced Blocks planning-sync/non-claim section | issue/reference accounting is current; PR fixed/improved counts stay unchanged | complete for pass 11 |
| Slate v2 behavior check | `Plate repo root` | focused `synced-blocks` and `editable-voids` Playwright rows after execution | runtime/API/browser behavior | pending |

Final user-review handoff outline:
- accepted plan items: first-class content-root block model, canonical
  `props.slots.contentRoot('body', options)` DX, one-runtime shared roots,
  runtime-local active projection identity, Notion-style `Synced Blocks`
  example, route-local duplicate/unsync, and explicit proof gates.
- before / after API shape: current best demo uses `useSlateContentRoot` plus
  manual `<Editable root>`; target demo renders product chrome and calls one
  content-root slot.
- hard cuts: no one-editor-per-block substrate, no mirrored-root canonical sync,
  no default void traversal change, no raw Slate product command DSL, no current
  slate-yjs support claim, and no canonical `<ContentRoot />` component yet.
- issue claims and non-claims: no new fixed/improved issue claim from planning;
  `#5212`, `#2072`, `#5524`, `#5874` / `#4309`, `#6016`, `#5537` / `#5117`,
  and related delete/clipboard/mobile/perf/collab clusters stay related or
  non-claim until execution proof exists.
- proof gates: focused Slate/Slate React package rows, source DX audit,
  `/examples/synced-blocks` Playwright rows for shared edit, active-copy
  undo/redo, ArrowUp/Down, click outside, placeholder isolation, clipboard/move,
  delete/range delete, selector fanout, memory/DOM pressure, and editable-voids
  regression.
- accepted-plan execution handoff: implement phases in order: content-root slot
  API, active projection identity, Synced Blocks route, navigation/focus proof,
  then regression and sync accounting.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete after revision pass |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete after pass 11 |
| live source grounding complete | source-backed rows cite current owners | complete for planning claims |
| workspace verification recorded | verification workspace gate closed | complete for planning claims; execution behavior proof remains future-gated |
| autoreview clean or N/A | `.agents/skills/autoreview/SKILL.md` loaded and clean for non-trivial uncommitted implementation changes, or N/A with reason | N/A: planning-only, no implementation patch |
| final handoff emitted or lane remains pending | final response / next pass recorded | complete: final handoff outline is filled and final response will summarize it |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md` | final run recorded under Verification evidence |

Findings:
- The answer to "does it render another Editable root per node internally?" is
  yes in React terms, but no in editor-state terms: it should mount another
  `Editable` view over the same runtime root, not create another editor.
- The current lower-level API already does this manually; Synced Blocks should
  make that internal through a content-root slot.
- Same-root multiple projections are the real missing architecture piece.
- The canonical authoring API should be `props.slots.contentRoot(...)`, not
  `<ContentRoot />`, because the slot is renderer-local and can own the hidden
  mechanics without another import.
- Issue-ledger pass found no exact upstream issue that Synced Blocks should
  claim as fixed. The nearest direct risk is identity confusion: `#5874` /
  `#4309` and `#6016` make clear that sharing node objects or editor values is
  not the same as sharing a root key inside one runtime.
- The broader risk set is runtime behavior: placeholder isolation, mobile/IME,
  clipboard/drop, delete/range-delete, collaboration/history, and perf budgets
  all need proof before this becomes implementation-ready.

Decisions and tradeoffs:
- One runtime editor wins. One editor per block stays rejected.
- Synced Blocks should be a normal content-root block renderer, not a default
  void behavior change.
- A shared body root is the canonical sync model. Mirrored roots are not the
  long-term substrate.
- Active projection identity is runtime-local view state, not serialized
  document data.
- Duplicate/copy and unsync belong in the example because they prove the shared
  root model; permissions and workspace sync do not.
- No issue-ledger writes in passes 3-9. Existing ledgers already carry the
  correct related/non-claim stance, and writing duplicate sections would add
  noise.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

External/browser findings:
- User-provided Notion content is treated as product scenario input, not as raw
  Slate requirements. Raw Slate will mimic the local synced editing behavior,
  not Notion permissions or workspace sync.
- ProseMirror/Tiptap are useful because of wrapper/content-slot discipline, not
  because Slate should copy their position model, command chain, or node-view
  API wholesale.
- Lexical's nested composer is an isolated-editor tool. It is explicitly not
  the target substrate for shared Synced Blocks.
- slate-yjs currently assumes one `sharedRoot` per editor; Slate v2 integration
  needs a root-keyed shared type map plus root-qualified selection/history.

Timeline:
- 2026-05-26T08:26:57.567Z Slate Plan goal plan created.
- 2026-05-26T08:33Z Pass 1 live source read completed and initial plan score set
  to 0.74.
- 2026-05-26T09:02Z Pass 2 related issue discovery completed; score moved to
  0.75 and no ledger files were changed because no claim/status changed.
- 2026-05-26T09:34Z Pass 3 full issue-ledger scan completed; score moved to
  0.76 and no ledger files were changed because no claim/status changed.
- 2026-05-26T09:50Z Pass 4 intent/boundary and decision brief completed; score
  moved to 0.78 and the next pass is ecosystem research refresh.
- 2026-05-26T10:19Z Pass 5 ecosystem/live-source refresh completed; score moved
  to 0.82 and the next pass is the performance/DX/migration/regression/
  simplicity pressure pass.
- 2026-05-26T10:48Z Pass 6 pressure pass completed; score moved to 0.85 and the
  next pass is the Slate maintainer objection ledger.
- 2026-05-26T11:07Z Pass 7 maintainer objection ledger completed; score moved
  to 0.87 and the next pass is high-risk deliberate mode.
- 2026-05-26T11:29Z Pass 8 high-risk deliberate mode completed; score moved to
  0.88 and the next pass is the ecosystem maintainer pass.
- 2026-05-26T11:45Z Pass 9 ecosystem maintainer pass completed; score moved to
  0.90 and the next pass is revision.
- 2026-05-26 Pass 10 revision pass completed; score moved to 0.92 and the next
  pass is issue/reference sync accounting.
- 2026-05-26T09:20Z Pass 11 issue/reference sync accounting completed; score
  stayed 0.92 and the next pass is closure score and final gates.
- 2026-05-26T09:31Z Pass 12 closure score and final gates completed; score
  stayed 0.92 and the plan is ready for user review.

Verification evidence:
- `Plate repo root`: read `packages/slate/src/interfaces/editor.ts` for roots,
  root lifecycle, and content-root spec.
- `Plate repo root`: read `packages/slate-react/src/hooks/use-slate-runtime.tsx`
  for mounted root view registry and root-only lookup gap.
- `Plate repo root`: read `packages/slate-react/src/hooks/use-slate-content-root.ts`,
  `use-slate-child-root.ts`, and `use-slate-root-chrome.ts` for current helper
  composition.
- `Plate repo root`: read `site/examples/ts/editable-voids.tsx` for current manual
  root rendering and tx root creation in the example.
- `Plate repo root`: read `packages/slate-react/src/editable/content-root-navigation.ts`
  and `keyboard-input-strategy.ts` for current navigation integration.
- `Plate repo root`: read `playwright/integration/examples/editable-voids.test.ts`
  for existing browser proof floors.
- `plate-2`: read `docs/research/README.md`, `docs/research/index.md`, and
  `docs/research/log.md`; reused the 2026-05-25 content-root plan as prior
  decision context.
- `plate-2`: read `docs/slate-v2/ledgers/issue-coverage-matrix.md:80`,
  `:123`, and `:212` for vertical/content-root claim policy.
- `plate-2`: read `docs/slate-v2/references/pr-description.md:63` for existing
  PR non-claim wording.
- `plate-2`: read `docs/slate-v2/ledgers/fork-issue-dossier.md:100`, `:150`,
  `:235`, and `:780` for content-root, multi-root focus, and shared-node
  identity decisions.
- `plate-2`: read `docs/slate-issues/gitcrawl-live-open-ledger.md:20`, `:22`,
  `:47`, `:111`, `:176`, and `:634` for current generated live rows.
- `plate-2`: read `docs/slate-issues/open-issues-ledger.md:160`, `:484`,
  `:512`, `:588`, `:835`, and `:1150` for current issue/cluster statuses.
- `plate-2`: read `docs/slate-issues/gitcrawl-v2-sync-ledger.md:248`, `:365`,
  `:384`, and `:425` for manual current sync stance.
- `plate-2`: read `docs/slate-issues/issue-clusters.md:59`, `:71`, `:124`,
  `:182`, `:209`, and `:235` for macro issue pressure.
- `plate-2`: read `docs/slate-issues/package-impact-matrix.md:64`, `:75`,
  `:110`, and `:123` for package ownership.
- `plate-2`: read `docs/slate-issues/requirements-from-issues.md:72`, `:106`,
  `:220`, `:247`, `:275`, `:302`, `:326`, and `:401` for requirements.
- `plate-2`: read `docs/slate-issues/benchmark-candidate-map.md:458`, `:488`,
  and `:518` for dirty-path, rerender breadth, and large-document performance
  candidates.
- `plate-2`: read relevant `docs/slate-issues/test-candidate-map/**` rows for
  `#5117`, `#5630`, `#5582`, `#5568`, `#4896`, `#4888`, `#4842`, `#4839`,
  `#4806`, `#4802`, `#5771`, `#3283`, `#3177`, and `#4301`.
- `Plate repo root`: read `packages/slate-react/src/components/editable-text-blocks.tsx:415`,
  `:424`, `:521`, and `:830` for slot ownership and renderer-local context.
- `Plate repo root`: read `packages/slate-react/src/hooks/use-slate-content-root.ts:25`
  and `use-slate-root-chrome.ts:26` for the hook stack the slot should hide.
- `Plate repo root`: read `packages/slate-react/src/hooks/use-element.ts:10` for
  why `<ContentRoot />` component sugar is technically possible but not the
  canonical choice.
- `Plate repo root`: read `site/examples/ts/editable-voids.tsx:227` and `:243`
  for the current manual API that Synced Blocks should stop teaching.
- `plate-2`: read `docs/research/entities/prosemirror.md`,
  `docs/research/entities/tiptap.md`, `docs/research/entities/lexical.md`,
  `docs/research/systems/editor-architecture-landscape.md`, and
  `docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md` for
  accepted cross-editor ownership boundaries.
- `plate-2`: read
  `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md`
  and
  `docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md`
  for runtime-owned shells, selectors, and dirty-commit pressure.
- `../prosemirror-view` and `../prosemirror-state`: read `viewdesc.ts`,
  `transaction.ts`, and `selection.ts` for `NodeView.contentDOM`,
  transaction-owned selection, and bookmark pressure.
- `../react-prosemirror`: read `README.md` and `migration-guides/v2.md` for the
  portal/double-render warning and React-owned render rewrite.
- `../tiptap` / `../tiptap-docs`: read `NodeViewWrapper.tsx`,
  `NodeViewContent.tsx`, `CommandManager.ts`, and command docs for product DX
  and `chain().run()` boundaries.
- `../lexical`: read `LexicalDecoratorNode.ts`, `useReactDecorators.tsx`,
  `LexicalNestedComposer.tsx`, `LexicalUpdates.ts`, and `LexicalUtils.ts` for
  decorator, nested-editor, and dirty-node pressure.
- `../slate-yjs`: read `withYjs.ts`, `withYHistory.ts`, `withCursors.ts`, and
  `position.ts` for one-`sharedRoot` assumptions and relative selection/history
  storage.
- `plate-2`: read Plate `createSlatePlugin`, `createPlatePlugin`,
  `toPlatePlugin`, `pluginInjectNodeProps`, and `pipeInjectNodeProps` sources
  for raw-Slate vs Plate ownership.
- `plate-2`: read prior solution notes for multi-root public DX, rootless
  explicit selections, operation-root middleware, and root chrome clicks.
- `plate-2`: read `performance-oracle`, `performance`, `tdd`, `shadcn`,
  `vercel-react-best-practices`, and `react-useeffect` skill files as planning
  lenses for the applicable implementation-skill matrix.
- `plate-2`: read performance rule files for cohort segmentation, repeated-unit
  budgets, effect/subscription budgets, interaction matrices, memory/DOM tags,
  browser trace boundaries, and native editor behavior.
- `Plate repo root`: read `packages/slate-react/src/hooks/use-editor-selector.tsx:104`
  and `:213` for selector subscription and runtime-id fanout behavior.
- `Plate repo root`: read
  `packages/slate-react/test/provider-hooks-contract.tsx:545`, `:615`, `:946`,
  and `:1079` for current selector fanout and mounted render selector contracts.
- `Plate repo root`: read
  `packages/slate-react/test/content-root-navigation-contract.test.ts:1` for
  existing content-root navigation unit coverage.
- `plate-2`: read
  `docs/solutions/performance-issues/2026-05-23-slate-v2-core-operation-benchmarks-must-not-hide-snapshot-costs.md`
  and
  `docs/solutions/performance-issues/2026-05-12-slate-render-props-should-not-carry-moving-paths.md`
  for benchmark and render-prop performance guardrails.
- `plate-2`: ran
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md`;
  it correctly reported the plan incomplete because later pass rows remained
  pending.
- `Plate repo root`: re-read `packages/slate/src/interfaces/editor.ts:87`,
  `:249`, `:487`, and `:513` for root storage, root lifecycle, void kinds, and
  content-root schema during the maintainer objection pass.
- `Plate repo root`: re-read
  `packages/slate-react/src/components/editable-text-blocks.tsx:415`, `:506`,
  and `:2032` for slot ownership, renderer props, and internal root-bound
  `Editable` wrapping.
- `Plate repo root`: re-read
  `packages/slate-react/src/hooks/use-slate-runtime.tsx:348`, `:386`, and
  `:639` plus `use-slate-history.ts:173` for mounted view sets, root-only
  lookup gap, root-scoped selector gates, and history focus restore.
- `Plate repo root`: re-read `use-slate-content-root.ts:25`,
  `use-slate-child-root.ts:37`, `content-root-navigation.ts:136`, and
  `site/examples/ts/editable-voids.tsx:137` / `:227` for current low-level
  content-root API and example ceremony.
- `../prosemirror-view`, `../react-prosemirror`, `../tiptap`, and
  `../slate-yjs`: re-read the local source slices for `NodeView.contentDOM`,
  React/ProseMirror render-phase hazards, `NodeViewContent`, and current
  one-`sharedRoot` slate-yjs assumptions.
- `Plate repo root`: read `packages/slate-react/src/hooks/use-slate-runtime.tsx:348`,
  `:386`, and `:639`, plus `packages/slate-react/src/hooks/use-slate-history.ts:173`,
  for the wrong-copy focus/high-risk pass.
- `Plate repo root`: read
  `packages/slate-react/src/editable/content-root-navigation.ts:61`, `:136`,
  `:443`, and `:980` plus
  `packages/slate-react/test/content-root-navigation-contract.test.ts:77`,
  `:131`, `:228`, and `:253` for content-root boundary and key filtering risk.
- `Plate repo root`: read
  `playwright/integration/examples/editable-voids.test.ts:379`, `:787`, and
  `:910` for current browser proof floors around keyboard, vertical movement,
  and click-outside behavior.
- `plate-2`: read the prior rootless selection, operation-root middleware,
  multi-root chrome click, and benchmark-helper solution notes for failure
  modes that must not repeat in Synced Blocks execution.
- `Plate repo root`: read
  `packages/slate-react/test/provider-hooks-contract.tsx:545`, `:615`, and
  `:946` for selector fanout and mounted render selector risk.
- `../slate-yjs`: read `withYjs.ts:29`, `:156`, and `:204` for the current
  one-`sharedRoot` assumption that keeps collaboration support as a non-claim.
- `../prosemirror-view`: re-read `viewdesc.ts:31`, `:35`, `:71`, `:81`, and
  `:993` for maintainer pressure around outer chrome, editor-owned content
  slots, event boundaries, and child updates.
- `../prosemirror-state`: re-read `transaction.ts:67` and `selection.ts:436` for
  transaction-owned selection and selection-near/content search pressure.
- `../react-prosemirror`: re-read `README.md:109`, `:117`, and `:215` for
  render-phase purity and view/layout method timing constraints.
- `../tiptap`: re-read `NodeViewWrapper.tsx:10`, `NodeViewContent.tsx:10`, and
  `CommandManager.ts:51` for wrapper/content DX and command-chain boundaries.
- `../lexical`: re-read `DecoratorNode.ts:23`, `LexicalNestedComposer.tsx:33`,
  `LexicalUpdates.ts:243`, and `useReactDecorators.tsx:18` for decorator,
  nested-editor, dirty-node, and external-store pressure.
- `../slate-yjs`: re-read `withYjs.ts:29`, `withYHistory.ts:68`, and
  `withCursors.ts:31` for current single-shared-root, relative history, and
  cursor assumptions.
- `Plate repo root`: re-read `packages/slate-react/src/hooks/use-editor-selector.tsx:104`,
  `:157`, and `:213`, plus `packages/slate-react/src/hooks/use-slate-runtime.tsx:348`,
  `:386`, and `:639`, for React selector/runtime lifecycle constraints.
- `plate-2`: re-read
  `docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md:30`,
  `:60`, `:74`, `:104`, `:117`, and `:131` plus
  `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md:136`
  for the final steal/reject map.
- `plate-2`: reran
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md`
  after pass 9; it correctly reported incomplete because revision,
  issue-sync, closure rows, and final checklist gates remain pending.
- `plate-2`: ran revision scans for stale pending/pass text with
  `rg -n "pending|after pass 9|pass 9|revision|Final user-review|Final completion|Work Checklist|Completion Gates|Weighted score|score >=|TDD used|Browser proof|Verification workspace" docs/plans/2026-05-26-slate-v2-synced-content-roots.md`.
- `plate-2`: re-read this plan's work checklist, completion gates, scorecard,
  final handoff outline, final completion gates, reboot status, and open risks
  before the revision pass.
- `plate-2`: reran
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md`
  after pass 10; it correctly reported incomplete because only issue-sync and
  closure rows remain pending.
- `plate-2`: read issue/reference sync surfaces with `rg` and `nl -ba`:
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, and
  `docs/slate-v2/references/pr-description.md`.
- `plate-2`: updated those four sync/reference files with the Synced Blocks
  planning-sync stance: no new `Fixes`, no new `Improves`, and all reviewed rows
  stay related, unchanged, or non-claim until execution proof exists.
- `plate-2`: reran
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md`
  after pass 11; it correctly reported incomplete because only the closure row
  remains pending.
- `plate-2`: final closure pass set the plan lane state to complete, marked the
  closure phase complete, and prepared the final checker run.
- `plate-2`: final checker passed:
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-synced-content-roots.md`
  returned `[autogoal] complete: docs/plans/2026-05-26-slate-v2-synced-content-roots.md`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure score and final gates are complete. |
| Where am I going? | Await user review or explicit accepted-plan execution invocation. |
| What is the goal? | Close a user-review-ready Synced Blocks / content-root architecture plan, then only implement after explicit acceptance. |
| What have I learned? | The architecture is stable enough for review, and issue accounting matches it: Synced Blocks is related planning pressure only until route/package/browser proof exists. |
| What have I done? | Completed passes 1-12 through closure. The plan meets the score threshold, has filled review handoff content, has synced issue/reference accounting, and records final checker evidence. |

Open risks:
- Current root view lookup can focus the wrong copy when a root has multiple
  mounted projections.
- Existing browser proof covers editable-voids, not the new Synced Blocks route.
- Browser proof still must prove the slot implementation and active projection
  behavior on `/examples/synced-blocks`.
- Browser proof still cannot be claimed until execution adds the route and runs
  the native interaction rows.
