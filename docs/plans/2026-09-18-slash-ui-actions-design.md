---
review_scopes:
  - ui
  - slash
review_basis:
  - 2026-09-18-ui-menu-focus-and-block-insertion-ownership
  - 2026-09-18-slash-command-composition-ownership
work_kind: design
---

# Slash UI action ownership design

Status: In progress

Objective: Produce the complete implementation and proof plan for deleting
caller-owned menu close-focus handshakes, moving matching-empty block reuse into
typed Plate plugin insertion, deleting the copied `transforms.ts` recipe, and
simplifying `slash.tsx` without moving product presentation into a package.

Goal plan: `docs/plans/2026-09-18-slash-ui-actions-design.md`

Template: `docs/plans/templates/task-complex.md`

## Authority and accepted direction

- User authority: “go” after the recorded Best API Review recommended
  `$task design plan slash-ui-actions`.
- Governing reviews:
  - `docs/research/review-records/2026-09-18-ui-menu-focus-and-block-insertion-ownership.json`
  - `docs/research/review-records/2026-09-18-slash-command-composition-ownership.json`
- Output: design only. Product implementation, publication, PR and release are
  outside this pass.
- Workspace: current authorized checkout on branch `next`.
- External research: N/A unless current source cannot settle provider behavior;
  local provider implementations and installed source are authoritative first.
- Timed checkpoint: N/A; the user specified no duration.

## Completion threshold

The design is complete when it names:

- the exact copied menu-adapter API and event ordering for item selection,
  prevented selection, Escape, outside close, radio/checkbox items, nested
  menus and items that open another surface;
- the exact typed Plate insertion API, semantic matching law, Plite boundary,
  inference behavior and authored-insert adoption path;
- every production caller to migrate or retain, including the complete
  `focusEditorRef`, `transforms.ts`, Slash and Insert sets;
- the final `slash.tsx` composition shape and the package/catalog cuts;
- implementation order, break/adoption policy, docs/doctrine effects, proof
  commands, native provider/browser matrix, rollback and residual risks;
- a source-backed final pressure pass with no unresolved material design choice;
- a passing Autogoal plan check and a source-bound design execution record.

## Hard laws and constraints

- Menu dismissal without a selected editor action retains provider-native focus
  behavior. A selected editor action may choose one post-close focus effect.
- The exact editor/view that owns the selected action receives focus; no global
  editor lookup or stale cross-editor closure.
- Prevented item selection keeps the menu open and must not arm a later focus
  effect. Nested menus cannot leak focus intent into their parent.
- Read-only/stale combobox completion performs no edit and no post-edit focus.
- Slash input removal and selected insertion remain one synchronous transaction,
  rollback together, and undo in one step.
- Matching-empty reuse preserves the existing block and its non-construction
  properties; a different empty editable text block may be replaced; a nonempty,
  atom or read-only block remains and receives insertion after it.
- Plite owns structural insertion and empty-source replacement. Plate owns
  plugin identity, construction properties and typed feature operations.
- Type inference is mandatory. Callers do not annotate transaction callback
  parameters or widen plugin payloads.
- Copied source owns labels, icons, keywords, groups, AI membership, optional
  feature selection, focus policy and JSX. No public command catalog or package
  kit is introduced.
- `templates/**` remains untouched. Registry generated output is produced only
  by the owning build command during implementation.

## Bounded source and caller manifest

| Unit | Current owner | Production owners / count | Design disposition |
| --- | --- | --- | --- |
| Item-to-content close focus | Six copied controls plus Base/Radix adapters | More, Mode, List (two menus), Align, Line Height, Insert | Move selected-item final-focus intent into each copied provider adapter; delete caller refs. |
| Content-level `onFinalFocus` | Base/Radix adapters | Block/table/popover cleanup and direct focus cases | Keep as low-level all-close escape hatch. |
| `transforms.ts::insertBlock` | Copied registry helper | Slash: 17 calls; Insert: 13 calls | Delete after typed Plate insertion owns semantic empty handling. |
| Typed plugin element insertion | Plate plugin portal/runtime | Generated and authored plugin insert methods | Extend the canonical operation; preserve inference. |
| Structural block insertion | Plite `blocks.insertAfter` | Plate runtime and feature insert methods | Keep; no semantic plugin matching in Plite. |
| Slash trigger/input | `platejs/slash-command` | Copied Slash renderer | Keep package owner. |
| Atomic input completion | `BaseComboboxPlugin.api.commit` | Slash, mention, emoji and other transient inputs | Keep package owner and callback transaction. |
| Slash catalog | Copied `slash.tsx` | One terminal product owner, 21 items | Keep explicit/local; permit only a lexical inferred factory if it materially reduces repetition. |
| Insert catalog | Copied Insert toolbar | One terminal product owner, partial Slash overlap | Keep separate presentation and async/focus policy. |

Expected bounded units: 9. Reviewed so far: 9. Exclusions: tests, docs,
generated payloads and historical plans are proof/support rather than production
owners. Unresolved design choices are tracked below.

## Decision criteria

- Normal call sites read as plugin-owned user intent, without matcher callbacks.
- The menu adapter removes all six caller refs without making every close focus
  the editor or exposing provider-specific Radix/Base events.
- The insertion API has one truthful semantic meaning across generated element
  inserts and authored block inserts; special cases remain feature-owned.
- The target does not add a second command, catalog, selection, focus or
  transaction authority.
- The migration can be verified at typed package, transaction, copied component,
  generated provider and native browser boundaries.
- Runtime work remains O(1) per selected command and adds no persistent store,
  subscription, registry or document scan.

## Options to resolve

### Menu final focus

1. Always focus from content: rejected by Escape/outside/read-only/secondary UI.
2. Keep caller refs or extract a hook: rejected because the adapter still leaks
   the selected-close lifecycle.
3. Add selected-item final-focus intent to both copied adapters: candidate.

### Typed block insertion

1. Publish the current matcher/callback helper: rejected as accidental registry
   composition and broken inference ownership.
2. Add semantic empty handling to Plite: rejected because Plite lacks plugin and
   construction identity.
3. Add a typed Plate plugin `upsert` operation beside ordinary `insert`: candidate.
4. Add a mode/boolean to `insert`: compare against option soup and semantic
   ambiguity before locking.

### Slash composition

1. Package the whole catalog or a command registry: rejected by product-policy
   ownership.
2. Share one catalog with Insert: rejected by differing labels, grouping,
   membership, async actions and focus.
3. Keep explicit items and optionally use one lexical descriptor factory after
   the typed operation exists: candidate.

## Implementation and proof outline

1. Lock the public call shapes and semantics with source/type probes.
2. Extend Plate runtime types and insertion implementation; adopt authored block
   inserts and focused package/type tests.
3. Extend both copied menu provider adapters and provider-focused component tests.
4. Migrate all six close-focus callers, Slash and Insert; delete `transforms.ts`
   and obsolete tests or relocate surviving laws to their canonical owners.
5. Simplify Slash locally without exporting catalog machinery.
6. Run focused package/registry tests, source typechecks, registry source/build
   gates, generated Base/Radix install checks and native interaction proof.
7. Apply Best API doctrine repair for the reusable Plate API, update the
   smallest durable owner, record execution, render/check the review ledger and
   reconcile behavior law if implementation changes editor behavior.

## Verification surface

- Type/API: Plate type tests for inferred construction payload and availability
  on generated and authored plugin operations.
- Model: focused block insertion and combobox transaction tests, including
  identity/property preservation and one-step undo.
- UI adapter: Base and Radix selected/prevented/Escape/outside/radio/item focus
  cases with exact editor targeting.
- Copied callers: focused More/Mode/List/Align/Line Height/Insert/Slash tests.
- Integration: generated Base/Nova and Radix/Luma complete-editor installs plus
  actual keyboard/pointer interaction for focus and Slash insertion.
- Registry: source checks, dependency generation and `pnpm --filter www
  build:registry` on `next` when registry source changes.
- Closure: source-first Plate/www typechecks, scoped lint, plan checker, ledger
  render/check and explicit limits for any unrelated failing gate.

## Scale and performance

The target adds one ref assignment and one callback lookup per selected menu
item, plus a constant-size comparison of construction-property IDs per block
insertion. It adds no collection growth, document traversal, subscription,
geometry, cache or hot render fan-out. Pre-acceptance Benchmark is N/A if source
inspection confirms those bounds. Implementation must retain this O(1) shape;
otherwise Benchmark becomes required before acceptance.

## Risks and rollback

- Construction-property comparison may misclassify injected variants such as
  lists represented by paragraph nodes. The target needs an explicit feature
  override or owner hook rather than a caller matcher escape hatch.
- Authored `insert` methods create nested structures and may not expose enough
  target identity for a generic generated `upsert`; each current authored owner
  must receive a disposition.
- Provider event order differs. The adapter must arm focus only after an
  unprevented selection and clear it after final focus or remount.
- Async actions such as media URL prompts and Link/Equation UI own their later
  focus and must not receive adapter focus.
- Rollback is one commit/revert of the new API and caller adoption; do not retain
  both `transforms.ts` and the new operation as parallel supported paths.

## Checklists

- [x] User request and plan-only authority captured.
- [x] Governing review scopes and exact immutable records captured.
- [x] Current owner/caller census captured.
- [x] Hard laws, non-goals, proof surface and completion threshold captured.
- [x] Duration, external research, workspace, branch and publication decisions captured.
- [x] Output bounded to scoped searches and capped reads; accidental broad output was truncated and replaced by narrower reads.
- [ ] Exact menu adapter API and event ordering locked.
- [ ] Exact Plate insertion API, matching law and authored-owner dispositions locked.
- [ ] Slash final composition and caller migration table locked.
- [ ] Options, blast radius, adoption order, docs/doctrine and rollback finalized.
- [ ] Final pressure pass completed and findings resolved.
- [ ] Design-only verification and plan checker pass.
- [ ] Design execution record and decision-page reconciliation complete.

## Current verdict

- verdict: accepted direction, exact API pending
- next owner: Task design
- reason: public API, provider lifecycle, caller adoption and proof remain
  coupled across Plate and copied registry source.

## Verification evidence

- Pending final design checks.

## Final handoff contract

- Recommendation: pending exact API lock.
- Evidence: current source, governing reviews and focused type/behavior probes.
- Tests/commands: planning-only checks now; implementation matrix above later.
- Browser proof: required during implementation, not claimed by this design.
- PR/tracker: N/A; not authorized.
- Caveats: global ledger check is currently blocked by unrelated
  `browser/suggestion` inventory drift.
- Next owner after design: `$task` execute the accepted plan.

## Timeline

- 2026-09-18: Goal created from the user's “go”; Task, workflow, complex-work,
  Best API and Plate ownership methods loaded; governing reviews and bounded
  source manifest carried forward.

## Next action

Resolve construction-property matching, authored insert methods and provider
event ordering, then lock the exact public snippets and full migration/proof
matrix.
